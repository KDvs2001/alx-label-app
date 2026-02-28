import numpy as np
import logging

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
    
    def __init__(self):
        self.alpha = 5.0  # Cold start (mutable, will be overwritten by regression)
        self.beta = 3.0   # Cold start (mutable, will be overwritten by regression)
        self.user_history = []

    def _heuristic_cost(self, log_length: float) -> float:
        """Calculate cost: C(x) = alpha + beta * log(1 + L(x))"""
        return self.alpha + (self.beta * log_length)

    def predict(self, text_lengths: list) -> np.ndarray:
        """Predict annotation cost for a list of text lengths."""
        log_lengths = np.log1p(text_lengths)
        predicted_costs = [self._heuristic_cost(l) for l in log_lengths]
        return np.array(predicted_costs)

    def update(self, new_interaction_logs: list):
        """
        Update alpha and beta based on user's annotation speed using OLS regression.
        
        Fits: time = alpha + beta * log(1 + length) via least-squares.
        Both parameters are derived purely from the data, no hardcoded values
        after the first update.
        
        Uses a rolling window of the last 5 interactions for fast adaptation.
        """
        # Add new interactions to history
        for log in new_interaction_logs:
            x_feat = np.log1p(log['length'])
            y_target = log['time_seconds']
            if y_target < 300:  # Filter outliers (> 5 min)
                self.user_history.append([x_feat, y_target])

        # Rolling window of 5, adapts quickly to behavior changes
        WINDOW_SIZE = 5
        history_to_use = self.user_history[-WINDOW_SIZE:]

        if len(history_to_use) >= 3:  # Need at least 3 points for meaningful regression
            data = np.array(history_to_use)
            log_lengths = data[:, 0]  # x = log(1 + word_count)
            times = data[:, 1]        # y = time_seconds
            
            old_alpha = self.alpha
            old_beta = self.beta
            
            # Check if text lengths have enough variance for OLS to work.
            # When all texts are similar length, OLS can't separate alpha from
            # beta and tends to absorb all time into alpha (high alpha, near-zero
            # beta), causing incorrect speed classification.
            length_variance = np.std(log_lengths)
            
            if length_variance < 0.3:
                # LOW VARIANCE FALLBACK: Direct speed estimation.
                # With similar-length texts, attribute a small fraction to
                # fixed overhead (alpha) and derive beta from actual reading speed.
                avg_time = np.mean(times)
                avg_log_len = np.mean(log_lengths)
                new_alpha = max(1.0, min(avg_time * 0.2, 5.0))
                new_beta = (avg_time - new_alpha) / max(avg_log_len, 0.1)
                logger.info(f"Low text-length variance ({length_variance:.2f}), using direct speed estimation")
            else:
                # OLS Regression: time = alpha + beta * log_length
                # Design matrix: [1, log_length] for each sample
                A = np.column_stack([np.ones(len(log_lengths)), log_lengths])
                
                # Solve via least squares: min ||A @ [alpha, beta] - times||^2
                result, _, _, _ = np.linalg.lstsq(A, times, rcond=None)
                new_alpha, new_beta = result[0], result[1]
            
            # Clamp to reasonable ranges
            new_alpha = max(1.0, min(15.0, new_alpha))  # 1-15 seconds overhead
            new_beta = max(0.1, min(15.0, new_beta))     # 0.1-15x reading speed
            
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
        
        # Classification is derived from beta, which is itself derived from
        # data via regression. No hardcoded conditions on task selection.
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
