import argparse
import json
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from difficulty_model import (
    DIFFICULTY_MODEL_PATH,
    OBSERVATIONS_PATH,
    estimate_priors_from_observations,
    load_observations,
    observations_from_session_export,
    read_jsonl,
    train_self_trained_model,
    write_jsonl,
)
from prior_engine import PRIORS_PATH, save_priors


def load_imported_sessions(paths):
    rows = []
    for path in paths:
        with open(path, "r", encoding="utf-8") as f:
            payload = json.load(f)
        rows.extend(observations_from_session_export(payload))
    return rows


def main():
    parser = argparse.ArgumentParser(description="Train CAL-Log's local difficulty/cost model from real annotation sessions.")
    parser.add_argument("--observations", default=OBSERVATIONS_PATH)
    parser.add_argument("--import-session-json", nargs="*", default=[])
    parser.add_argument("--artifact", default=DIFFICULTY_MODEL_PATH)
    parser.add_argument("--priors-output", default=PRIORS_PATH)
    parser.add_argument("--metrics-output", default=os.path.join(os.path.dirname(DIFFICULTY_MODEL_PATH), "session_cost_model_eval.json"))
    args = parser.parse_args()

    observations = read_jsonl(args.observations)
    imported = load_imported_sessions(args.import_session_json)
    if imported:
        observations.extend(imported)
        write_jsonl(args.observations, observations)

    observations = load_observations(args.observations)
    priors = estimate_priors_from_observations(observations)
    metrics = train_self_trained_model(observations, args.artifact)
    save_priors(priors, args.priors_output)

    output = {"priors": priors, "difficulty_model": metrics}
    with open(args.metrics_output, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
