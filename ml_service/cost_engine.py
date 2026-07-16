import numpy as np
import logging
import os

from difficulty_model import SemanticDifficultyRegressor

# named logger for this module so log output shows "CostEngine" as the source
# CITATION: logging.getLogger() — create a named logger per module
# SOURCE: Python Software Foundation (n.d.). "Logging HOWTO"
# URL: https://docs.python.org/3/howto/logging.html
logger = logging.getLogger("CostEngine")

class AdaptiveCostModel:
    """
    Adaptive Cost Model for CAL-Log.
    
    Cost formula: C(x) = alpha + beta * log(1 + L(x))
    
    FULLY ADAPTIVE APPROACH:
    - alpha (intercept) and beta (slope) are BOTH estimated via OLS regression
    - Cold-start defaults: alpha=5.0, beta=3.0
    - Updates every 5 annotations using a rolling window of the last 5 interactions
    - alpha represents fixed overhead in seconds (click, read prompt, decide)
    - beta represents reading speed multiplier (higher = slower reader)
    """
    
    def __init__(self, alpha_prior=None, beta_prior=None, use_semantic_cost=None, gamma=None, difficulty_model=None):
        self.alpha = float(alpha_prior if alpha_prior is not None else 5.0)
        self.beta = float(beta_prior if beta_prior is not None else 3.0)
        self.alpha_prior_source = "session_prior" if alpha_prior is not None or beta_prior is not None else "default"
        self.user_history = []
        self.use_semantic_cost = (
            str(os.environ.get("CALLOG_USE_SEMANTIC_COST", "0")).lower() in {"1", "true", "yes"}
            if use_semantic_cost is None else bool(use_semantic_cost)
        )
        self.gamma = float(gamma if gamma is not None else os.environ.get("CALLOG_GAMMA", 6.0))
        self.difficulty_model = difficulty_model or SemanticDifficultyRegressor()

    def _heuristic_cost(self, log_length: float) -> float:
        """Calculate cost: C(x) = alpha + beta * log(1 + L(x))"""
        return self.alpha + (self.beta * log_length)

    def predict(self, text_lengths: list, texts=None) -> np.ndarray:
        """Predict annotation cost for a list of text lengths."""
        # log1p(x) = ln(1 + x), more numerically stable than log(1+x) for small x
        # CITATION: np.log1p() — natural log of (1 + x) with better precision near zero
        # SOURCE: NumPy (n.d.). "numpy.log1p"
        # URL: https://numpy.org/doc/stable/reference/generated/numpy.log1p.html
        log_lengths = np.log1p(text_lengths)
        predicted_costs = np.array([self._heuristic_cost(l) for l in log_lengths], dtype=float)
        if self.use_semantic_cost and texts is not None and self.difficulty_model.available:
            difficulties = self.difficulty_model.predict(texts)
            predicted_costs = predicted_costs + (self.gamma * difficulties)
        # wrap the result as a numpy array so callers get vectorised operations
        # CITATION: np.array() — create an ndarray from a Python list
        # SOURCE: NumPy (n.d.). "numpy.array"
        # URL: https://numpy.org/doc/stable/reference/generated/numpy.array.html
        return np.array(predicted_costs)

    def predict_with_breakdown(self, texts: list):
        lengths = [len(t.split()) for t in texts]
        log_lengths = np.log1p(lengths)
        base_costs = np.array([self._heuristic_cost(l) for l in log_lengths], dtype=float)
        difficulties = (
            self.difficulty_model.predict(texts)
            if self.use_semantic_cost and self.difficulty_model.available
            else np.zeros(len(texts), dtype=float)
        )
        semantic_penalty = self.gamma * difficulties
        total_costs = base_costs + semantic_penalty
        return {
            "costs": total_costs,
            "base_costs": base_costs,
            "semantic_difficulty": difficulties,
            "semantic_penalty": semantic_penalty,
            "semantic_enabled": bool(self.use_semantic_cost and self.difficulty_model.available),
            "gamma": self.gamma,
        }

    def set_priors(self, alpha_prior: float, beta_prior: float, source: str = "session_prior"):
        self.alpha = float(max(1.0, min(15.0, alpha_prior)))
        self.beta = float(max(0.1, min(15.0, beta_prior)))
        self.alpha_prior_source = source
    def update(self, new_interaction_logs: list):
        """
        Update alpha and beta based on user's annotation speed using OLS regression.
        
        Fits: time = alpha + beta * log(1 + length) via least-squares.
        """
        # Add new interactions to history
        for log in new_interaction_logs:
            length = float(log.get('length', 10))
            time_seconds = float(log.get('time_seconds', 1.0))
            perceived_difficulty = float(log.get('perceived_difficulty', 1.0))
            
            # 1. Deliberation discounting: subtract deliberation overhead (decision noise)
            # 1.5s per star above 1. Clamp to a minimum of 0.5 seconds.
            adjusted_time = max(0.5, time_seconds - 1.5 * (perceived_difficulty - 1.0))
            
            # 2. Outlier filtering: strip out distractions (IQR/z-score noise)
            is_outlier = False
            if len(self.user_history) >= 5:
                # Calculate speeds of previous sessions (word_count / time)
                prev_speeds = [h[2] / max(0.1, h[1]) for h in self.user_history]
                median_speed = float(np.median(prev_speeds))
                current_speed = length / max(0.1, adjusted_time)
                
                # If reading speed is more than 3x faster or 5x slower than baseline median,
                # treat it as a distraction (long idle) or accidental/spam click (instant submit).
                if current_speed > 3.0 * median_speed or current_speed < 0.2 * median_speed:
                    is_outlier = True
                    logger.info(f"Filtered out timing outlier: length={length}, time={time_seconds}s (speed={current_speed:.2f} wps vs median={median_speed:.2f} wps)")
            
            if not is_outlier and adjusted_time < 300:  # Keep absolute 5-minute cap
                x_feat = np.log1p(length)
                # Store [x_feat, adjusted_time, length]
                self.user_history.append([x_feat, adjusted_time, length])

        WINDOW_SIZE = 5
        history_to_use = self.user_history[-WINDOW_SIZE:]

        if len(history_to_use) >= 3:  # Need at least 3 points for meaningful regression
            data = np.array(history_to_use)
            log_lengths = data[:, 0]  # x = log(1 + word_count)
            times = data[:, 1]        # y = time_seconds
            
            old_alpha = self.alpha
            old_beta = self.beta
            
            # check if text lengths have enough variance for OLS to work.
            length_variance = np.std(log_lengths)
            if length_variance < 0.3:
                # LOW VARIANCE FALLBACK: direct speed estimation.
                avg_time = np.mean(times)
                avg_log_len = np.mean(log_lengths)
                new_alpha = max(1.0, min(avg_time * 0.2, 5.0))
                new_beta = (avg_time - new_alpha) / max(avg_log_len, 0.1)
                logger.info(f"Low text-length variance ({length_variance:.2f}), using direct speed estimation")
            else:
                # OLS regression: time = alpha + beta * log_length
                A = np.column_stack([np.ones(len(log_lengths)), log_lengths])
                result, _, _, _ = np.linalg.lstsq(A, times, rcond=None)
                new_alpha, new_beta = result[0], result[1]

                # Log regression fit quality
                residuals = times - A @ result
                ss_res = np.sum(residuals ** 2)
                ss_tot = np.sum((times - np.mean(times)) ** 2)
                r_squared = 1 - (ss_res / max(ss_tot, 1e-9))
                logger.info(f"   R² = {r_squared:.3f} (regression fit quality)")
            
            # clamp to reasonable ranges
            new_alpha = max(1.0, min(15.0, new_alpha))
            new_beta = max(0.1, min(15.0, new_beta))
            
            self.alpha = new_alpha
            self.beta = new_beta
            
            logger.info(f"Cost Model Update (OLS Regression):")
            logger.info(f"   Window: last {len(history_to_use)} interactions")
            logger.info(f"   alpha: {old_alpha:.2f} -> {new_alpha:.2f} (fixed overhead)")
            logger.info(f"   beta: {old_beta:.2f} -> {new_beta:.2f} (reading speed)")
            logger.info(f"   Classification: {self._get_speed_label()}")

    def _get_speed_label(self) -> str:
        """Derive speed label from current beta value."""
        if self.beta < 1.5:
            return "FAST SKIMMER"
        elif self.beta > 3.0:
            return "CAREFUL READER"
        else:
            return "BALANCED"

    def get_reading_pattern(self):
        """Analyze user's reading pattern based on current alpha and beta."""
        WINDOW_SIZE = 5
        recent_history = self.user_history[-WINDOW_SIZE:]
        
        if len(recent_history) < 3:
            return {
                "pattern": "insufficient_data",
                "description": "Not enough data to determine pattern",
                "beta": None,
                "alpha": self.alpha,
                "avg_time": None
            }
        
        avg_time = np.mean([h[1] for h in recent_history])
        
        if self.beta < 1.5:
            pattern = "fast_skimmer"
            description = "Fast reader - low beta means cost formula naturally favors longer high-entropy tasks"
        elif self.beta > 3.0:
            pattern = "careful_reader"
            description = "Careful reader - high beta means cost formula naturally favors shorter high-entropy tasks"
        else:
            pattern = "balanced"
            description = "Balanced pace - cost formula optimizes entropy/cost ratio normally"
        
        return {
            "pattern": pattern,
            "description": description,
            "beta": round(self.beta, 2),
            "alpha": round(self.alpha, 2),
            "baseline_beta": 3.0,
            "avg_time": round(avg_time, 1),
            "sample_size": len(recent_history)
        }
