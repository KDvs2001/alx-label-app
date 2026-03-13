
import os
import json
import numpy as np
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import random

# make sure sibling package imports work regardless of where the script is run from
# CITATION: sys.path.append() - add a directory to Python's module search path
# SOURCE: Stack Overflow (2010). "Importing files from different folder"
# URL: https://stackoverflow.com/questions/4383571/importing-files-from-different-folder
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utilities.simple_backbone import SimpleBackbone
from cost_engine import AdaptiveCostModel
from models.cal_log_ranker import CALLogRanker
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

# set up logging - basicConfig at the entry point, named logger per module
# CITATION: logging.basicConfig() - configure the root logger with a severity level
# SOURCE: Python Software Foundation (n.d.). "Logging HOWTO"
# URL: https://docs.python.org/3/howto/logging.html
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SimulationServer")

# Flask app instance + enable CORS so the React frontend can call these endpoints
# CITATION: CORS(app) - allow cross-origin requests from the browser
# SOURCE: Stack Overflow (2014). "How to enable CORS in Flask"
# URL: https://stackoverflow.com/questions/25594893/how-to-enable-cors-in-flask
app = Flask(__name__)
CORS(app)

@app.route("/")
def index():
    return jsonify({
        "service": "CAL-Log Simulation Server",
        "status": "running",
        "endpoints": ["/predict", "/annotate", "/reset", "/health",
                      "/spy/selection", "/spy/history", "/spy/metrics", "/spy/task_log"]
    })

# build paths relative to this file so it works in Docker, HuggingFace, or local dev
# CITATION: os.path.dirname(os.path.abspath(__file__)) - get the folder this script lives in
# SOURCE: Stack Overflow (2009). "Find current directory and file's directory"
# URL: https://stackoverflow.com/questions/5137497/find-current-directory-and-files-directory
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# When this runs in a Docker container or HuggingFace Spaces, we can't write to the React client's public folder.
# To make this 100% portable, we just write these telemetry files locally next to the script 
# and expose them via API endpoints so the frontend can poll them safely.
METRICS_PATH = os.path.join(_BASE_DIR, "spy_metrics.json")
HISTORY_PATH = os.path.join(_BASE_DIR, "spy_history.json")
SELECTION_PATH = os.path.join(_BASE_DIR, "spy_selection.json")
TASK_LOG_PATH = os.path.join(_BASE_DIR, "spy_task_log.json")

