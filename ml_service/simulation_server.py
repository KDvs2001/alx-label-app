
import os
import json
import numpy as np
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys

# Ensure imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utilities.simple_backbone import SimpleBackbone
from cost_engine import AdaptiveCostModel
from models.cal_log_ranker import CALLogRanker
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SimulationServer")

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

# GLOBAL STATE - Portable paths (relative to this file's location)
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# CLOUD VS LOCAL:
# In Cloud (Docker), client/public is NOT available. We write to local tmp/files.
# In Local, we can write to client/public if we want, OR just use API.
# We will default to LOCAL storage (relative to service) and expose via API.
# This works for BOTH Cloud and Local-via-API.
METRICS_PATH = os.path.join(_BASE_DIR, "spy_metrics.json")
HISTORY_PATH = os.path.join(_BASE_DIR, "spy_history.json")
SELECTION_PATH = os.path.join(_BASE_DIR, "spy_selection.json")
TASK_LOG_PATH = os.path.join(_BASE_DIR, "spy_task_log.json")
MODEL_DIR = os.path.join(_BASE_DIR, "models", "all-MiniLM-L6-v2")

class SimulationState:
    def __init__(self):
        self.cost_model = AdaptiveCostModel()
        
        # 1. Initialize Backbone
        # Priority: Local Path -> HuggingFace (with optional Token)
        # HF Token: set HF_TOKEN environment variable if using HuggingFace models
        token = os.environ.get("HF_TOKEN", "")
        
        try:
             # LAZY IMPORT to prevent OOM if libraries are heavy
            from utilities.pretrain_model import StandardBackbone
            
            if os.path.exists(MODEL_DIR):
                logger.info(f"📂 Found Offline Model at {MODEL_DIR}")
                self.backbone = StandardBackbone(model_name=MODEL_DIR, num_labels=2)
            else:
                logger.info("☁️ Connecting to Hugging Face Hub...")
                self.backbone = StandardBackbone(num_labels=2, token=token)
                
        except (ImportError, MemoryError, OSError) as e:
            logger.error(f"❌ Heavy Model Failed to Load (Low Memory?): {e}")
            logger.info("⚠️ FAST FAILBACK: Switching to 'SimpleBackbone' (Valid Scikit-Learn Model).")
            logger.info("✅ This runs 100% Offline. No downloads needed.")
            self.backbone = SimpleBackbone(num_labels=2)
            
        # Load Pre-trained weights if available
        if os.path.exists("pretrained_backbone.pkl") and not isinstance(self.backbone, SimpleBackbone):
            logger.info("💾 Loading saved weights...")
            try:
                self.backbone.load_model("pretrained_backbone.pkl")
            except Exception as e:
                logger.error(f"Failed to load weights: {e}")

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

        # 3. ORACLE SETUP (Ghost Models)
        logger.info("🔮 Initializing Oracle (Comparison Models)...")
        self.models = {
            'cal_log': self.backbone, 
            'random': SimpleBackbone(num_labels=2),
            'entropy': SimpleBackbone(num_labels=2)
        }
        
        # Load Dataset for Ground Truth
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
        
        # Pre-calculate Length Stats for Context
        self.all_lengths = [len(d['text'].split()) for d in self.dataset]
        self.max_len = max(self.all_lengths) if self.all_lengths else 0
        self.avg_len = np.mean(self.all_lengths) if self.all_lengths else 0
        
        # Seed with baseline
        self.accuracy_history = [{'step': 0, 'cal_log': 0.5, 'random': 0.5, 'entropy': 0.5}]

    def _init_files(self):
        try:
            # RESET HISTORY FOR NEW USER - Always start fresh
            initial_history = [{"step": 0, "alpha": 5.0, "beta": 3.0}]
            with open(HISTORY_PATH, "w") as f: 
                json.dump(initial_history, f)
            self.history = initial_history.copy()
            logger.info("✅ History reset to initial values (α=5.0, β=3.0)")
            
            if not os.path.exists(SELECTION_PATH):
                with open(SELECTION_PATH, "w") as f: json.dump({}, f)
            if not os.path.exists(METRICS_PATH):
                with open(METRICS_PATH, "w") as f: json.dump({}, f)
        except Exception as e:
            logger.error(f"Failed to init files: {e}")
            self.history = [{"step": 0, "alpha": 5.0, "beta": 3.0}]
        self.selected_task_lengths = [] # Reset length history

