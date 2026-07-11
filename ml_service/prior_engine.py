import json
import os
from typing import Dict, List

import numpy as np

from difficulty_model import PRIORS_PATH


def estimate_cost_priors(records: List[Dict], labels: List[Dict]) -> Dict:
    text_by_id = {row["id"]: row["text"] for row in records}
    rows = []
    for label in labels:
        text = text_by_id.get(label["id"])
        if not text:
            continue
        rows.append((
            np.log1p(len(text.split())),
            float(label.get("expected_seconds", 0.0)),
            float(label.get("semantic_difficulty", 0.0)),
        ))
    if len(rows) < 10:
        raise ValueError("Need at least 10 cost-labeled rows to estimate cold-start priors")

    data = np.array(rows, dtype=float)
    log_lengths = data[:, 0]
    expected_seconds = data[:, 1]
    difficulties = data[:, 2]

    A = np.column_stack([np.ones(len(log_lengths)), log_lengths])
    alpha, beta = np.linalg.lstsq(A, expected_seconds, rcond=None)[0]
    alpha = float(max(1.0, min(15.0, alpha)))
    beta = float(max(0.1, min(15.0, beta)))

    return {
        "alpha_prior": round(alpha, 3),
        "beta_prior": round(beta, 3),
        "difficulty_mean": round(float(np.mean(difficulties)), 4),
        "difficulty_std": round(float(np.std(difficulties)), 4),
        "expected_seconds_mean": round(float(np.mean(expected_seconds)), 3),
        "sample_size": int(len(rows)),
        "justification": (
            "Priors are fit by least squares from transparent corpus bootstrap estimates "
            "against log word count. Once real session observations exist, use "
            "estimate_priors_from_observations for self-trained priors."
        ),
    }


def save_priors(priors: Dict, path: str = PRIORS_PATH) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(priors, f, indent=2)


def load_priors(path: str = PRIORS_PATH) -> Dict:
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)