# singleton state object shared by all route handlers - instantiated once when the server boots.
# flask's dev server is single-threaded so this is safe without locking.
# CITATION: module-level globals in Flask - shared state across request handlers
# SOURCE: Stack Overflow (2015). "Are global variables thread safe in Flask?"
# URL: https://stackoverflow.com/questions/32815451/are-global-variables-thread-safe-in-flask
class SimulationState:
    def __init__(self):
        self.cost_model = AdaptiveCostModel()
        
        # 1. Initialize Backbone
        # We exclusively use SimpleBackbone (TF-IDF + SGD) for the active learning simulation loop.
        # This approach ensures zero cold-start downloads, 100% offline capability, 
        # and eliminates the risk of Out-Of-Memory (OOM) crashes on constrained infrastructure.
        self.backbone = SimpleBackbone(num_labels=2)
        logger.info("Initialized SimpleBackbone (TF-IDF Hashing + SGD) as primary ML model.")

        # 2. Initialize Ranker
        self.ranker = CALLogRanker(self.cost_model)
        
        self.step = 0
        self.steps_since_update = 0
        self.steps_since_train = 0
        self.history = []
        self.interaction_buffer = []  # Buffer to accumulate interactions for cost model update
        self.selected_task_lengths = [] # Track history of selected task lengths

        # Initialize Files (Prevent 404s on Frontend)
        self._init_files()

        # 3. Oracle Setup (The 'Shadow' Competitors)
        # To prove CAL-Log is actually saving money, we secretly run 'Random' and 'Standard Entropy' 
        # strategies in the background at the exact same time. This lets the frontend draw those 
        # comparative graphs in the Spy Window without needing 3 separate human evaluators.
        logger.info("Booting up shadow models for live ROI benchmarking...")
        self.models = {
            'cal_log': self.backbone, 
            'random': SimpleBackbone(num_labels=2),
            'entropy': SimpleBackbone(num_labels=2)
        }
        
        # load the ground truth dataset from disk
        # CITATION: json.load() - deserialise a JSON file into a Python object
        # SOURCE: Stack Overflow (2012). "Reading JSON from a file"
        # URL: https://stackoverflow.com/questions/20199126/reading-json-from-a-file
        self.dataset = []
        self.id_to_label = {}
        try:
            with open("dataset.json", "r") as f:
                raw = json.load(f)
                for i, r in enumerate(raw):
                    # Handle recursive structure (data.text or text)
                    txt = r.get('data', {}).get('text') or r.get('text', "")
                    # Handle label key variation
                    l_str = r.get('true_label') or r.get('label')
                    lbl = 1 if l_str == 'Positive' else 0
                    
                    if txt:
                        self.dataset.append({'id': i, 'text': txt, 'label': lbl})
                        self.id_to_label[i] = lbl
        except Exception as e:
            logger.error(f"Failed to load dataset.json: {e}")

        # HIDDEN TEST SET (First 100 items)
        self.test_set = self.dataset[:100]
        self.pool = self.dataset[100:] 
        
        # pre-calculate length stats so the ranking logic can normalise quickly
        self.all_lengths = [len(d['text'].split()) for d in self.dataset]
        self.max_len = max(self.all_lengths) if self.all_lengths else 0
        # CITATION: np.mean() - compute the arithmetic mean of an array
        # SOURCE: NumPy (n.d.). "numpy.mean"
        # URL: https://numpy.org/doc/stable/reference/generated/numpy.mean.html
        self.avg_len = np.mean(self.all_lengths) if self.all_lengths else 0
        
        # Seed with baseline
        self.accuracy_history = [{'step': 0, 'cal_log': 0.5, 'random': 0.5, 'entropy': 0.5}]
        
        # Cumulative cost tracking per strategy
        self.cumulative_costs = {'cal_log': [], 'entropy': [], 'random': []}

        # ============================================
        # STARTUP PREPROCESSING (runs ONCE on boot)
        # ============================================
        logger.info(f"Preparing pool of {len(self.pool)} tasks...")
        
        # We intentionally skip cosine-similarity text deduplication here.
        # Why? O(N^2) math on 50,000 texts takes almost 40 seconds, which ruins the frontend user experience.
        # Since an evaluator only does about 20-50 tasks per session, the statistical chance 
        # of them hitting a duplicate is functionally zero. A fast boot up is way more important.
        self.clean_pool = list(self.pool)
        
        # shuffle so evaluators don't all see the same order
        # CITATION: random.shuffle() - randomise a list in-place
        # SOURCE: Stack Overflow (2011). "How to randomly shuffle a list in Python"
        # URL: https://stackoverflow.com/questions/976882/shuffling-a-list-of-objects
        random.shuffle(self.clean_pool)
        logger.info(f"Pool ready: {len(self.clean_pool)} tasks")
        
        # 2. PRE-TRAIN backbone on a small seed sample for warm start
        self._pretrain_seed()

    def _deduplicate_pool(self, pool):
        """Run O(N^2) dedup ONCE on startup. Results cached for entire session."""
        # TF-IDF + cosine similarity to catch near-duplicate texts
        # CITATION: TfidfVectorizer - convert text to TF-IDF feature vectors
        # SOURCE: scikit-learn (n.d.). "TfidfVectorizer"
        # URL: https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html
        if len(pool) < 2:
            return pool
        try:
            texts = [d['text'] for d in pool]
            vectorizer = TfidfVectorizer(max_features=500, stop_words='english')
            tfidf_matrix = vectorizer.fit_transform(texts)
            
            # chunked pairwise cosine similarity to avoid O(N^2) memory blow-up.
            # a full 50k x 50k float64 matrix would eat ~18.6 GB of RAM.
            # CITATION: cosine_similarity() - compute pairwise cosine similarity between samples
            # SOURCE: Stack Overflow (2014). "Cosine similarity memory error"
            # URL: https://stackoverflow.com/questions/31523375/sklearn-cosine-similarity-memory-error
            duplicate_indices = set()
            chunk_size = 5000
            n = len(texts)
            
            for start in range(0, n, chunk_size):
                end = min(start + chunk_size, n)
                chunk_sim = cosine_similarity(tfidf_matrix[start:end], tfidf_matrix)
                for i_local in range(end - start):
                    i_global = start + i_local
                    if i_global in duplicate_indices:
                        continue
                    for j in range(i_global + 1, n):
                        if j in duplicate_indices:
                            continue
                        if chunk_sim[i_local][j] > 0.85:
                            duplicate_indices.add(j)
                logger.info(f"  Dedup chunk {start}-{end}/{n} done, {len(duplicate_indices)} dupes found so far")
            
            clean = [task for idx, task in enumerate(pool) if idx not in duplicate_indices]
            return clean
        except Exception as e:
            logger.warning(f"Dedup failed: {e}. Using full pool.")
            return pool

    def _pretrain_seed(self):
        """Pre-train ALL models on a small random sample so predictions are warm from the start."""
        # CITATION: partial_fit() - incremental/online learning with SGDClassifier
        # SOURCE: scikit-learn (n.d.). "SGDClassifier.partial_fit"
        # URL: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.SGDClassifier.html#sklearn.linear_model.SGDClassifier.partial_fit
        try:
            import random
            seed_size = min(200, len(self.clean_pool))
            # grab a random subset of the pool for seeding - without replacement
            # CITATION: random.sample() - pick k items from a list without duplicates
            # SOURCE: Python Software Foundation (n.d.). "random.sample"
            # URL: https://docs.python.org/3/library/random.html#random.sample
            seed = random.sample(self.clean_pool, seed_size)
            # list comprehension to pull out just the text/label fields
            # CITATION: list comprehension - build a list by extracting a key from each dict
            # SOURCE: Stack Overflow (2012). "Extract values from list of dicts"
            # URL: https://stackoverflow.com/questions/7271482/getting-a-list-of-values-from-a-list-of-dicts
            X = [d['text'] for d in seed]
            y = [d['label'] for d in seed]
            if len(set(y)) >= 2:  # Need both classes
                # Train ALL models so shadow comparison has meaningful entropy
                for name, model in self.models.items():
                    model.partial_fit(X, y)
                    logger.info(f"  Pre-trained '{name}' on {seed_size} samples")
                logger.info(f"All models pre-trained on {seed_size} seed samples")
            else:
                logger.warning("Seed sample has only one class, skipping pre-train")
        except Exception as e:
            logger.warning(f"Pre-train failed: {e}")

    def _init_files(self):
        """Write default spy files on startup so the frontend doesn't 404."""
        try:
            # always start fresh for a new user
            initial_history = [{"step": 0, "alpha": 5.0, "beta": 3.0}]
            with open(HISTORY_PATH, "w") as f: 
                json.dump(initial_history, f)
            # .copy() so mutating self.history later doesn't touch the original list
            # CITATION: list.copy() - create a shallow copy to avoid shared references
            # SOURCE: Stack Overflow (2010). "How to clone a list in Python"
            # URL: https://stackoverflow.com/questions/2612802/how-to-clone-or-copy-a-list
            self.history = initial_history.copy()
            logger.info("History reset to initial values (alpha=5.0, beta=3.0)")
            
            if not os.path.exists(SELECTION_PATH):
                with open(SELECTION_PATH, "w") as f: json.dump({}, f)
            if not os.path.exists(METRICS_PATH):
                with open(METRICS_PATH, "w") as f: json.dump({}, f)
        except Exception as e:
            logger.error(f"Failed to init files: {e}")
            self.history = [{"step": 0, "alpha": 5.0, "beta": 3.0}]
        self.selected_task_lengths = [] # Reset length history

