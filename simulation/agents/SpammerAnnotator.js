const BaseAnnotator = require('./BaseAnnotator');

class SpammerAnnotator extends BaseAnnotator {
    constructor(name, config) {
        super(name, config);
        this.labels = config.labels || ["Positive", "Negative"];
    }

    decide(task, groundTruth) {
        // Spammer Behavior (Humanized/Smart):
        // 1. "Smart" Spam: Only spams 70% of the time to avoid basic detection.
        // 2. High variance in speed (sometimes fast, sometimes acts normal).

        const isSpamming = Math.random() < 0.7; // 70% chance to spam

        if (isSpamming) {
            // SPAM MODE: Pick random label
            const randomLabel = this.labels[Math.floor(Math.random() * this.labels.length)];

            // Fast but variable (0.5s - 1.5s)
            return {
                label: randomLabel,
                timeMs: 500 + (Math.random() * 1000)
            };
        } else {
            // ACTING NORMAL (30% chance)
            // Correct label but faster than honest user
            return {
                label: groundTruth,
                timeMs: 1500 + (Math.random() * 1000) // 1.5s - 2.5s
            };
        }
    }
}

module.exports = SpammerAnnotator;
