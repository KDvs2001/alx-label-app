import numpy as np
from sklearn.linear_model import LinearRegression

class AdaptiveCostModel:
    def __init__(self):
        # Default parameters from your paper (Cold Start)
        self.alpha = 5.0  # Overhead
        self.beta = 3.0   # Reading Speed
        self.user_history = [] # Stores (log_length, time_taken)

    def _heuristic_cost(self, log_length: float) -> float:
        return self.alpha + (self.beta * log_length)

    def predict(self, text_lengths: list) -> np.ndarray:
        log_lengths = np.log1p(text_lengths) 
        predicted_costs = [self._heuristic_cost(l) for l in log_lengths]
        return np.array(predicted_costs)

    def update(self, new_interaction_logs: list):
        for log in new_interaction_logs:
            x_feat = np.log1p(log['length'])
            y_target = log['time_ms'] / 1000.0
            if y_target < 300: 
                self.user_history.append([x_feat, y_target])

        WINDOW_SIZE = 50
        history_to_use = self.user_history[-WINDOW_SIZE:]

        if len(history_to_use) >= 1:
            data = np.array(history_to_use)
            X = data[:, 0].reshape(-1, 1) 
            Y = data[:, 1]                
            reg = LinearRegression().fit(X, Y)
            self.alpha = max(0.1, reg.intercept_)
            self.beta = max(0.1, reg.coef_[0])
