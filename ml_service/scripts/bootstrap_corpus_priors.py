import argparse
import json
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from difficulty_model import bootstrap_cost_labels, load_dataset_sample
from prior_engine import PRIORS_PATH, estimate_cost_priors, save_priors


def main():
    parser = argparse.ArgumentParser(description="Create zero-cost cold-start priors from transparent corpus features.")
    parser.add_argument("--dataset", default=None)
    parser.add_argument("--limit", type=int, default=500)
    parser.add_argument("--output", default=PRIORS_PATH)
    args = parser.parse_args()

    records = load_dataset_sample(args.dataset, args.limit)
    labels = bootstrap_cost_labels(records)
    priors = estimate_cost_priors(records, labels)
    priors["source"] = "transparent_corpus_bootstrap"
    save_priors(priors, args.output)
    print(json.dumps(priors, indent=2))


if __name__ == "__main__":
    main()
