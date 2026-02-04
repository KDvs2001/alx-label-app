import argparse
import os
from datasets import load_dataset
from backbone import StandardBackbone

def main():
    parser = argparse.ArgumentParser(description="Pre-train CAL-Log backbone on a dataset")
    parser.add_argument("--dataset", default="ag_news", help="HuggingFace dataset name")
    parser.add_argument("--samples", type=int, default=500, help="Number of samples to train on")
    parser.add_argument("--output", default="pretrained_backbone.pkl", help="Output filename")
    args = parser.parse_args()

    print(f"🚀 Starting Pre-training on {args.dataset} ({args.samples} samples)...")

    # Load Dataset
    try:
        ds = load_dataset(args.dataset, split=f"train[:{args.samples}]")
        texts = ds['text']
        labels = ds['label']
        print(f"✅ Loaded {len(texts)} samples.")
    except Exception as e:
        print(f"❌ Failed to load dataset: {e}")
        return

    # Train
    bb = StandardBackbone(num_labels=4) # Defaulting to 4 for AG News
    bb.fine_tune(texts, labels, epochs=3)
    
    # Save
    bb.save_model(args.output)
    print(f"🎉 Pre-training complete. Saved to {args.output}")

if __name__ == "__main__":
    main()
