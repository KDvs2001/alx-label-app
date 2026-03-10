import numpy as np
import logging

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
    
    def __init__(self):
        self.alpha = 5.0  # Cold start (mutable, will be overwritten by regression)
        self.beta = 3.0   # Cold start (mutable, will be overwritten by regression)
        self.user_history = []

    def _heuristic_cost(self, log_length: float) -> float:
        """Calculate cost: C(x) = alpha + beta * log(1 + L(x))"""
        return self.alpha + (self.beta * log_length)

    def predict(self, text_lengths: list) -> np.ndarray:
        """Predict annotation cost for a list of text lengths."""
        # log1p(x) = ln(1 + x), more numerically stable than log(1+x) for small x
        # CITATION: np.log1p() — natural log of (1 + x) with better precision near zero
        # SOURCE: NumPy (n.d.). "numpy.log1p"
        # URL: https://numpy.org/doc/stable/reference/generated/numpy.log1p.html
        log_lengths = np.log1p(text_lengths)
        predicted_costs = [self._heuristic_cost(l) for l in log_lengths]
        # wrap the result as a numpy array so callers get vectorised operations
        # CITATION: np.array() — create an ndarray from a Python list
        # SOURCE: NumPy (n.d.). "numpy.array"
        # URL: https://numpy.org/doc/stable/reference/generated/numpy.array.html
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

        # keep the last 5 interactions as a rolling window for fast adaptation.
        # list[-N:] grabs the tail of the list without copying the rest.
        # CITATION: list[-N:] — slice the last N elements (negative indexing)
        # SOURCE: Stack Overflow (2009). "Get last N elements of a list"
        # URL: https://stackoverflow.com/questions/646644/how-to-get-last-items-of-a-list-in-python
        WINDOW_SIZE = 5
        history_to_use = self.user_history[-WINDOW_SIZE:]

        if len(history_to_use) >= 3:  # Need at least 3 points for meaningful regression
            data = np.array(history_to_use)
            log_lengths = data[:, 0]  # x = log(1 + word_count)
            times = data[:, 1]        # y = time_seconds
            
            old_alpha = self.alpha
            old_beta = self.beta
            
            # check if text lengths have enough variance for OLS to work.
            # when all texts are similar length, OLS can't separate alpha from
            # beta and tends to absorb all time into alpha (high alpha, near-zero
            # beta), causing incorrect speed classification.
            # CITATION: np.std() — compute the standard deviation of an array
            # SOURCE: NumPy (n.d.). "numpy.std"
            # URL: https://numpy.org/doc/stable/reference/generated/numpy.std.html
            length_variance = np.std(log_lengths)
            
            if length_variance < 0.3:
                # LOW VARIANCE FALLBACK: direct speed estimation.
                # with similar-length texts, attribute a small fraction to
                # fixed overhead (alpha) and derive beta from actual reading speed.
                # CITATION: np.mean() — compute the arithmetic mean of an array
                # SOURCE: NumPy (n.d.). "numpy.mean"
                # URL: https://numpy.org/doc/stable/reference/generated/numpy.mean.html
                avg_time = np.mean(times)
                avg_log_len = np.mean(log_lengths)
                # clamp alpha between 1.0 and 5.0 to keep it physically sensible
                new_alpha = max(1.0, min(avg_time * 0.2, 5.0))
                new_beta = (avg_time - new_alpha) / max(avg_log_len, 0.1)
                logger.info(f"Low text-length variance ({length_variance:.2f}), using direct speed estimation")
            else:
                # OLS regression: time = alpha + beta * log_length
                # design matrix: [1, log_length] for each sample
                # CITATION: np.column_stack() — stack 1-D arrays as columns into a 2-D matrix
                # SOURCE: NumPy (n.d.). "numpy.column_stack"
                # URL: https://numpy.org/doc/stable/reference/generated/numpy.column_stack.html
                A = np.column_stack([np.ones(len(log_lengths)), log_lengths])
                
                # solve via least squares: min ||A @ [alpha, beta] - times||^2
                # CITATION: np.linalg.lstsq() — solve a least-squares problem (OLS regression)
                # SOURCE: NumPy (n.d.). "numpy.linalg.lstsq"
                # URL: https://numpy.org/doc/stable/reference/generated/numpy.linalg.lstsq.html
                result, _, _, _ = np.linalg.lstsq(A, times, rcond=None)
                new_alpha, new_beta = result[0], result[1]
            
            # clamp to reasonable ranges so the cost model doesn't go haywire
            # CITATION: max(min()) pattern — numeric clamping idiom in Python
            # SOURCE: Stack Overflow (2012). "Clamp a value to a range in Python"
            # URL: https://stackoverflow.com/questions/9775731/clamping-floating-numbers-in-python
            new_alpha = max(1.0, min(15.0, new_alpha))  # 1-15 seconds overhead
            new_beta = max(0.1, min(15.0, new_beta))     # 0.1-15x reading speed
            
            self.alpha = new_alpha
            self.beta = new_beta
            
            # log the update so we can trace parameter drift during a session
            # CITATION: f-string — formatted string literals for inline variable interpolation
            # SOURCE: Python Software Foundation (n.d.). "Formatted string literals"
            # URL: https://docs.python.org/3/reference/lexical_analysis.html#f-strings
            logger.info(f"Cost Model Update (OLS Regression):")
            logger.info(f"   Window: last {len(history_to_use)} interactions")
            logger.info(f"   alpha: {old_alpha:.2f} -> {new_alpha:.2f} (fixed overhead)")
            logger.info(f"   beta: {old_beta:.2f} -> {new_beta:.2f} (reading speed)")
            logger.info(f"   Classification: {self._get_speed_label()}")

    def _get_speed_label(self) -> str:
        """Derive speed label from current beta value."""
        # simple threshold classification — beta < 1.5 means the reader
        # is fast enough that length barely affects their annotation time
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
        
        # pull the time component from each [log_length, time] pair
        # CITATION: list comprehension - extract one field from a list of tuples/lists
        # SOURCE: Stack Overflow (2012). "Getting a list of values from a list of dicts"
        # URL: https://stackoverflow.com/questions/7271482/getting-a-list-of-values-from-a-list-of-dicts
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
            # round() keeps the JSON payload clean for the frontend
            # CITATION: round() - round a float to N decimal places
            # SOURCE: Python Software Foundation (n.d.). "Built-in Functions: round"
            # URL: https://docs.python.org/3/library/functions.html#round
            "beta": round(self.beta, 2),
            "alpha": round(self.alpha, 2),
            "baseline_beta": 3.0,
            "avg_time": round(avg_time, 1),
            "sample_size": len(recent_history)
        }
