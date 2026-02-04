"""
CAL-Log Ranker: Pure entropy-based task ranking logic.
Implements the core CAL-Log formula: Score = Entropy / Cost
"""
import numpy as np
from typing import List, Dict, Any


class CALLogRanker:
    """Ranks tasks by information value per unit of annotation cost."""
    
    def __init__(self, cost_model):
        self.cost_model = cost_model
    
    def calculate_entropy(self, probabilities: np.ndarray) -> np.ndarray:
        """
        Calculate Shannon entropy for each prediction.
        
        Args:
            probabilities: Shape (n_tasks, n_classes)
        
        Returns:
            entropy: Shape (n_tasks,) - Higher = more uncertain/informative
        """
        # Avoid log(0) with small epsilon
        epsilon = 1e-9
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
        lengths = [len(t.split()) for t in texts]
        costs = self.cost_model.predict(lengths)
        return costs
    
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
        costs = self.calculate_costs(texts)
        
        # CAL-Log formula
        scores = entropy / costs
        
        # Apply deduplication penalties if provided
        if penalties is not None:
            final_scores = scores * penalties
        else:
            final_scores = scores
            penalties = np.ones(len(tasks))  # No penalty
        
        # Sort by descending score
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
                    "label_index": int(np.argmax(probabilities[idx])),
                    "confidence": float(np.max(probabilities[idx]))
                },
                "transparency_report": {
                    "phase": "CAL-Log Active",
                    "cost_analysis": {
                        "predicted_seconds": float(costs[idx]),
                        "context_penalty": "Adaptive"
                    },
                    "math_proof": {
                        "entropy": float(entropy[idx]),
                        "redundancy_penalty": float(penalties[idx]),
                        "cal_log_score": float(scores[idx])
                    }
                }
            }
            ranked_tasks.append(task_resp)
        
        return ranked_tasks
    
    def rank_cold_start(
        self, 
        tasks: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Rank tasks during cold start (no model yet).
        Uses cost-only ranking (shorter tasks first).
        
        Args:
            tasks: List of task dictionaries
        
        Returns:
            ranked_tasks: Sorted by ascending cost
        """
        texts = [t['text'] for t in tasks]
        costs = self.calculate_costs(texts)
        
        # Sort by ascending cost (cheaper first)
        sorted_indices = np.argsort(costs)
        
        ranked_tasks = []
        for idx in sorted_indices[:50]:  # Return top 50
            ranked_tasks.append({
                "id": tasks[idx]['taskId'],
                "text": tasks[idx]['text'],
                "score": 1.0 / costs[idx],  # Inverse cost as score
                "prediction": {"label_index": 0, "confidence": 0.5},
                "transparency_report": {
                    "phase": "Cold Start (Cost-Only)",
                    "cost_analysis": {
                        "predicted_seconds": float(costs[idx]),
                        "context_penalty": "None"
                    },
                    "math_proof": {
                        "entropy": 0.0,
                        "redundancy_penalty": 1.0,
                        "cal_log_score": 0.0
                    }
                }
            })
        
        return ranked_tasks
    
    def rank_by_entropy_only(
        self, 
        tasks: List[Dict[str, Any]], 
        probabilities: np.ndarray
    ) -> List[Dict[str, Any]]:
        """
        Rank tasks by entropy only (ignore cost).
        Used for Entropy-only baseline strategy.
        
        Args:
            tasks: List of task dictionaries
            probabilities: Model predictions, shape (n_tasks, n_classes)
        
        Returns:
            ranked_tasks: Sorted by descending entropy
        """
        texts = [t['text'] for t in tasks]
        
        # Calculate entropy
        entropy = self.calculate_entropy(probabilities)
        costs = self.calculate_costs(texts)  # Still calculate for transparency
        
        # Sort by descending entropy (no cost division)
        sorted_indices = np.argsort(entropy)[::-1]
        
        ranked_tasks = []
        for idx in sorted_indices:
            if entropy[idx] <= 0:
                continue
            
            task_resp = {
                "id": tasks[idx]['taskId'],
                "text": tasks[idx]['text'],
                "score": float(entropy[idx]),  # Pure entropy score
                "prediction": {
                    "label_index": int(np.argmax(probabilities[idx])),
                    "confidence": float(np.max(probabilities[idx]))
                },
                "transparency_report": {
                    "phase": "Entropy-Only Active",
                    "cost_analysis": {
                        "predicted_seconds": float(costs[idx]),
                        "context_penalty": "Ignored"
                    },
                    "math_proof": {
                        "entropy": float(entropy[idx]),
                        "redundancy_penalty": 1.0,
                        "cal_log_score": 0.0  # Not used
                    }
                }
            }
            ranked_tasks.append(task_resp)
        
        return ranked_tasks

