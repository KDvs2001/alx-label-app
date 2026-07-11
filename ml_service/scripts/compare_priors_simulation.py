import argparse
import json
import os
import random
import sys

import numpy as np
from sklearn.metrics import f1_score

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from cost_engine import AdaptiveCostModel
from difficulty_model import load_dataset_sample
from models.cal_log_ranker import CALLogRanker
from prior_engine import load_priors
from utilities.simple_backbone import SimpleBackbone


def normalize_label(value):
    return 1 if str(value).lower() in {"positive", "1", "true"} else 0


def evaluate(model, test_set):
    y_true = [row["label"] for row in test_set]
    y_pred = model.predict([row["text"] for row in test_set])
    return float(f1_score(y_true, y_pred, average="macro"))


def run_strategy(records, alpha, beta, target_f1, max_annotations, seed):
    rng = random.Random(seed)
    shuffled = list(records)
    rng.shuffle(shuffled)
    test_set = shuffled[:100]
    pool = shuffled[100:]
    seed_set = pool[:120]
    pool = pool[120:]

    model = SimpleBackbone(num_labels=2)
    model.partial_fit([row["text"] for row in seed_set], [row["label"] for row in seed_set])
    cost_model = AdaptiveCostModel(alpha_prior=alpha, beta_prior=beta, use_semantic_cost=False)
    ranker = CALLogRanker(cost_model)

    cumulative_seconds = 0.0
    f1_history = [{"annotations": 0, "f1": evaluate(model, test_set), "seconds": 0.0}]
    pending_x, pending_y = [], []

    for step in range(1, max_annotations + 1):
        candidates = pool[:min(200, len(pool))]
        if not candidates:
            break
        task_rows = [{"taskId": row["id"], "text": row["text"]} for row in candidates]
        probs = model.predict_proba([row["text"] for row in candidates])
        ranked = ranker.rank_by_cal_log(task_rows, probs)
        if not ranked:
            break

        selected_id = ranked[0]["id"]
        selected = next(row for row in candidates if row["id"] == selected_id)
        pool = [row for row in pool if row["id"] != selected_id]
        cumulative_seconds += ranked[0]["transparency_report"]["cost_analysis"]["predicted_seconds"]
        pending_x.append(selected["text"])
        pending_y.append(selected["label"])

        if step % 5 == 0:
            model.partial_fit(pending_x, pending_y)
            pending_x, pending_y = [], []
            f1_history.append({"annotations": step, "f1": evaluate(model, test_set), "seconds": round(cumulative_seconds, 3)})
            if f1_history[-1]["f1"] >= target_f1:
                break

    best = max(f1_history, key=lambda row: row["f1"])
    reached = next((row for row in f1_history if row["f1"] >= target_f1), None)
    return {
        "target_f1": target_f1,
        "reached_target": reached is not None,
        "time_to_target_seconds": reached["seconds"] if reached else None,
        "annotations_to_target": reached["annotations"] if reached else None,
        "best_f1": round(best["f1"], 4),
        "history": f1_history,
    }


def main():
    parser = argparse.ArgumentParser(description="Compare CAL-Log default priors vs offline LLM-informed priors.")
    parser.add_argument("--dataset", default=None)
    parser.add_argument("--limit", type=int, default=1200)
    parser.add_argument("--target-f1", type=float, default=0.72)
    parser.add_argument("--max-annotations", type=int, default=80)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--output", default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "artifacts", "prior_comparison.json"))
    args = parser.parse_args()

    records = load_dataset_sample(args.dataset, args.limit)
    for row in records:
        row["label"] = normalize_label(row["label"])
    priors = load_priors()
    alpha_prior = priors.get("alpha_prior", 5.0)
    beta_prior = priors.get("beta_prior", 3.0)

    result = {
        "dataset": args.dataset or "ml_service/dataset.json",
        "default_priors": {"alpha": 5.0, "beta": 3.0, **run_strategy(records, 5.0, 3.0, args.target_f1, args.max_annotations, args.seed)},
        "llm_informed_priors": {"alpha": alpha_prior, "beta": beta_prior, **run_strategy(records, alpha_prior, beta_prior, args.target_f1, args.max_annotations, args.seed)},
    }
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
