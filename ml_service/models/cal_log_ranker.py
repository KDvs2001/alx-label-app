"""
CAL-Log Ranker: Pure entropy-based task ranking logic.
Implements the core CAL-Log formula: Score = Entropy / Cost
"""
import numpy as np
# typing hints so function signatures are self-documenting
# CITATION: typing module - type hints for function parameters and return values
# SOURCE: Python Software Foundation (n.d.). "typing - Support for type hints"
# URL: https://docs.python.org/3/library/typing.html
from typing import List, Dict, Any


class CALLogRanker:
    """
    The main CAL-Log ranking engine.
    
    Standard active learning (Uncertainty Sampling) just picks the most uncertain items,
    which often ends up feeding the user massive, exhausting paragraphs. 
    This class implements the CAL-Log formula to fix that by dividing the 
    Information Gain (Entropy) by our predicted cognitive cost constraint.
    
    Core formula: Score = Entropy(x) / (Alpha + Beta * log(Length(x)))
    """
    
    def __init__(self, cost_model):
        self.cost_model = cost_model
    
    def calculate_entropy(self, probabilities: np.ndarray) -> np.ndarray:
        """
        Calculates Shannon entropy for the model's predictions.
        
        A raw [0.5, 0.5] output from the model means it's completely guessing (max entropy = 1.0).
        We want to find these highly uncertain items because they give us the most bang for our buck 
        when we retrain the model.
        
        Args:
            probabilities: Shape (n_tasks, n_classes)
        
        Returns:
            entropy: Shape (n_tasks,) - Higher = more uncertain/informative
        """
        # epsilon prevents log(0) which would blow up to -inf in edge cases
        # where the model is 100% confident about one class
        epsilon = 1e-9
        # Shannon entropy: H(x) = -sum(p * log(p)) across all classes.
        # higher entropy = more uncertainty = more informative for retraining.
        # CITATION: Shannon entropy - measure of uncertainty in a probability distribution
        # SOURCE: Stack Overflow (2015). "Shannon entropy calculation in Python"
        # URL: https://stackoverflow.com/questions/15450192/fastest-way-to-compute-entropy-in-python
        entropy = -np.sum(probabilities * np.log(probabilities + epsilon), axis=1)
        return entropy
    
    def calculate_costs(self, texts: List[str]) -> np.ndarray:
        """
        Predict annotation cost for each task.
        
        Args:
            texts: List of task text strings
        
        Returns:
            costs: Shape (n_tasks,) - Predicted seconds to annotate
        """
        # count words with split() and let the cost model predict time from length
        # CITATION: str.split() - split a string into a list of words by whitespace
        # SOURCE: Python Software Foundation (n.d.). "str.split"
        # URL: https://docs.python.org/3/library/stdtypes.html#str.split
        if hasattr(self.cost_model, "predict_with_breakdown"):
            return self.cost_model.predict_with_breakdown(texts)["costs"]
        lengths = [len(t.split()) for t in texts]
        return self.cost_model.predict(lengths, texts=texts)
    
    def rank_by_cal_log(
        self, 
        tasks: List[Dict[str, Any]], 
        probabilities: np.ndarray,
        penalties: np.ndarray = None
    ) -> List[Dict[str, Any]]:
        """
        Rank tasks by CAL-Log score (Entropy / Cost).
        
        Args:
            tasks: List of task dictionaries with 'taskId' and 'text'
            probabilities: Model predictions, shape (n_tasks, n_classes)
            penalties: Optional redundancy penalties, shape (n_tasks,)
        
        Returns:
            ranked_tasks: Sorted list with scores and transparency reports
        """
        texts = [t['text'] for t in tasks]
        
        # Calculate components
        entropy = self.calculate_entropy(probabilities)
        cost_breakdown = (
            self.cost_model.predict_with_breakdown(texts)
            if hasattr(self.cost_model, "predict_with_breakdown")
            else {"costs": self.calculate_costs(texts)}
        )
        costs = cost_breakdown["costs"]
        
        # the CAL-Log formula: Score = Uncertainty / Expected Time.
        # this naturally adapts to the user's fatigue. if the user slows down
        # (beta goes up), the cost of long texts skyrockets, pushing shorter
        # punchier tasks to the top without any hardcoded rules.
        # CITATION: numpy element-wise division - divide two arrays element by element
        # SOURCE: NumPy (n.d.). "numpy.divide"
        # URL: https://numpy.org/doc/stable/reference/generated/numpy.divide.html
        scores = entropy / costs
        
        # Apply deduplication penalties if provided
        if penalties is not None:
            final_scores = scores * penalties
        else:
            final_scores = scores
            penalties = np.ones(len(tasks))  # No penalty
        
        # sort by descending score so the most informative-per-second tasks come first.
        # argsort gives ascending indices, [::-1] flips them.
        # CITATION: np.argsort()[::-1] - get indices that sort an array in descending order
        # SOURCE: Stack Overflow (2011). "How to get indices of sorted array in descending order"
        # URL: https://stackoverflow.com/questions/16486252/is-it-possible-to-use-argsort-in-descending-order
        sorted_indices = np.argsort(final_scores)[::-1]
        
        # Build response
        ranked_tasks = []
        for idx in sorted_indices:
            # Skip tasks with zero or negative scores
            if final_scores[idx] <= 0:
                continue
            
            task_resp = {
                "id": tasks[idx]['taskId'],
                "text": tasks[idx]['text'],
                "score": float(final_scores[idx]),
                "prediction": {
                    # argmax gives the index of the winning class, max gives its confidence
                    # CITATION: np.argmax() - index of the maximum value in an array
                    # SOURCE: NumPy (n.d.). "numpy.argmax"
                    # URL: https://numpy.org/doc/stable/reference/generated/numpy.argmax.html
                    "label_index": int(np.argmax(probabilities[idx])),
                    "confidence": float(np.max(probabilities[idx]))
                },
                "transparency_report": {
                    "phase": "CAL-Log Active",
                    "cost_analysis": {
                        "predicted_seconds": float(costs[idx]),
                        "base_seconds": float(cost_breakdown.get("base_costs", costs)[idx]),
                        "semantic_difficulty": float(cost_breakdown.get("semantic_difficulty", np.zeros(len(tasks)))[idx]),
                        "semantic_penalty": float(cost_breakdown.get("semantic_penalty", np.zeros(len(tasks)))[idx]),
                        "semantic_enabled": bool(cost_breakdown.get("semantic_enabled", False)),
                        "gamma": float(cost_breakdown.get("gamma", 0.0)),
                        "context_penalty": "Adaptive + semantic difficulty" if cost_breakdown.get("semantic_enabled", False) else "Adaptive"
                    },
                    "math_proof": {
                        "entropy": float(entropy[idx]),
                        "redundancy_penalty": float(penalties[idx]),
                        "cal_log_score": float(scores[idx]),
                        "final_adjusted_score": float(final_scores[idx])
                    }
                }
            }
            ranked_tasks.append(task_resp)
        
        
        return ranked_tasks