state = SimulationState()

# health check endpoint - the frontend polls this to know the server is alive
# CITATION: @app.route() - register a URL rule with Flask's routing system
# SOURCE: Pallets Projects (n.d.). "Flask Quickstart"
# URL: https://flask.palletsprojects.com/en/latest/quickstart/#routing
@app.route('/health', methods=['GET'])
def health():
    # jsonify converts a Python dict to a proper JSON response with headers
    # CITATION: jsonify() - return a Flask JSON response with correct content-type
    # SOURCE: Stack Overflow (2013). "Return JSON response from Flask"
    # URL: https://stackoverflow.com/questions/13081532/how-to-return-json-using-flask
    return jsonify({
        "status": "ok", 
        "alpha": state.cost_model.alpha, 
        "beta": state.cost_model.beta,
        "mode": "Real Research",
        "accuracy_history": getattr(state, 'accuracy_history', [])
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Serve ranked tasks from the SERVER's own pool.
    Client sends only labeled_task_ids (list of IDs already annotated).
    Server picks next batch from its clean_pool, ranks, and returns.
    """
    import random
    
    # accept labeled IDs from client (or legacy task objects for backward compat)
    labeled_ids = set()
    raw_labeled = request.json.get('labeled_task_ids', [])
    # isinstance with a tuple checks multiple types in one call
    # CITATION: isinstance(x, (int, float)) - check if a value is one of several types
    # SOURCE: Stack Overflow (2010). "How to check type in Python"
    # URL: https://stackoverflow.com/questions/152580/whats-the-canonical-way-to-check-for-type-in-python
    for lid in raw_labeled:
        labeled_ids.add(int(lid) if isinstance(lid, (int, float)) else lid)
    
    # Also check for legacy format (tasks array sent from client)
    legacy_tasks = request.json.get('tasks', [])
    
    # Pick source: server pool (new) or client-sent tasks (legacy fallback)
    if legacy_tasks and not state.clean_pool:
        # Legacy fallback: client sent tasks, server has no pool
        normalized_tasks = []
        texts = []
        for i, t in enumerate(legacy_tasks):
            if isinstance(t, str):
                row = {'taskId': i, 'text': t}
            else:
                txt = t.get('data', {}).get('text') or t.get('text', "")
                tid = t.get('id', i)
                row = {'taskId': tid, 'text': txt}
            normalized_tasks.append(row)
            texts.append(row['text'])
    else:
        # Server-side task selection from deduplicated pool
        # Filter out already-labeled tasks
        available = [t for t in state.clean_pool if t['id'] not in labeled_ids]
        
        if not available:
            logger.warning("All tasks have been labeled!")
            return jsonify({'tasks': [], 'shadow_metrics': None, 'pool_exhausted': True})
        
        # Select CANDIDATE batch (200) for ranking - Best balance between research accuracy and <5s latency
        batch_size = min(200, len(available))
        candidates = available[:batch_size]
        
        normalized_candidates = [{'taskId': t['id'], 'text': t['text']} for t in candidates]
    
    if not normalized_candidates:
        return jsonify({'tasks': [], 'shadow_metrics': None})
    
    # clean up whitespace and strip special chars before feeding to the model
    # CITATION: re.sub() - regex-based find-and-replace in strings
    # SOURCE: Python Software Foundation (n.d.). "re.sub"
    # URL: https://docs.python.org/3/library/re.html#re.sub
    def preprocess_text(text):
        text = re.sub(r'\s+', ' ', text).strip()
        text = re.sub(r'[^a-zA-Z0-9\s.,!?\'\-]', '', text)
        return text
    
    # Process only exactly what we need
    for task in normalized_candidates:
        task['text'] = preprocess_text(task['text'])
    texts = [task['text'] for task in normalized_candidates]
    
    # Get Probs & Rank (on candidates)
    probs = state.backbone.predict_proba(texts)
    ranked_candidates = state.ranker.rank_by_cal_log(normalized_candidates, probs)
    
    # Client gets top 25 (improves React rendering latency as well)
    ranked_results = ranked_candidates[:25]
    
    if not ranked_results: return jsonify({'tasks': [], 'shadow_metrics': None})

    # ---------------------------------------------------------
    # SHADOW SIMULATION: The 'What-If' Scenario Generator
    # ---------------------------------------------------------
    # We figure out what tasks the *other* inferior algorithms would have picked if they were in charge,
    # so we can calculate exactly how much extra time they would have wasted.
    cal_log_picks = ranked_candidates[:3]
    
    # Entropy (Shuffle first to break length bias)
    pool_for_entropy = ranked_candidates.copy()
    random.shuffle(pool_for_entropy) 
    entropy_picks = sorted(pool_for_entropy, key=lambda x: x['transparency_report']['math_proof']['entropy'], reverse=True)[:3]
    
    # random sample 3 from all candidates for the "Random" baseline
    # CITATION: random.sample() - pick k items from a list without replacement
    # SOURCE: Python Software Foundation (n.d.). "random.sample"
    # URL: https://docs.python.org/3/library/random.html#random.sample
    random_picks = random.sample(ranked_candidates, min(3, len(ranked_candidates)))

    # 2. Metric Calculator Helper (Optimized for speed)
    def calc_metrics(picks):
        avg_len = 0
        avg_cost = 0
        avg_entropy = 0
        audit_data = []
        n_picks = max(1, len(picks))
        
        for p in picks:
            length = len(p['text'].split())
            avg_len += length
            entropy_val = p['transparency_report']['math_proof']['entropy']
            avg_entropy += entropy_val
            
            # Use cached cost instead of recalculating if available
            if 'cost_analysis' in p['transparency_report']:
                cost = p['transparency_report']['cost_analysis']['predicted_seconds']
            else:
                # np.log1p(x) = ln(1+x), more precise than log(1+x) when x is small
                # CITATION: np.log1p() - natural log of (1 + x) with better precision near zero
                # SOURCE: NumPy (n.d.). "numpy.log1p"
                # URL: https://numpy.org/doc/stable/reference/generated/numpy.log1p.html
                log_len = np.log1p(length)
                cost = state.cost_model.alpha + (state.cost_model.beta * log_len)
            avg_cost += cost
            
            audit_data.append({
                'id': p['id'],
                'text': p['text'][:40] + "...",
                'len': length,
                'entropy': entropy_val
            })
        
        final_avg_cost = avg_cost / n_picks
        final_avg_entropy = avg_entropy / n_picks
        # information efficiency = entropy resolved per second of annotation time.
        # max(cost, 0.1) guards against division by zero when cost data is missing
        # CITATION: max() - clamp a value to avoid division-by-zero edge cases
        # SOURCE: Stack Overflow (2009). "Avoiding division by zero in Python"
        # URL: https://stackoverflow.com/questions/27317517/avoiding-division-by-zero-in-python
        info_efficiency = round(final_avg_entropy / max(final_avg_cost, 0.1), 4)
            
        return {
            "avg_len": round(avg_len / n_picks, 1),
            "estimated_cost": round(final_avg_cost, 1),
            "avg_entropy": round(final_avg_entropy, 4),
            "info_efficiency": info_efficiency,
            "selected_ids": [p['id'] for p in picks],
            "audit_trail": audit_data
        }

    shadow_metrics = {
        "cal_log": calc_metrics(cal_log_picks),
        "entropy": calc_metrics(entropy_picks),
        "random": calc_metrics(random_picks)
    }

    # Store which tasks the shadow strategies would have picked so the
    # /annotate route can feed them their ground-truth labels for retraining.
    # Without this, shadow models never learn and the comparison is invalid.
    state.last_shadow_picks = {
        'random': random_picks[0] if random_picks else None,
        'entropy': entropy_picks[0] if entropy_picks else None
    }
    
    # Track cumulative costs per strategy
    state.cumulative_costs['cal_log'].append(shadow_metrics['cal_log']['estimated_cost'])
    state.cumulative_costs['entropy'].append(shadow_metrics['entropy']['estimated_cost'])
    state.cumulative_costs['random'].append(shadow_metrics['random']['estimated_cost'])

    # work out what percentile the top-ranked task's length falls in.
    # sum([1 for x if ...]) / len gives us a quick percentile rank without numpy.
    # CITATION: percentile rank - proportion of values below a threshold
    # SOURCE: Stack Overflow (2012). "Calculate percentile rank in Python"
    # URL: https://stackoverflow.com/questions/12414043/map-each-list-value-to-its-corresponding-percentile
    top = ranked_results[0]
    t_len = len(top['text'].split())
    pct = sum([1 for x in state.all_lengths if x < t_len]) / len(state.all_lengths) * 100 if state.all_lengths else 50
    
    reading_pattern = state.cost_model.get_reading_pattern()
    
    if pct < 33:
        length_class, length_desc = "short", "shorter than 67% of dataset"
    elif pct < 67:
        length_class, length_desc = "medium", "medium length (33-67 percentile)"
    else:
        length_class, length_desc = "long", "longer than 67% of dataset"

    avg_prev = np.mean(state.selected_task_lengths[-10:]) if state.selected_task_lengths else 0
    if state.selected_task_lengths and t_len > avg_prev * 1.5:
        rel_desc = f"(Significant Increase! Prev Avg: {int(avg_prev)}w)"
    elif state.selected_task_lengths and t_len < avg_prev * 0.6:
        rel_desc = f"(Significant Decrease! Prev Avg: {int(avg_prev)}w)"
    else:
        rel_desc = ""
        
    state.selected_task_lengths.append(t_len)
    
    if reading_pattern['pattern'] == 'fast_skimmer':
        pattern_reasoning = f"velocity_profile='Fast Skimmer' (beta={reading_pattern['beta']:.2f} < {reading_pattern['baseline_beta']}). Length penalty reduced. Prioritizing longer, high-entropy tasks for maximum Information/Sec."
    elif reading_pattern['pattern'] == 'careful_reader':
        pattern_reasoning = f"velocity_profile='Careful Reader' (beta={reading_pattern['beta']:.2f} > {reading_pattern['baseline_beta']}). Length penalty increased. Selecting shorter high-entropy tasks to maximize throughput."
    elif reading_pattern['pattern'] == 'balanced':
        pattern_reasoning = f"velocity_profile='Balanced' (beta={reading_pattern['beta']:.2f} ~ {reading_pattern['baseline_beta']}). Standard Entropy Sampling with Baseline Cost constraint."
    else:
        pattern_reasoning = "Acquiring velocity profile..."
    
    spy_data = {
        "selected_task_id": top['id'],
        "score": top['score'],
        "entropy": top['transparency_report']['math_proof']['entropy'],
        "cost": top['transparency_report']['cost_analysis']['predicted_seconds'],
        "alpha": state.cost_model.alpha,
        "beta": state.cost_model.beta,
        "reasoning": f"Score ({top['score']:.3f}) = Entropy ({top['transparency_report']['math_proof']['entropy']:.3f}) / Cost ({top['transparency_report']['cost_analysis']['predicted_seconds']:.1f}s) - where Cost = alpha({state.cost_model.alpha:.1f}) + beta({state.cost_model.beta:.2f}) * log(1+L)",
        "task_stats": {
            "length": t_len,
            "percentile": round(pct, 1),
            "max_len": state.max_len,
            "avg_len": round(state.avg_len, 1),
            "length_class": length_class,
            "length_description": length_desc
        },
        "reading_pattern": reading_pattern,
        "pattern_reasoning": pattern_reasoning
    }
    # persist the spy selection data and append to the task log
    # CITATION: json.dump() - serialise dict/list to a JSON file
    # SOURCE: Python Software Foundation (n.d.). "json.dump"
    # URL: https://docs.python.org/3/library/json.html#json.dump
    try:
        with open(SELECTION_PATH, "w") as f: json.dump(spy_data, f)
        
        new_log_entry = {
            "step": state.step,
            "selected_id": top['id'],
            "length": t_len,
            "cost": top['transparency_report']['cost_analysis']['predicted_seconds'],
            "beta": state.cost_model.beta,
            "timestamp": "auto_generated" 
        }
        
        existing_logs = []
        # check if the log file already exists before trying to read it
        # CITATION: os.path.exists() - test whether a path exists on disk
        # SOURCE: Stack Overflow (2011). "Check if file exists in Python"
        # URL: https://stackoverflow.com/questions/82831/how-do-i-check-whether-a-file-exists-without-exceptions
        if os.path.exists(TASK_LOG_PATH):
            try:
                with open(TASK_LOG_PATH, "r") as f:
                    existing_logs = json.load(f)
            except: pass
        
        existing_logs.append(new_log_entry)
        
        with open(TASK_LOG_PATH, "w") as f:
            json.dump(existing_logs, f)
    except: pass

    # Build response with full task objects (for client to display)
    response_tasks = []
    for res in ranked_results:
        task_id = res['id']
        # find the original task object from the pool by ID.
        # next() with a generator stops as soon as it finds the first match (lazy).
        # CITATION: next() with generator - get the first item matching a condition
        # SOURCE: Stack Overflow (2010). "Find first element matching condition"
        # URL: https://stackoverflow.com/questions/2361426/get-the-first-item-from-an-iterable-that-matches-a-condition
        original = next((t for t in state.clean_pool if t['id'] == task_id), None)
        if original:
            response_tasks.append({
                'id': original['id'],
                'data': {'text': original['text']},
                'true_label': None  # Don't leak ground truth to client
            })
    
    return jsonify({
        "tasks": response_tasks,
        "shadow_metrics": shadow_metrics,
        "pool_remaining": len([t for t in state.clean_pool if t['id'] not in labeled_ids])
    })

@app.route('/spy/selection', methods=['GET'])
def get_spy_selection():
    """Return the last selected task reasoning (replaces spy_selection.json)"""
    # Try to read from file first (if persisted by recent predict)
    if os.path.exists(SELECTION_PATH):
        try:
            with open(SELECTION_PATH, "r") as f:
                return jsonify(json.load(f))
        except: pass
    return jsonify({})

@app.route('/spy/history', methods=['GET'])
def get_spy_history():
    """Return the history of alpha/beta updates (replaces spy_history.json)"""
    return jsonify(state.history)

@app.route('/spy/metrics', methods=['GET'])
def get_spy_metrics():
    """Return the accuracy history (replaces spy_metrics.json)"""
    return jsonify({
        "accuracy_history": state.accuracy_history,
        "step": state.step,
        "alpha": state.cost_model.alpha,
        "beta": state.cost_model.beta,
        "cumulative_costs": {
            # dict.get() with a default empty list so this doesn't crash if a key is missing
            # CITATION: dict.get(key, default) - safe dictionary access without KeyError
            # SOURCE: Stack Overflow (2012). "Get a default value from a dict"
            # URL: https://stackoverflow.com/questions/11041405/why-dict-getkey-instead-of-dictkey
            "cal_log": sum(state.cumulative_costs.get('cal_log', [])),
            "entropy": sum(state.cumulative_costs.get('entropy', [])),
            "random": sum(state.cumulative_costs.get('random', [])),
            "history": [
                {
                    "batch": i + 1,
                    "cal_log": round(sum(state.cumulative_costs['cal_log'][:i+1]), 1),
                    "entropy": round(sum(state.cumulative_costs['entropy'][:i+1]), 1),
                    "random": round(sum(state.cumulative_costs['random'][:i+1]), 1)
                }
                for i in range(len(state.cumulative_costs.get('cal_log', [])))
            ]
        }
    })

@app.route('/spy/task_log', methods=['GET'])
def get_spy_task_log():
    """Return the persistent task log"""
    if os.path.exists(TASK_LOG_PATH):
        try:
            with open(TASK_LOG_PATH, "r") as f:
                return jsonify(json.load(f))
        except: pass
    return jsonify([])

@app.route('/annotate', methods=['POST'])
def annotate():
    # parse the JSON body sent by the React frontend
    # CITATION: request.json - access the parsed JSON body of a Flask POST request
    # SOURCE: Stack Overflow (2013). "Get POST body as JSON in Flask"
    # URL: https://stackoverflow.com/questions/10434599/get-the-data-received-in-a-flask-request
    data = request.json
    text = data.get('text', "")
    label = data.get('label')
    time_taken = data.get('time_taken', 1.0)
    
    state.step += 1
    state.steps_since_update += 1
    state.steps_since_train += 1
    
    # We update the Cognitive Cost Model incrementally.
    # By logging the exact time it took them to read this specific text length,
    # our alpha/beta parameters dynamically shift to match their current physical fatigue level.
    interaction = {'text': text, 'length': len(text.split()), 'time_seconds': time_taken}
    state.interaction_buffer.append(interaction)  # Keep rolling history
    
    if state.steps_since_update >= 5:
        logger.info(f"Updating Cost Model with {len(state.interaction_buffer)} interactions (rolling)...")
        state.cost_model.update(state.interaction_buffer)  # Pass full rolling history
        state.steps_since_update = 0
        # Do not clear interaction_buffer, cost_engine uses a rolling window
        # of the last 5 internally. Keeping the full buffer ensures continuity.
        logger.info(f"Cost Model Updated - Current values: alpha={state.cost_model.alpha:.2f}, beta={state.cost_model.beta:.2f}")
        try:
            state.history.append({"step": state.step, "alpha": state.cost_model.alpha, "beta": state.cost_model.beta})
            with open(HISTORY_PATH, "w") as f: json.dump(state.history, f)
        except Exception as e:
            logger.warning(f"Failed to persist cost model history: {e}")

    # STORE GHOST LABELS
    # getattr with a default lets us safely access buffers that might not exist yet
    # CITATION: getattr(obj, name, default) - safe attribute access with fallback
    # SOURCE: Stack Overflow (2010). "What is getattr exactly and how do I use it?"
    # URL: https://stackoverflow.com/questions/4075190/what-is-getattr-exactly-and-how-do-i-use-it
    if hasattr(state, 'last_shadow_picks'):
        # Random Choice
        rnd_task = state.last_shadow_picks['random']
        rnd_lbl = state.id_to_label.get(rnd_task['id'], 0) 
        state.pending_labels_random = getattr(state, 'pending_labels_random', []) + [(rnd_task['text'], rnd_lbl)]
        
        # Entropy Choice
        ent_task = state.last_shadow_picks['entropy']
        ent_lbl = state.id_to_label.get(ent_task['id'], 0)
        state.pending_labels_entropy = getattr(state, 'pending_labels_entropy', []) + [(ent_task['text'], ent_lbl)]
    
    # BUFFER USER LABELS
    # Convert label to integer: 'Positive' -> 1, 'Negative' -> 0
    label_int = 1 if label == 'Positive' else 0
    state.pending_labels_cal_log = getattr(state, 'pending_labels_cal_log', []) + [(text, label_int)]

    # Retrain Cycle (Every 5 - SYNCED with Alpha/Beta updates)
    trained = False
    if state.steps_since_train >= 5:
        logger.info("Retraining ALL Models...")
        
        # helper to train one model and clear its buffer
        # CITATION: setattr(obj, name, value) - dynamically set an attribute by name
        # SOURCE: Stack Overflow (2011). "Use of setattr in Python"
        # URL: https://stackoverflow.com/questions/7604636/use-of-setattr-in-python
        def commit_train(name, buffer_name):
            data = getattr(state, buffer_name, [])
            if not data:
                logger.warning(f"   No data for {name} model")
                return
            X = [d[0] for d in data]
            y = [d[1] for d in data]
            logger.info(f"   Training {name}: {len(X)} samples, labels: {set(y)}")
            # incremental training via partial_fit (online learning)
            # CITATION: partial_fit() - train incrementally without reprocessing old data
            # SOURCE: scikit-learn (n.d.). "SGDClassifier"
            # URL: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.SGDClassifier.html
            state.models[name].partial_fit(X, y)
            setattr(state, buffer_name, [])
            
        try:
            commit_train('cal_log', 'pending_labels_cal_log')
            commit_train('random', 'pending_labels_random')
            commit_train('entropy', 'pending_labels_entropy')
            trained = True
            logger.info("All models retrained successfully")
        except Exception as e:
            logger.error(f"Training failed: {e}")
            # dump the full stack trace so we can actually debug it
            # CITATION: traceback.format_exc() - capture exception traceback as a string
            # SOURCE: Stack Overflow (2011). "Logging exception with traceback in Python"
            # URL: https://stackoverflow.com/questions/1483429/how-do-i-print-an-exception-in-python
            import traceback
            logger.error(traceback.format_exc())

        
        # VALIDATION PHASE
        scores = {}
        X_test = [t['text'] for t in state.test_set]
        y_test = [t['label'] for t in state.test_set]
        
        # run predictions against the held-out test set and compare with zip
        # CITATION: zip() - iterate over two lists in parallel for element-wise comparison
        # SOURCE: Stack Overflow (2009). "Iterate over two lists in parallel"
        # URL: https://stackoverflow.com/questions/1663807/how-to-iterate-through-two-lists-in-parallel
        for name, model in state.models.items():
            try:
                preds = model.predict(X_test)
                acc = np.mean([1 if p == y else 0 for p, y in zip(preds, y_test)])
                scores[name] = round(acc, 3)
            except Exception as e:
                logger.warning(f"Validation failed for '{name}': {e}")
                scores[name] = 0.5
            
        
        scores['step'] = state.step
        state.accuracy_history.append(scores)
        
        # persist accuracy and cost data so the frontend can poll it
        # CITATION: json.dump() - serialise a Python dict straight into a file
        # SOURCE: Stack Overflow (2012). "Writing JSON to a file in Python"
        # URL: https://stackoverflow.com/questions/12309269/how-do-i-write-json-data-to-a-file
        try:
            metrics_data = {
                "accuracy_history": state.accuracy_history,
                "step": state.step,
                "alpha": state.cost_model.alpha,
                "beta": state.cost_model.beta
            }
            with open(METRICS_PATH, "w") as f:
                json.dump(metrics_data, f)
            logger.info(f"Metrics written to file: step={state.step}, alpha={state.cost_model.alpha:.2f}, beta={state.cost_model.beta:.2f}")
        except Exception as e:
            logger.error(f"Failed to write metrics: {e}")
        
        state.steps_since_train = 0
        trained = True
        
    return jsonify({
        "status": "ok", 
        "alpha": state.cost_model.alpha,
        "beta": state.cost_model.beta, 
        "trained": trained
    })

@app.route('/reset', methods=['POST'])
def reset_session():
    """Reset ALL state for a new contestant, complete fresh start."""
    try:
        # 1. Reset cost model to cold-start defaults
        state.cost_model = AdaptiveCostModel()
        state.ranker = CALLogRanker(state.cost_model)
        
        # 2. Re-initialize backbone models (fresh weights, no previous training)
        state.backbone = SimpleBackbone(num_labels=2)
        state.models = {
            'cal_log': state.backbone,
            'random': SimpleBackbone(num_labels=2),
            'entropy': SimpleBackbone(num_labels=2)
        }
        
        # 3. Re-pretrain on seed sample for warm start
        state._pretrain_seed()
        
        # 4. Reset all counters
        state.step = 0
        state.steps_since_update = 0
        state.steps_since_train = 0
        state.selected_task_lengths = []
        
        # 5. Clear all buffers
        state.interaction_buffer = []
        state.pending_labels_cal_log = []
        state.pending_labels_random = []
        state.pending_labels_entropy = []
        # hasattr check before del to avoid AttributeError if it was never set
        # CITATION: hasattr() + del - safely remove a dynamic attribute from an object
        # SOURCE: Stack Overflow (2010). "How to delete an attribute from an object"
        # URL: https://stackoverflow.com/questions/2118951/how-can-i-delete-a-variable-in-python
        if hasattr(state, 'last_shadow_picks'):
            del state.last_shadow_picks
        
        # 6. Reset history to initial state
        state.history = [{"step": 0, "alpha": 5.0, "beta": 3.0}]
        state.accuracy_history = [{'step': 0, 'cal_log': 0.5, 'random': 0.5, 'entropy': 0.5}]
        state.cumulative_costs = {'cal_log': [], 'entropy': [], 'random': []}
        
        # 7. Clear all spy files
        for fpath in [HISTORY_PATH, METRICS_PATH, SELECTION_PATH, TASK_LOG_PATH]:
            try:
                if fpath == HISTORY_PATH:
                    with open(fpath, "w") as f:
                        json.dump(state.history, f)
                elif fpath == METRICS_PATH:
                    with open(fpath, "w") as f:
                        json.dump({
                            "accuracy_history": state.accuracy_history,
                            "step": 0, "alpha": 5.0, "beta": 3.0
                        }, f)
                else:
                    with open(fpath, "w") as f:
                        json.dump([] if fpath == TASK_LOG_PATH else {}, f)
            except: pass
        
        # 8. Re-shuffle pool for variety
        import random
        random.shuffle(state.clean_pool)
        
        logger.info("FULL SESSION RESET: fresh backbone, cost model, shuffled pool, and history for new contestant")
        
        return jsonify({
            "status": "ok",
            "message": "Session fully reset",
            "alpha": 5.0,
            "beta": 3.0
        })
    except Exception as e:
        logger.error(f"Failed to reset session: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    # host='0.0.0.0' makes the server reachable outside the container.
    # PORT comes from the environment so Docker/HuggingFace can override it.
    # CITATION: app.run(host='0.0.0.0') - bind Flask to all network interfaces
    # SOURCE: Stack Overflow (2015). "Deploying Flask app to Docker"
    # URL: https://stackoverflow.com/questions/30323224/deploying-a-flask-app-to-docker-flask-is-not-externally-visible
    # CITATION: os.environ.get() - read an env var with a fallback default
    # SOURCE: Stack Overflow (2013). "How to use environment variables in Python"
    # URL: https://stackoverflow.com/questions/4906977/how-to-access-environment-variable-values
    port = int(os.environ.get("PORT", 9090))
    logger.info(f"Simulation Server starting on port {port}...")
    app.run(host='0.0.0.0', port=port)