state = SimulationState()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok", 
        "alpha": state.cost_model.alpha, 
        "beta": state.cost_model.beta,
        "mode": "Real Research",
        "user_history": state.cost_model.user_history[-50:],
        "accuracy_history": getattr(state, 'accuracy_history', [])
    })

@app.route('/predict', methods=['POST'])
def predict():
    tasks = request.json.get('tasks', [])
    if not tasks: return jsonify([])

    # Normalize inputs
    normalized_tasks = []
    texts = []
    for i, t in enumerate(tasks):
        if isinstance(t, str):
            row = {'taskId': i, 'text': t}
        else:
            txt = t.get('data', {}).get('text') or t.get('text', "")
            tid = t.get('id', i)
            row = {'taskId': tid, 'text': txt}
        normalized_tasks.append(row)
        texts.append(row['text'])
    # Preprocessing: Clean and normalize text
    def preprocess_text(text):
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^a-zA-Z0-9\s.,!?\'-]', '', text)
        return text
    
    # Apply preprocessing
    for task in normalized_tasks:
        task['text'] = preprocess_text(task['text'])
    texts = [task['text'] for task in normalized_tasks]
    
    # Duplicate Detection Removed for Performance
    # O(N^2) cosine similarity on every request kills CPU performance on HF Spaces.
    # Assuming dataset.json is already reasonably clean.
    pass
    
    if not normalized_tasks:
        logger.warning("All tasks were duplicates or empty after preprocessing")
        return jsonify({'tasks': [], 'shadow_metrics': None})
    
    # Get Probs & Rank
    probs = state.backbone.predict_proba(texts)
    ranked_results = state.ranker.rank_by_cal_log(normalized_tasks, probs)
    
    if not ranked_results: return jsonify({'tasks': [], 'shadow_metrics': None})

    # --- SHADOW SIMULATION LOGIC ---
    import random
    
    # 1. Strategies Selection (Top 3 for each)
    # CAL-Log (Already sorted by efficient score)
    cal_log_picks = ranked_results[:3]
    
    # Entropy (Sort by Uncertainty)
    # CRITICAL: We must shuffle first to break the "Length Bias" inherited from ranked_results
    # Otherwise, if entropies are tied (common at start), it picks short tasks (because ranked_results is sorted by length)
    pool_for_entropy = ranked_results.copy()
    random.shuffle(pool_for_entropy) 
    
    # Pick top entropy from shuffled pool
    entropy_picks = sorted(pool_for_entropy, key=lambda x: x['transparency_report']['math_proof']['entropy'], reverse=True)[:3]
    
    # Random (Shuffle copies)
    random_picks = random.sample(ranked_results, min(3, len(ranked_results)))

    # 2. Metric Calculator Helper
    def calc_metrics(picks):
        avg_len = sum([len(p['text'].split()) for p in picks]) / max(1, len(picks))
        # Recalculate cost dynamically to be sure
        costs = []
        for p in picks:
            log_len = np.log1p(len(p['text'].split()))
            cost = state.cost_model.alpha + (state.cost_model.beta * log_len)
            costs.append(cost)
        avg_cost = sum(costs) / max(1, len(costs))
        
        audit_data = []
        for p in picks:
            audit_data.append({
                'id': p['id'],
                'text': p['text'][:80] + "...", # Snippet
                'len': len(p['text'].split()),
                'entropy': p['transparency_report']['math_proof']['entropy']
            })
            
        return {
            "avg_len": round(avg_len, 1),
            "estimated_cost": round(avg_cost, 1),
            "selected_ids": [p['id'] for p in picks],
            "audit_trail": audit_data
        }

    shadow_metrics = {
        "cal_log": calc_metrics(cal_log_picks),
        "entropy": calc_metrics(entropy_picks),
        "random": calc_metrics(random_picks)
    }

    # Log Spy Selection (Existing logic)
    top = ranked_results[0]
    
    # Calculate Percentile
    t_len = len(top['text'].split())
    pct = sum([1 for x in state.all_lengths if x < t_len]) / len(state.all_lengths) * 100
    
    # Get reading pattern analysis
    reading_pattern = state.cost_model.get_reading_pattern()
    
    # Classify task length based on dataset percentiles
    if pct < 33:
        length_class = "short"
        length_desc = "shorter than 67% of dataset"
    elif pct < 67:
        length_class = "medium"
        length_desc = "medium length (33-67 percentile)"
    else:
        length_class = "long"
        length_desc = "longer than 67% of dataset"

    # Compare with previous history
    avg_prev = np.mean(state.selected_task_lengths[-10:]) if state.selected_task_lengths else 0
    if state.selected_task_lengths and t_len > avg_prev * 1.5:
        rel_desc = f"(Significant Increase! Prev Avg: {int(avg_prev)}w)"
    elif state.selected_task_lengths and t_len < avg_prev * 0.6:
        rel_desc = f"(Significant Decrease! Prev Avg: {int(avg_prev)}w)"
    else:
        rel_desc = ""
        
    # Update history for next time
    state.selected_task_lengths.append(t_len)
    
    # Generate reasoning based on reading pattern and task selection
    if reading_pattern['pattern'] == 'fast_skimmer':
        pattern_reasoning = f"🏃 Fast Reader Detected: β={reading_pattern['beta']} (baseline: {reading_pattern['baseline_beta']}). Selected {length_class} tasks {rel_desc} to maximize your efficiency."
    elif reading_pattern['pattern'] == 'careful_reader':
        pattern_reasoning = f"📚 Careful Reader Detected: β={reading_pattern['beta']} (baseline: {reading_pattern['baseline_beta']}). Selected high-uncertainty tasks regardless of length for maximum information gain."
    elif reading_pattern['pattern'] == 'balanced':
        pattern_reasoning = f"⚖️ Balanced Pace: β={reading_pattern['beta']} (baseline: {reading_pattern['baseline_beta']}). Optimizing for both efficiency and information gain."
    else:
        pattern_reasoning = "Collecting data to learn your reading pattern..."
    
    spy_data = {
        "selected_task_id": top['id'],
        "score": top['score'],
        "entropy": top['transparency_report']['math_proof']['entropy'],
        "cost": top['transparency_report']['cost_analysis']['predicted_seconds'],
        "alpha": state.cost_model.alpha,
        "beta": state.cost_model.beta,
        "reasoning": f"Score {top['score']:.2f} | Entropy {top['transparency_report']['math_proof']['entropy']:.2f}",
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
    try:
        with open(SELECTION_PATH, "w") as f: json.dump(spy_data, f)
        
        # --- NEW LOGGING FOR EVALUATION ---
        # Append selected task details to a persistent log file
        
        new_log_entry = {
            "step": state.step,
            "selected_id": top['id'],
            "length": t_len,
            "cost": top['transparency_report']['cost_analysis']['predicted_seconds'],
            "beta": state.cost_model.beta,
            "timestamp": "auto_generated" 
        }
        
        existing_logs = []
        if os.path.exists(TASK_LOG_PATH):
            try:
                with open(TASK_LOG_PATH, "r") as f:
                    existing_logs = json.load(f)
            except: pass
        
        existing_logs.append(new_log_entry)
        
        with open(TASK_LOG_PATH, "w") as f:
            json.dump(existing_logs, f)
        # ----------------------------------
            
    except: pass


    # Return Result
    id_map = {str(t.get('id', i)): t for i, t in enumerate(tasks)}
    sorted_tasks = [id_map[str(res['id'])] for res in ranked_results if str(res['id']) in id_map]
    
    return jsonify({
        "tasks": sorted_tasks,
        "shadow_metrics": shadow_metrics
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
        "beta": state.cost_model.beta
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
    data = request.json
    text = data.get('text', "")
    label = data.get('label')
    time_taken = data.get('time_taken', 1.0)
    
    state.step += 1
    state.steps_since_update += 1
    state.steps_since_train += 1
    
    # Update Cost Model (Every 20 annotations)
    interaction = {'text': text, 'length': len(text.split()), 'time_seconds': time_taken}
    state.interaction_buffer.append(interaction)  # Accumulate interactions
    
    if state.steps_since_update >= 20:
        logger.info(f"📉 Updating Cost Model with {len(state.interaction_buffer)} interactions...")
        state.cost_model.update(state.interaction_buffer)  # Pass ALL accumulated interactions
        state.steps_since_update = 0
        state.interaction_buffer = []  # Clear buffer after update
        logger.info(f"✅ Cost Model Updated - Current values: α={state.cost_model.alpha:.2f}, β={state.cost_model.beta:.2f}")
        try:
            state.history.append({"step": state.step, "alpha": state.cost_model.alpha, "beta": state.cost_model.beta})
            with open(HISTORY_PATH, "w") as f: json.dump(state.history, f)
        except: pass

    # STORE GHOST LABELS
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

    # Retrain Cycle (Every 20 - SYNCED with Alpha/Beta updates)
    trained = False
    if state.steps_since_train >= 20:
        logger.info("🧠 Retraining ALL Models...")
        
        # Helper to train
        def commit_train(name, buffer_name):
            data = getattr(state, buffer_name, [])
            if not data:
                logger.warning(f"   ⚠️ No data for {name} model")
                return
            X = [d[0] for d in data]
            y = [d[1] for d in data]
            logger.info(f"   Training {name}: {len(X)} samples, labels: {set(y)}")
            state.models[name].partial_fit(X, y)
            setattr(state, buffer_name, [])
 
            
        try:
            commit_train('cal_log', 'pending_labels_cal_log')
            commit_train('random', 'pending_labels_random')
            commit_train('entropy', 'pending_labels_entropy')
            trained = True
            logger.info("✅ All models retrained successfully")
        except Exception as e:
            logger.error(f"❌ Training failed: {e}")
            import traceback
            logger.error(traceback.format_exc())

        
        # VALIDATION PHASE
        scores = {}
        X_test = [t['text'] for t in state.test_set]
        y_test = [t['label'] for t in state.test_set]
        
        for name, model in state.models.items():
            try:
                preds = model.predict(X_test)
                acc = np.mean([1 if p == y else 0 for p, y in zip(preds, y_test)])
                scores[name] = round(acc, 3)
            except: scores[name] = 0.5
            
        
        scores['step'] = state.step
        state.accuracy_history.append(scores)
        
        # WRITE METRICS TO FILE for frontend
        try:
            metrics_data = {
                "accuracy_history": state.accuracy_history,
                "step": state.step,
                "alpha": state.cost_model.alpha,
                "beta": state.cost_model.beta
            }
            with open(METRICS_PATH, "w") as f:
                json.dump(metrics_data, f)
            logger.info(f"📊 Metrics written to file: step={state.step}, α={state.cost_model.alpha:.2f}, β={state.cost_model.beta:.2f}")
        except Exception as e:
            logger.error(f"Failed to write metrics: {e}")
        
        state.steps_since_train = 0
        trained = True
        
    return jsonify({"status": "ok", "alpha": state.cost_model.alpha, "trained": trained})

@app.route('/reset', methods=['POST'])
def reset_session():
    """Reset all state for a new contestant"""
    try:
        # Reset cost model
        state.cost_model = AdaptiveCostModel()
        
        # Reset history files
        initial_history = [{"step": 0, "alpha": 5.0, "beta": 3.0}]
        with open(HISTORY_PATH, "w") as f:
            json.dump(initial_history, f)
        state.history = initial_history.copy()
        
        # Reset metrics
        initial_metrics = {
            "accuracy_history": [{'step': 0, 'cal_log': 0.5, 'random': 0.5, 'entropy': 0.5}],
            "step": 0,
            "alpha": 5.0,
            "beta": 3.0
        }
        with open(METRICS_PATH, "w") as f:
            json.dump(initial_metrics, f)
        state.accuracy_history = initial_metrics["accuracy_history"].copy()
        
        # Reset step counters
        state.step = 0
        state.steps_since_train = 0
        state.selected_task_lengths = [] # Reset length history
        
        # Clear pending labels
        state.pending_labels_cal_log = []
        state.pending_labels_random = []
        state.pending_labels_entropy = []
        
        # Reset interaction buffer
        state.interaction_buffer = []
        
        logger.info("🔄 Session reset for new contestant - all history cleared")
        
        return jsonify({
            "status": "ok",
            "message": "Session reset successfully",
            "alpha": 5.0,
            "beta": 3.0
        })
    except Exception as e:
        logger.error(f"Failed to reset session: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    # Use PORT env var for Cloud deployment (HF Spaces uses 7860)
    port = int(os.environ.get("PORT", 9090))
    logger.info(f"🚀 Simulation Server starting on port {port}...")
    app.run(host='0.0.0.0', port=port)
