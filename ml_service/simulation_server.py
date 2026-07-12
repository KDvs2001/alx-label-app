
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
from difficulty_model import (
    OBSERVATIONS_PATH,
    bootstrap_cost_labels,
    estimate_priors_from_observations,
    load_dataset_sample,
    load_observations,
    record_annotation_observation,
    read_jsonl,
    train_self_trained_model,
    write_jsonl,
)
from prior_engine import estimate_cost_priors, load_priors, save_priors
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
        "endpoints": ["/predict", "/annotate", "/reset", "/health", "/session/init-priors", "/session/train-cost-model",
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


def build_cost_model():
    use_priors = str(os.environ.get("CALLOG_USE_SESSION_PRIORS", "0")).lower() in {"1", "true", "yes"}
    priors = load_priors() if use_priors else {}
    return AdaptiveCostModel(
        alpha_prior=priors.get("alpha_prior"),
        beta_prior=priors.get("beta_prior"),
    )

# singleton state object shared by all route handlers - instantiated once when the server boots.
# flask's dev server is single-threaded so this is safe without locking.
# CITATION: module-level globals in Flask - shared state across request handlers
# SOURCE: Stack Overflow (2015). "Are global variables thread safe in Flask?"
# URL: https://stackoverflow.com/questions/32815451/are-global-variables-thread-safe-in-flask
class SimulationState:
    def __init__(self):
        self.cost_model = build_cost_model()
        
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
        self.labeled_ids = set() # Track all task IDs labeled manually or automatically
        self.last_bg_auto_labeled_count = 0
        self.round_size = 10
        self.verification_queue = {} # Maps taskId (int) -> dict of task details (text, label, confidence, etc.)
        self.auto_label_threshold = 0.95
        self.auto_label_threshold_mode = 'dynamic'
        self.cognitive_pacing_active = False
        self.baseline_beta = None

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
            initial_history = [{"step": 0, "alpha": self.cost_model.alpha, "beta": self.cost_model.beta}]
            with open(HISTORY_PATH, "w") as f: 
                json.dump(initial_history, f)
            # .copy() so mutating self.history later doesn't touch the original list
            # CITATION: list.copy() - create a shallow copy to avoid shared references
            with open(HISTORY_PATH, "w") as f: 
                json.dump(initial_history, f)
            # .copy() so mutating self.history later doesn't touch the original list
            # CITATION: list.copy() - create a shallow copy to avoid shared references
            # SOURCE: Stack Overflow (2010). "How to clone a list in Python"
            # URL: https://stackoverflow.com/questions/2612802/how-to-clone-or-copy-a-list
            self.history = initial_history.copy()
            logger.info(f"History reset to initial values (alpha={self.cost_model.alpha:.2f}, beta={self.cost_model.beta:.2f})")
            
            if not os.path.exists(SELECTION_PATH):
                with open(SELECTION_PATH, "w") as f: json.dump({}, f)
            if not os.path.exists(METRICS_PATH):
                with open(METRICS_PATH, "w") as f: json.dump({}, f)
        except Exception as e:
            logger.error(f"Failed to init files: {e}")
            self.history = [{"step": 0, "alpha": 5.0, "beta": 3.0}]
        self.selected_task_lengths = [] # Reset length history

state = SimulationState()

def get_label_index(label_val):
    """Dynamically map a label string or value to its integer index using state.custom_labels."""
    custom_labels = getattr(state, 'custom_labels', ["Negative", "Positive"])
    if label_val in custom_labels:
        return custom_labels.index(label_val)
    # If it is already an int or can be cast, return it
    try:
        val_int = int(label_val)
        if 0 <= val_int < len(custom_labels):
            return val_int
    except (ValueError, TypeError):
        pass
    # Fallback to standard Positive/Negative mapping
    if str(label_val).strip().lower() == 'positive':
        return 1
    return 0


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
    
    ece_val = 0.0
    last_bg_auto_labeled_count = 0
    verification_queue_list = list(state.verification_queue.values())
    pool_remaining = len([t for t in state.clean_pool if t['id'] not in state.labeled_ids and t['id'] not in state.verification_queue])
    
    if os.path.exists(METRICS_PATH):
        try:
            with open(METRICS_PATH, "r") as f:
                mData = json.load(f)
                ece_val = mData.get("ece", 0.0)
                last_bg_auto_labeled_count = mData.get("last_bg_auto_labeled_count", 0)
        except: pass

    return jsonify({
        "status": "ok", 
        "alpha": state.cost_model.alpha, 
        "beta": state.cost_model.beta,
        "prior_source": state.cost_model.alpha_prior_source,
        "semantic_cost": {
            "enabled": state.cost_model.use_semantic_cost,
            "gamma": state.cost_model.gamma,
            "model": state.cost_model.difficulty_model.metadata()
        },
        "mode": "Real Research",
        "accuracy_history": getattr(state, 'accuracy_history', []),
        "ece": ece_val,
        "last_bg_auto_labeled_count": last_bg_auto_labeled_count,
        "pool_remaining": pool_remaining,
        "pool_total": len(state.pool) if hasattr(state, 'pool') else 1000,
        "verification_queue": verification_queue_list,
        "auto_label_threshold": getattr(state, 'auto_label_threshold', 0.95),
        "cognitive_pacing_active": getattr(state, 'cognitive_pacing_active', False),
        "baseline_beta": getattr(state, 'baseline_beta', None)
    })

@app.route('/session/init-priors', methods=['POST'])
def init_priors():
    """Local cold-start prior estimation from previous sessions or corpus bootstrap features."""
    payload = request.json or {}
    limit = int(payload.get("sample_size", 300))
    persist = bool(payload.get("persist", True))
    apply_to_session = bool(payload.get("apply", True))
    min_observations = int(payload.get("min_observations", 20))

    observations = load_observations()
    if len(observations) >= min_observations:
        priors = estimate_priors_from_observations(observations)
    else:
        texts = payload.get("texts")
        if texts:
            records = [{"id": idx, "text": str(text), "label": None} for idx, text in enumerate(texts[:limit])]
        else:
            records = load_dataset_sample(limit=limit)
        labels = bootstrap_cost_labels(records)
        priors = estimate_cost_priors(records, labels)
        priors["source"] = "transparent_corpus_bootstrap"
        priors["observation_count"] = len(observations)
    if persist:
        save_priors(priors)
    if apply_to_session:
        state.cost_model.set_priors(priors["alpha_prior"], priors["beta_prior"], source=priors["source"])
        state.ranker = CALLogRanker(state.cost_model)
        state.history = [{"step": state.step, "alpha": state.cost_model.alpha, "beta": state.cost_model.beta}]
        try:
            with open(HISTORY_PATH, "w") as f:
                json.dump(state.history, f)
        except Exception:
            pass

    return jsonify(priors)

@app.route('/session/train-cost-model', methods=['POST'])
def train_cost_model():
    """Train the local semantic difficulty model from accumulated annotation observations."""
    payload = request.json or {}
    imported = payload.get("observations") or []
    if imported:
        existing = load_observations()
        write_jsonl(OBSERVATIONS_PATH, existing + imported)

    observations = load_observations()
    if len(observations) < int(payload.get("min_observations", 20)):
        return jsonify({
            "status": "insufficient_data",
            "observations": len(observations),
            "required": int(payload.get("min_observations", 20)),
            "message": "Collect more annotation sessions, then train again."
        }), 400

    priors = estimate_priors_from_observations(observations)
    save_priors(priors)
    metrics = train_self_trained_model(observations)

    state.cost_model.set_priors(priors["alpha_prior"], priors["beta_prior"], source=priors["source"])
    state.cost_model.difficulty_model = state.cost_model.difficulty_model.__class__()
    state.ranker = CALLogRanker(state.cost_model)
    return jsonify({"status": "ok", "priors": priors, "difficulty_model": metrics})

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
        available = [t for t in state.clean_pool if t['id'] not in labeled_ids and t['id'] not in state.verification_queue]
        
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
    ranked_candidates = state.ranker.rank_by_cal_log(normalized_candidates, probs, pacing_mode=state.cognitive_pacing_active)
    
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
        "reasoning": f"Score ({top['score']:.3f}) = Entropy ({top['transparency_report']['math_proof']['entropy']:.3f}) / Cost ({top['transparency_report']['cost_analysis']['predicted_seconds']:.1f}s) - where Cost = alpha({state.cost_model.alpha:.1f}) + beta({state.cost_model.beta:.2f}) * log(1+L) + semantic_penalty({top['transparency_report']['cost_analysis'].get('semantic_penalty', 0.0):.2f})",
        "semantic_cost": {
            "enabled": top['transparency_report']['cost_analysis'].get('semantic_enabled', False),
            "difficulty": top['transparency_report']['cost_analysis'].get('semantic_difficulty', 0.0),
            "penalty": top['transparency_report']['cost_analysis'].get('semantic_penalty', 0.0),
            "gamma": top['transparency_report']['cost_analysis'].get('gamma', 0.0)
        },
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

import threading

# Thread-safety lock to serialize background training and evaluations
training_lock = threading.Lock()

def bg_train_worker(cal_log_data, random_data, entropy_data, test_set, current_step, alpha, beta):
    """Worker function to train active learning models and evaluate accuracy in a background thread."""
    with training_lock:
        try:
            logger.info(f"Background Thread: Retraining all models for step {current_step}...")
            
            def commit_train(name, data):
                if not data:
                    logger.warning(f"Background Thread: No data to train '{name}' model.")
                    return
                X = [d[0] for d in data]
                y = [d[1] for d in data]
                state.models[name].partial_fit(X, y)
                logger.info(f"Background Thread: Trained '{name}' on {len(X)} samples.")

            commit_train('cal_log', cal_log_data)
            commit_train('random', random_data)
            commit_train('entropy', entropy_data)

            # VALIDATION PHASE (Evaluate against held-out test set)
            scores = {}
            X_test = [t['text'] for t in test_set]
            y_test = [t['label'] for t in test_set]
            
            for name, model in state.models.items():
                try:
                    preds = model.predict(X_test)
                    acc = np.mean([1 if p == y else 0 for p, y in zip(preds, y_test)])
                    scores[name] = round(acc, 3)
                except Exception as e:
                    logger.warning(f"Background Thread: Validation failed for '{name}': {e}")
                    scores[name] = 0.5
            
            scores['step'] = current_step
            state.accuracy_history.append(scores)

            # Compute Expected Calibration Error (ECE) dynamically
            ece_val = 0.0
            try:
                probs_test = state.models['cal_log'].predict_proba(X_test)
                confidences = np.max(probs_test, axis=1)
                predictions = np.argmax(probs_test, axis=1)
                y_test_arr = np.array(y_test)
                
                bin_boundaries = np.linspace(0, 1, 11)
                for i in range(10):
                    bin_lower = bin_boundaries[i]
                    bin_upper = bin_boundaries[i+1]
                    in_bin = (confidences > bin_lower) & (confidences <= bin_upper)
                    prop_in_bin = np.mean(in_bin)
                    if prop_in_bin > 0:
                        accuracy_in_bin = np.mean(predictions[in_bin] == y_test_arr[in_bin])
                        avg_confidence_in_bin = np.mean(confidences[in_bin])
                        ece_val += prop_in_bin * np.abs(avg_confidence_in_bin - accuracy_in_bin)
                ece_val = round(float(ece_val), 3)
            except Exception as e:
                logger.warning(f"Background Thread: Failed to calculate ECE in validation: {e}")

            # DYNAMIC CONFIDENCE THRESHOLD ADAPTATION (Self-Tuning Engine)
            # Adjust the auto-labeling confidence threshold dynamically based on validation accuracy and Expected Calibration Error (ECE)
            if getattr(state, 'auto_label_threshold_mode', 'dynamic') == 'dynamic':
                acc_val = scores.get('cal_log', 0.5)
                # Scale threshold between 0.85 and 0.98 based on accuracy and ECE
                raw_threshold = 0.98 - (acc_val - 0.5) * 0.2 + (ece_val * 0.1)
                state.auto_label_threshold = round(max(0.85, min(0.98, raw_threshold)), 3)
                logger.info(f"Self-Tuning Engine: Dynamically adjusted Auto-Pruning Threshold to {state.auto_label_threshold} based on Accuracy={acc_val:.2f}, ECE={ece_val:.3f}")
            
            # AUTOMATIC HIGH-CONFIDENCE AUTO-LABELING (Background Active Pruning)
            auto_labeled_count = 0
            available = [t for t in state.clean_pool if t['id'] not in state.labeled_ids and t['id'] not in state.verification_queue]
            
            if available:
                try:
                    texts = [t['text'] for t in available]
                    probs = state.models['cal_log'].predict_proba(texts)
                    for idx, task in enumerate(available):
                        prob = probs[idx]
                        max_conf = np.max(prob)
                        
                        # Auto-label with dynamic confidence threshold
                        if max_conf >= state.auto_label_threshold:
                            pred_idx = int(np.argmax(prob))
                            custom_labels = getattr(state, 'custom_labels', ["Negative", "Positive"])
                            pred_label = custom_labels[pred_idx] if pred_idx < len(custom_labels) else str(pred_idx)
                            state.verification_queue[task['id']] = {
                                'id': task['id'],
                                'text': task['text'],
                                'predicted_label': pred_label,
                                'confidence': float(max_conf)
                            }
                            auto_labeled_count += 1
                except Exception as e:
                    logger.error(f"Background Thread: Dynamic auto-labeling failed: {e}")
            
            if auto_labeled_count > 0:
                logger.info(f"Background Thread: Auto-labeled {auto_labeled_count} items. Workload reduced.")
                state.last_bg_auto_labeled_count = auto_labeled_count
            else:
                state.last_bg_auto_labeled_count = 0
            
            # Persist metrics to file
            try:
                metrics_data = {
                    "accuracy_history": state.accuracy_history,
                    "step": current_step,
                    "alpha": alpha,
                    "beta": beta,
                    "ece": ece_val,
                    "last_bg_auto_labeled_count": auto_labeled_count,
                    "pool_remaining": len(available) - auto_labeled_count,
                    "cognitive_pacing_active": getattr(state, 'cognitive_pacing_active', False),
                    "baseline_beta": getattr(state, 'baseline_beta', None)
                }
                with open(METRICS_PATH, "w") as f:
                    json.dump(metrics_data, f)
                logger.info(f"Background Thread: Successfully updated metrics file for step {current_step}.")
            except Exception as e:
                logger.error(f"Background Thread: Failed to write metrics: {e}")
                
        except Exception as e:
            logger.error(f"Background Thread: Retraining failed: {e}")
            import traceback
            logger.error(traceback.format_exc())

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
    task_id = data.get('taskId')
    
    state.step += 1
    state.steps_since_update += 1
    state.steps_since_train += 1
    
    if task_id is not None:
        # Convert to int if it is numerical to maintain consistency with JSON IDs
        try:
            task_id = int(task_id)
        except (ValueError, TypeError):
            pass
        state.labeled_ids.add(task_id)
    
    # We update the Cognitive Cost Model incrementally.
    # By logging the exact time it took them to read this specific text length,
    # our alpha/beta parameters dynamically shift to match their current physical fatigue level.
    interaction = {'text': text, 'length': len(text.split()), 'time_seconds': time_taken}
    state.interaction_buffer.append(interaction)  # Keep rolling history
    record_annotation_observation(text=text, time_seconds=time_taken, label=label, task_id=task_id)
    
    if state.steps_since_update >= 5:
        recent_interactions = state.interaction_buffer[-5:]
        logger.info(f"Updating Cost Model with {len(recent_interactions)} recent interactions...")
        state.cost_model.update(recent_interactions)
        state.steps_since_update = 0
        # Do not clear interaction_buffer, cost_engine uses a rolling window
        # of the last 5 internally. Keeping the full buffer ensures continuity.
        logger.info(f"Cost Model Updated - Current values: alpha={state.cost_model.alpha:.2f}, beta={state.cost_model.beta:.2f}")
        
        # Cognitive Pacing Scheduler Check
        if getattr(state, 'baseline_beta', None) is None:
            if len(state.cost_model.user_history) >= 5:
                state.baseline_beta = float(state.cost_model.beta)
                logger.info(f"Cognitive Pacing: Established baseline reading factor (beta) = {state.baseline_beta:.2f}")
        else:
            if state.cost_model.beta > state.baseline_beta * 1.5:
                if not state.cognitive_pacing_active:
                    state.cognitive_pacing_active = True
                    logger.info("Cognitive Pacing: Fatigue detected! Pacing Scheduler enabled (quadratically penalizing task cost).")
            elif state.cost_model.beta <= state.baseline_beta * 1.2:
                if state.cognitive_pacing_active:
                    state.cognitive_pacing_active = False
                    logger.info("Cognitive Pacing: Reading speed recovered. Resuming standard CAL-Log Active Selection.")

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
        if rnd_task:
            rnd_lbl = state.id_to_label.get(rnd_task['id'], 0) 
            state.pending_labels_random = getattr(state, 'pending_labels_random', []) + [(rnd_task['text'], rnd_lbl)]
        
        # Entropy Choice
        ent_task = state.last_shadow_picks['entropy']
        if ent_task:
            ent_lbl = state.id_to_label.get(ent_task['id'], 0)
            state.pending_labels_entropy = getattr(state, 'pending_labels_entropy', []) + [(ent_task['text'], ent_lbl)]
    
    # BUFFER USER LABELS
    # Convert label dynamically based on custom labels mapping
    label_int = get_label_index(label)
    state.pending_labels_cal_log = getattr(state, 'pending_labels_cal_log', []) + [(text, label_int)]

    # Retrain Cycle (Every 5 - SYNCED with Alpha/Beta updates)
    triggered_training = False
    if state.steps_since_train >= 5:
        # Shallow copy buffer lists and clear main thread buffers to prevent race conditions during training
        cal_log_data = getattr(state, 'pending_labels_cal_log', []).copy()
        random_data = getattr(state, 'pending_labels_random', []).copy()
        entropy_data = getattr(state, 'pending_labels_entropy', []).copy()
        
        setattr(state, 'pending_labels_cal_log', [])
        setattr(state, 'pending_labels_random', [])
        setattr(state, 'pending_labels_entropy', [])
        
        # Run synchronously to ensure metrics and active pruning are completed before response
        bg_train_worker(
            cal_log_data, 
            random_data, 
            entropy_data, 
            state.test_set, 
            state.step, 
            state.cost_model.alpha, 
            state.cost_model.beta
        )
        
        state.steps_since_train = 0
        triggered_training = True
        
    return jsonify({
        "status": "ok", 
        "alpha": state.cost_model.alpha,
        "beta": state.cost_model.beta, 
        "trained": triggered_training
    })

@app.route('/reset', methods=['POST'])
def reset_session():
    """Reset ALL state for a new contestant, complete fresh start with optional dataset configurations."""
    try:
        payload = request.json or {}
        dataset_name = payload.get("datasetName", "imdb")
        custom_labels = payload.get("labels", ["Negative", "Positive"])
        seed_type = payload.get("seedType", "unlabeled")
        seed_count = int(payload.get("seedCount", 10))
        uploaded_texts = payload.get("uploadedTexts")
        
        num_labels = len(custom_labels)
        state.custom_labels = custom_labels
        state.labeled_ids = set() # Clear server-side labeled IDs
        state.last_bg_auto_labeled_count = 0
        state.round_size = int(payload.get("roundSize", 10))
        state.verification_queue = {}
        thresh_val = payload.get("autoLabelThreshold", "dynamic")
        if thresh_val == "dynamic":
            state.auto_label_threshold_mode = "dynamic"
            state.auto_label_threshold = 0.95
        else:
            state.auto_label_threshold_mode = "static"
            state.auto_label_threshold = float(thresh_val)

        # 1. Reset cost model to cold-start defaults
        state.cost_model = build_cost_model()
        state.ranker = CALLogRanker(state.cost_model)
        
        # 2. Re-initialize backbone models (fresh weights, matching the number of labels)
        state.backbone = SimpleBackbone(num_labels=num_labels)
        state.models = {
            'cal_log': state.backbone,
            'random': SimpleBackbone(num_labels=num_labels),
            'entropy': SimpleBackbone(num_labels=num_labels)
        }
        
        # 3. Handle custom or preset dataset loading
        if dataset_name == "custom" and uploaded_texts:
            logger.info(f"Loading custom uploaded dataset with {len(uploaded_texts)} items...")
            state.dataset = []
            state.id_to_label = {}
            for idx, txt in enumerate(uploaded_texts):
                # Generate mock labels for simulation backends
                mock_lbl = idx % num_labels
                state.dataset.append({'id': idx, 'text': txt, 'label': mock_lbl})
                state.id_to_label[idx] = mock_lbl
        elif dataset_name == "ag_news":
            logger.info("Generating AG News preset (800 items)...")
            state.dataset = []
            state.id_to_label = {}
            
            categories = ["World", "Sports", "Business", "Sci/Tech"]
            subjects = {
                "World": ["United Nations", "Global leaders", "Peace talks", "Protests erupt in", "New policy announcement in"],
                "Sports": ["Championship match", "Olympic runner", "Local team", "Tournament finals", "Star athlete"],
                "Business": ["Stock markets", "Startup company", "Tech giant merger", "Retail index", "Inflation rates"],
                "Sci/Tech": ["New AI algorithm", "Space telescope", "Quantum computer", "Battery technology", "Robotics breakthrough"]
            }
            actions = {
                "World": ["focuses on climate change", "sign historic agreement", "sparks international debate", "demands economic reforms", "aims for border stability"],
                "Sports": ["ends in dramatic overtime", "sets new world record", "secures victory in finals", "suffers unexpected defeat", "announces retirement plans"],
                "Business": ["reach record highs", "faces federal antitrust probe", "unveils multi-billion IPO", "warns of incoming recession", "boosts quarterly profit margins"],
                "Sci/Tech": ["exhibits human-like reasoning", "discovers distant exoplanet", "solves complex physics equation", "promises faster charging times", "demonstrates advanced dexterity"]
            }
            
            for idx in range(800):
                cat = categories[idx % 4]
                sub = subjects[cat][(idx // 4) % len(subjects[cat])]
                act = actions[cat][(idx // 16) % len(actions[cat])]
                headline = f"{sub} {act} - Topic Report #{idx}."
                lbl = idx % num_labels
                state.dataset.append({'id': idx, 'text': headline, 'label': lbl})
                state.id_to_label[idx] = lbl
        elif dataset_name == "rotten_tomatoes":
            logger.info("Loading Rotten Tomatoes preset (600 items)...")
            state.dataset = []
            state.id_to_label = {}
            try:
                import re
                with open("dataset.json", "r") as f:
                    raw = json.load(f)
                    count = 0
                    for i, r in enumerate(raw):
                        if count >= 600:
                            break
                        txt = r.get('data', {}).get('text') or r.get('text', "")
                        l_str = r.get('true_label') or r.get('label')
                        lbl = 1 if l_str == 'Positive' else 0
                        if txt:
                            sentences = re.split(r'\.\s+', txt)
                            short_txt = ". ".join(sentences[:2])
                            if not short_txt.endswith('.'):
                                short_txt += '.'
                            state.dataset.append({'id': i, 'text': short_txt, 'label': lbl})
                            state.id_to_label[i] = lbl
                            count += 1
            except Exception as e:
                logger.error(f"Failed to load Rotten Tomatoes preset: {e}")
        else:
            # Re-read preset dataset.json (simulating default IMDB)
            logger.info(f"Loading preset dataset: {dataset_name}")
            state.dataset = []
            state.id_to_label = {}
            try:
                with open("dataset.json", "r") as f:
                    raw = json.load(f)
                    for i, r in enumerate(raw):
                        txt = r.get('data', {}).get('text') or r.get('text', "")
                        l_str = r.get('true_label') or r.get('label')
                        lbl = 1 if l_str == 'Positive' else 0
                        if txt:
                            state.dataset.append({'id': i, 'text': txt, 'label': lbl})
                            state.id_to_label[i] = lbl
            except Exception as e:
                logger.error(f"Failed to load dataset.json during reset: {e}")
        
        # Hydrate pool
        state.test_set = state.dataset[:100] if len(state.dataset) > 100 else state.dataset[:10]
        state.pool = state.dataset[100:] if len(state.dataset) > 100 else state.dataset
        state.clean_pool = list(state.pool)
        
        # Recalculate length statistics
        state.all_lengths = [len(d['text'].split()) for d in state.dataset]
        state.max_len = max(state.all_lengths) if state.all_lengths else 0
        state.avg_len = np.mean(state.all_lengths) if state.all_lengths else 0

        # Shuffle pool
        import random
        random.shuffle(state.clean_pool)
        
        # 4. Handle Seeding
        if seed_type == "labeled_seed" and seed_count > 0:
            logger.info(f"Applying labeled seed of {seed_count} points for warm start...")
            seed_size = min(seed_count, len(state.clean_pool))
            seed = random.sample(state.clean_pool, seed_size)
            
            X = [d['text'] for d in seed]
            y = [d['label'] for d in seed]
            
            # Warm fit all models
            if len(set(y)) >= 2 or num_labels > 2:
                for name, model in state.models.items():
                    model.partial_fit(X, y)
                    
            # Subtract seed IDs from pool and add to labeled_ids
            for s in seed:
                state.labeled_ids.add(s['id'])
                
            state.clean_pool = [t for t in state.clean_pool if t['id'] not in state.labeled_ids]
            logger.info(f"Active learning models seeded. Remaining pool: {len(state.clean_pool)} items.")
        else:
            state._pretrain_seed()
        
        # 5. Reset all counters
        state.step = 0
        state.steps_since_update = 0
        state.steps_since_train = 0
        state.selected_task_lengths = []
        state.cognitive_pacing_active = False
        state.baseline_beta = None
        
        # 6. Clear all buffers
        state.interaction_buffer = []
        state.pending_labels_cal_log = []
        state.pending_labels_random = []
        state.pending_labels_entropy = []
        if hasattr(state, 'last_shadow_picks'):
            del state.last_shadow_picks
        
        # 7. Reset history to initial state
        state.history = [{"step": 0, "alpha": state.cost_model.alpha, "beta": state.cost_model.beta}]
        state.accuracy_history = [{'step': 0, 'cal_log': 0.5, 'random': 0.5, 'entropy': 0.5}]
        state.cumulative_costs = {'cal_log': [], 'entropy': [], 'random': []}
        
        # 8. Clear all spy files
        for fpath in [HISTORY_PATH, METRICS_PATH, SELECTION_PATH, TASK_LOG_PATH]:
            try:
                if fpath == HISTORY_PATH:
                    with open(fpath, "w") as f:
                        json.dump(state.history, f)
                elif fpath == METRICS_PATH:
                    with open(fpath, "w") as f:
                        json.dump({
                            "accuracy_history": state.accuracy_history,
                            "step": 0, "alpha": state.cost_model.alpha, "beta": state.cost_model.beta, "ece": 0.0, "last_bg_auto_labeled_count": 0, "pool_remaining": len(state.clean_pool)
                        }, f)
                else:
                    with open(fpath, "w") as f:
                        json.dump([] if fpath == TASK_LOG_PATH else {}, f)
            except: pass
        
        logger.info(f"FULL SESSION RESET COMPLETED: dataset={dataset_name}, labels={custom_labels}, seed={seed_type} ({seed_count})")
        
        return jsonify({
            "status": "ok",
            "message": "Session fully reset",
            "alpha": state.cost_model.alpha,
            "beta": state.cost_model.beta,
            "prior_source": state.cost_model.alpha_prior_source,
            "pool_total": len(state.clean_pool)
        })
    except Exception as e:
        logger.error(f"Failed to reset session: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/export', methods=['GET'])
def export_labels():
    """Export all recorded observations in a standard Label Studio compatible JSON format."""
    try:
        observations = load_observations()
        export_data = []
        for idx, obs in enumerate(observations):
            text = obs.get("text", "")
            label = obs.get("label", "Unlabeled")
            time_seconds = obs.get("time_seconds", 0.0)
            
            # Standard Label Studio JSON output structure
            export_data.append({
                "id": obs.get("task_id") or idx,
                "data": {
                    "text": text
                },
                "annotations": [
                    {
                        "id": idx,
                        "lead_time": time_seconds,
                        "result": [
                            {
                                "from_name": "sentiment",
                                "to_name": "text",
                                "type": "choices",
                                "value": {
                                    "choices": [label]
                                }
                            }
                        ]
                    }
                ]
            })
        return jsonify(export_data)
    except Exception as e:
        logger.error(f"Failed to export labels: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/auto-label', methods=['POST'])
def auto_label():
    """Dynamically auto-annotate tasks in the pool where the model confidence is exceptionally high (> 98%).
    This serves as a high-value weak supervision differentiator compared to standard labeling platforms.
    """
    try:
        payload = request.json or {}
        labeled_ids = set()
        for lid in payload.get('labeled_task_ids', []):
            labeled_ids.add(int(lid) if isinstance(lid, (int, float)) else lid)
            
        available = [t for t in state.clean_pool if t['id'] not in labeled_ids]
        
        if not available:
            return jsonify({"status": "exhausted", "count": 0, "records": []})
            
        texts = [t['text'] for t in available]
        probs = state.backbone.predict_proba(texts)
        
        auto_labeled_count = 0
        auto_labels_record = []
        
        for idx, task in enumerate(available):
            prob = probs[idx]
            max_conf = np.max(prob)
            
            # If the model is confident enough, place it in the verification queue
            if max_conf >= state.auto_label_threshold:
                pred_idx = int(np.argmax(prob))
                custom_labels = getattr(state, 'custom_labels', ["Negative", "Positive"])
                pred_label = custom_labels[pred_idx] if pred_idx < len(custom_labels) else str(pred_idx)
                state.verification_queue[task['id']] = {
                    'id': task['id'],
                    'text': task['text'],
                    'predicted_label': pred_label,
                    'confidence': float(max_conf)
                }
                auto_labels_record.append({
                    "id": task['id'],
                    "text": task['text'][:50] + "...",
                    "label": pred_label,
                    "confidence": round(float(max_conf), 4)
                })
                auto_labeled_count += 1
                
        logger.info(f"Auto-labeled {auto_labeled_count} tasks with confidence >= {state.auto_label_threshold * 100:.1f}% and queued for verification.")
        return jsonify({
            "status": "success",
            "count": auto_labeled_count,
            "records": auto_labels_record
        })
    except Exception as e:
        logger.error(f"Auto-labeling failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/verify', methods=['POST'])
def verify_task():
    """Verify (Approve or Correct) an auto-labeled task in the active learning loop."""
    try:
        data = request.json or {}
        action = data.get("action")
        task_id = data.get("taskId")
        corrected_label = data.get("correctedLabel")
        
        if action == "approve_all":
            count = 0
            # copy keys to avoid runtime modification errors
            for tid in list(state.verification_queue.keys()):
                task = state.verification_queue.pop(tid, None)
                if task:
                    lbl = task['predicted_label']
                    record_annotation_observation(
                        text=task['text'],
                        time_seconds=0.1,
                        label=lbl,
                        task_id=tid
                    )
                    state.labeled_ids.add(tid)
                    lbl_int = get_label_index(lbl)
                    state.backbone.partial_fit([task['text']], [lbl_int])
                    count += 1
            return jsonify({"status": "success", "message": f"Approved all {count} tasks."})
            
        if task_id is None:
            return jsonify({"status": "error", "message": "taskId is required"}), 400
            
        try:
            task_id = int(task_id)
        except:
            pass
            
        task = state.verification_queue.pop(task_id, None)
        if not task:
            return jsonify({"status": "error", "message": f"Task {task_id} not found in verification queue"}), 404
            
        if action == "approve":
            lbl = task['predicted_label']
            record_annotation_observation(
                text=task['text'],
                time_seconds=0.1,
                label=lbl,
                task_id=task_id
            )
            state.labeled_ids.add(task_id)
            lbl_int = get_label_index(lbl)
            state.backbone.partial_fit([task['text']], [lbl_int])
            return jsonify({"status": "success", "message": f"Task {task_id} approved."})
            
        elif action == "correct":
            if not corrected_label:
                return jsonify({"status": "error", "message": "correctedLabel is required for correction"}), 400
            record_annotation_observation(
                text=task['text'],
                time_seconds=0.5,
                label=corrected_label,
                task_id=task_id
            )
            state.labeled_ids.add(task_id)
            lbl_int = get_label_index(corrected_label)
            state.backbone.partial_fit([task['text']], [lbl_int])
            logger.info(f"Retrained model on human correction for task {task_id} (corrected to {corrected_label})")
            return jsonify({"status": "success", "message": f"Task {task_id} corrected."})
            
        else:
            return jsonify({"status": "error", "message": f"Invalid action: {action}"}), 400
            
    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        logger.error(f"Verification failed:\n{err_msg}")
        return jsonify({"status": "error", "message": str(e), "traceback": err_msg}), 500

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
