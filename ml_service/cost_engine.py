import numpy as np
import logging

logger = logging.getLogger("CostEngine")

class AdaptiveCostModel:
    """
    Adaptive Cost Model for CAL-Log.
    
    Cost formula: C(x) = α + β × log(1 + L(x))
    
    SIMPLIFIED APPROACH:
    - α is FIXED at 5.0 (paper value, KLM-GOMS based)
    - β is calculated directly: β = (avg_time - α) / avg_log_length
    
    This eliminates regression instability issues.
    """
    
    ALPHA = 5.0  # Fixed overhead (seconds)
    
    def __init__(self):
        self.alpha = self.ALPHA
        self.beta = 3.0   # Cold start baseline
        self.user_history = []

    def _heuristic_cost(self, log_length: float) -> float:
        """Calculate cost: C(x) = α + β × log(1 + L(x))"""
        return self.alpha + (self.beta * log_length)

    def predict(self, text_lengths: list) -> np.ndarray:
        """Predict annotation cost for a list of text lengths."""
        log_lengths = np.log1p(text_lengths)
        predicted_costs = [self._heuristic_cost(l) for l in log_lengths]
        return np.array(predicted_costs)

    def update(self, new_interaction_logs: list):
        """
        Update β based on user's annotation speed.
        
        Simple formula: β = (avg_time - α) / avg_log_length
        
        This directly captures reading speed without regression complications.
        """
        # Add new interactions to history
        for log in new_interaction_logs:
            x_feat = np.log1p(log['length'])
            y_target = log['time_seconds']
            if y_target < 300:
                self.user_history.append([x_feat, y_target])

        # Use last 10 annotations (Matches training batch size for clean phase shift)
        WINDOW_SIZE = 10
        history_to_use = self.user_history[-WINDOW_SIZE:]

        if len(history_to_use) >= 5:
            data = np.array(history_to_use)
            log_lengths = data[:, 0]
            times = data[:, 1]
            
            avg_log_length = float(np.mean(log_lengths))
            avg_time = float(np.mean(times))
            
            old_beta = self.beta
            
            # Simple direct calculation
            # β = (avg_time - α) / avg_log_length
            new_beta = (avg_time - self.ALPHA) / max(avg_log_length, 1.0)
            
            # Clamp to reasonable range
            new_beta = max(0.1, min(10.0, new_beta))
            
            self.beta = new_beta
            
            logger.info(f"📊 Beta Update:")
            logger.info(f"   avg_time={avg_time:.2f}s, avg_log_length={avg_log_length:.2f}")
            logger.info(f"   α={self.ALPHA:.1f} (FIXED)")
            logger.info(f"   β: {old_beta:.2f} → {new_beta:.2f}")
            logger.info(f"   Classification: {self._classify_speed(new_beta)}")

    def _classify_speed(self, beta: float) -> str:
        """Classify reading speed."""
        # Thresholds based on avg_log_length ≈ 5.3:
        # - 10s avg → β ≈ 0.9 (fast)
        # - 15s avg → β ≈ 1.9 (balanced)
        # - 25s avg → β ≈ 3.8 (slow)
        if self.beta < 1.5:
            return "FAST SKIMMER"
        elif self.beta > 3.0:
            return "CAREFUL READER"
        else:
            return "BALANCED"

    def get_reading_pattern(self):
        """Analyze user's reading pattern based on β."""
        WINDOW_SIZE = 10
        recent_history = self.user_history[-WINDOW_SIZE:]
        
        if len(recent_history) < 5:
            return {
                "pattern": "insufficient_data",
                "description": "Not enough data to determine pattern",
                "beta": None,
                "alpha": self.ALPHA,
                "avg_time": None
            }
        
        avg_time = np.mean([h[1] for h in recent_history])
        
        # Thresholds: Fast β<1.5 (~10s), Balanced 1.5-3.0 (~15s), Careful β>3.0 (~25s)
        if self.beta < 1.5:
            pattern = "fast_skimmer"
            description = "Fast reader - CAL-Log selects longer high-entropy tasks you can handle efficiently"
        elif self.beta > 3.0:
            pattern = "careful_reader"
            description = "Careful reader - CAL-Log selects shorter high-entropy tasks to maximize throughput"
        else:
            pattern = "balanced"
            description = "Balanced pace - CAL-Log optimizes entropy/cost ratio"
        
        return {
            "pattern": pattern,
            "description": description,
            "beta": round(self.beta, 2),
            "alpha": self.ALPHA,
            "baseline_beta": 3.0,
            "avg_time": round(avg_time, 1),
            "sample_size": len(recent_history)
        }
