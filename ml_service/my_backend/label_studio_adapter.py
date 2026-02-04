import os
import sys
import logging
import numpy as np
import requests

# Universal Path Fix:
# If running inside 'my_backend' (which label-studio-ml init creates), we need to add the parent 'ml_service' to path.
if os.path.basename(os.path.dirname(__file__)) == 'my_backend':
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from label_studio_ml.model import LabelStudioMLBase
from cost_engine import AdaptiveCostModel
from backbone import StandardBackbone
# from models import CALLogRanker (Logic inlined into adapter)

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# --- REPRODUCIBILITY SEEDS (User Request) ---
# Ensuring "True Potential" by removing randomness
import random
random.seed(42)
np.random.seed(42)
try:
    import torch
    torch.manual_seed(42)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(42)
except ImportError:
    pass # Torch might be inside sentence-transformers only
# --------------------------------------------

class CALLogBackend(LabelStudioMLBase):
    """
    CAL-Log Active Learning Backend for Label Studio.
    
    Integrates:
    1. AdaptiveCostModel: Learns Alpha (Overhead) and Beta (Reading Speed) from user behavior.
    2. CALLogRanker: Ranks tasks by Utility = Entropy / Predicted_Cost.
    3. StandardBackbone: Fine-tunes a Transformer (DistilRoBERTa) on new annotations.
    """
    
    def __init__(self, **kwargs):
        # INHERITANCE: Sourced from HumanSignal/label-studio-ml-backend
        # https://github.com/HumanSignal/label-studio-ml-backend/blob/master/label_studio_ml/model.py
        # We extend LabelStudioMLBase to hook into predict() and fit()
        super(CALLogBackend, self).__init__(**kwargs)
        
        # 1. Initialize Adaptive Cost Models (One per User)
        # Structure: {user_id: AdaptiveCostModel()}
        self.cost_models = {} 
        self.global_alpha = 5.0
        self.global_beta = 3.0
        
        # 2. Lazy Load Backbone (to prevent timeout during init)
        self.backbone = None
        
        # 3. STATE PERSISTENCE
        self.state_file = os.path.join(os.path.dirname(__file__), "state.json")
        self.train_step = 0
        self._load_state()
        
        # 4. Initialize Backbone immediately
        self.backbone = self._get_backbone()
        # CRITICAL: Set self._model to satisfy LabelStudioMLBase check
        self._model = self.backbone
        self.model = self.backbone # Fallback for some versions
        self.setup()
        logger.info(f"✅ CALLogBackend initialized. Model set: {self._model is not None}")

    def setup(self):
        """
        Label Studio calls this to initialize the model.
        We ensure backbone is loaded here.
        """
        logger.info("🔧 setup() called by Label Studio Manager")
        self.backbone = self._get_backbone()
        self._model = self.backbone
        self.model = self.backbone
        logger.info(f"✅ setup() completed. Model: {self._model}")
        return self._model

    def _load_state(self):
        if os.path.exists(self.state_file):
            try:
                import json
                with open(self.state_file, 'r') as f:
                    state = json.load(f)
                    self.train_step = state.get('step', 0)
                    
                    # Load User Models
                    saved_models = state.get('models', {})
                    for uid, params in saved_models.items():
                        cm = AdaptiveCostModel()
                        cm.alpha = params['alpha']
                        cm.beta = params['beta']
                        self.cost_models[str(uid)] = cm
                    
                    # Recalculate globals
                    self._update_global_averages()
                    
                logger.info(f"💾 State loaded: Step {self.train_step}, {len(self.cost_models)} users")
            except Exception as e:
                logger.error(f"Failed to load state: {e}")

    def _save_state(self):
        try:
            import json
            # Serialize all user models
            models_data = {}
            for uid, cm in self.cost_models.items():
                models_data[uid] = {'alpha': cm.alpha, 'beta': cm.beta}
            
            state = {
                'step': self.train_step,
                'models': models_data
            }
            with open(self.state_file, 'w') as f:
                json.dump(state, f)
        except Exception as e:
            logger.error(f"Failed to save state: {e}")

    def _update_global_averages(self):
        """Calculate average cost params across all users for global ranking"""
        if not self.cost_models:
            self.global_alpha = 5.0
            self.global_beta = 3.0
            return

        alphas = [m.alpha for m in self.cost_models.values()]
        betas = [m.beta for m in self.cost_models.values()]
        self.global_alpha = sum(alphas) / len(alphas)
        self.global_beta = sum(betas) / len(betas)

    def _get_backbone(self):
        if self.backbone is None:
            logger.info("⏳ Lazy loading backbone...")
            self.backbone = StandardBackbone(num_labels=4)
            
            # Check for pre-trained model in parent dir (ml_service root)
            pretrained_path = os.path.join(os.path.dirname(__file__), "..", "pretrained_backbone.pkl")
            if os.path.exists(pretrained_path):
                logger.info(f"📂 Found pre-trained model at {pretrained_path}")
                self.backbone.load_model(pretrained_path)
            else:
                 logger.info("🆕 No pre-trained model found. Initializing fresh.")
                 self.backbone.initialize_model()
        return self.backbone

    def predict(self, tasks, **kwargs):
        """
        Label Studio calls this to get predictions. 
        We use this opportunity to calculating scores for Active Learning.
        
        # PROVENANCE: Method signature required by Label Studio ML Backend
        # https://github.com/HumanSignal/label-studio-ml-backend
        """
        predictions = []
        backbone = self._get_backbone()
        
        # Extract text from tasks
        texts = [task['data'].get('text') or task['data'].get('content') or "" for task in tasks]
        
        # Get Model Probabilities and Embeddings
        probs = backbone.predict_proba(texts)
        
        # Calculate ENTROPY (Uncertainty)
        entropy = -np.sum(probs * np.log(probs + 1e-10), axis=1)
        
        # Calculate COST (Adaptive)
        # Calculate COST (Adaptive)
        # CRITICAL: We use GLOBAL AVERAGE Alpha/Beta for ranking
        lengths = [len(t.split()) for t in texts]
        
        # Manual prediction using global params
        # Cost = Alpha + Beta * log(1 + Length)
        log_lens = np.log1p(lengths)
        predicted_costs = self.global_alpha + (self.global_beta * log_lens)
        
        for i, task in enumerate(tasks):
            # 1. Generate Prediction (Pre-Annotation)
            # This helps the annotator ("AI suggestion")
            pred_label_idx = np.argmax(probs[i])
            confidence = float(np.max(probs[i]))
            
            # Map index to Label Name (You should sync this with your project config)
            # For now, we return a cluster score
            
            # 2. Calculate Active Learning Score
            # Score = Entropy / Cost
            # LabelStudio sorts by "score" if configured
            cal_log_score = float(entropy[i] / (predicted_costs[i] + 1e-6))
            
            predictions.append({
                "result": [{
                    "from_name": "label",
                    "to_name": "text",
                    "type": "choices",
                    "value": {
                        "choices": ["Unknown"] # We'll need to map real validation labels here
                    }
                }],
                "score": cal_log_score,  # THIS IS THE MAGIC NUMBER FOR SORTING
                "model_version": f"CAL-Log-v{self.train_step}"
            })
            
        return predictions

    def fit(self, annotations, **kwargs):
        """
        Label Studio calls this when you hit "Submit".
        We use this to UPDATE our Adaptive Cost Model AND Fine-Tune the Backbone.
        """
        self.train_step += 1
        
        # --------------------------------------------------------------
        # FALLBACK: Explicitly handle empty annotations list (common in local mode)
        # We extract the single annotation from the webhook payload 'kwargs['data']'
        # --------------------------------------------------------------
        if (not annotations or len(annotations) == 0) and 'data' in kwargs and 'annotation' in kwargs['data']:
            # logger.info("⚠️ 'annotations' list is empty. Using fallback extraction from payload.")
            raw_ann = kwargs['data']['annotation']
            task_data = kwargs['data'].get('task', {})
            # Wrap in list to match expected consistency
            annotations = [{
                'id': raw_ann.get('id'),
                'result': raw_ann.get('result', []),
                'lead_time': raw_ann.get('lead_time', 0),
                'task': task_data
            }]

        logger.info(f"Received {len(annotations)} annotations for training...")
        
        interaction_logs = []
        train_texts = []
        train_labels = []
        
        for ann in annotations:
            # 1. Extract Interaction Data for Cost Model
            # LabelStudio payload usually contains task data in ann['task']['data']
            task_data = ann.get('task', {}).get('data', {})
            text = task_data.get('text') or task_data.get('content') or ""
            
            if 'lead_time' in ann:
                interaction_logs.append({
                    'length': len(text.split()), 
                    'time_ms': ann['lead_time'] * 1000,
                    'text': text
                })
            
            # 2. Extract Label Data for Model Training
            # Assumes 'choices' type label config
            try:
                for res in ann.get('result', []):
                    if res.get('type') == 'choices':
                        label = res['value']['choices'][0]
                        train_texts.append(text)
                        train_labels.append(label)
                        break
            except Exception as e:
                logger.error(f"Error parsing annotation: {e}")

        # --- A. UPDATE COST MODEL (Adaptivity) ---
        # Identify User and update THEIR model
        if interaction_logs:
            # We assume all logs in this batch belong to the user who triggered the webhook
            # In LabelStudio, `fit` payload usually comes from one action.
            # We try to find 'completed_by' in the first annotation
            user_id = str(annotations[0].get('completed_by', 'default'))
            
            if user_id not in self.cost_models:
                logger.info(f"🆕 New Annotator Detected: {user_id}. Initializing profile.")
                self.cost_models[user_id] = AdaptiveCostModel()
            
            user_model = self.cost_models[user_id]
            old_alpha, old_beta = user_model.alpha, user_model.beta
            
            user_model.update(interaction_logs)
            
            new_alpha, new_beta = user_model.alpha, user_model.beta
            logger.info(f"🔄 Cost Model Updated [User {user_id}]: α {old_alpha:.2f}→{new_alpha:.2f}, β {old_beta:.2f}→{new_beta:.2f}")
            
            # Recompute globals
            self._update_global_averages()
        else:
            logger.warning("⚠️ No interaction logs found (Lead Time missing?). Cost parameters NOT updated.")

        # --- B. UPDATE PREDICTION MODEL (Accuracy) ---
        if train_texts and train_labels:
            logger.info(f"🧠 Fine-tuning model on {len(train_texts)} new samples...")
            backbone = self._get_backbone()
            backbone.partial_fit(train_texts, train_labels)
        
        # Return native types to ensure JSON serialization safety
        result_dict = {
            'status': 'ok',
            'train_step': int(self.train_step),
            'current_alpha': float(self.global_alpha),
            'current_beta': float(self.global_beta)
        }
        
        # Save persistent state
        self._save_state()
        
        # --- SPY WINDOW HOOK ---
        # Write real-time metrics to Client Public folder for visualization
        try:
             import json
             # Direct path to React Client public folder
             metric_path = r"d:\ResearchTool\client\public\spy_metrics.json"
             with open(metric_path, "w") as f:
                  json.dump(result_dict, f)
             logger.info(f"🕵️‍♂️ Spy Metrics written to {metric_path}")
        except Exception as e:
             logger.error(f"Error writing spy metrics: {e}")
        # -----------------------

        return result_dict
