const BaseAnnotator = require('./BaseAnnotator');

class HonestAnnotator extends BaseAnnotator {
    constructor(name, config) {
        super(name, config);
    }

    decide(task, groundTruth) {
        // Honest Behavior (Humanized):
        // 1. Accuracy: High (~95%)
        // 2. Speed: Variable around reading speed (200 WPM)

        const wordCount = task.text.split(/\s+/).length;
        const readingSpeedMsPerWord = 200;

        // Base time calculation
        let timeMs = (wordCount * readingSpeedMsPerWord);

        // COGNITIVE OVERHEAD (Alpha):
        // Simulate "setup time" (context switching, button finding)
        // Match human behavior (2-4 seconds setup)
        const setupTimeMs = 2000 + (Math.random() * 2000);
        timeMs += setupTimeMs;

        // VARIANCE: +/- 20% random fluctuation
        const variance = 0.8 + (Math.random() * 0.4);
        timeMs = timeMs * variance;
        timeMs = Math.max(3000, timeMs); // Min 3 seconds (setup + quick read)

        // ACCURACY: 5% chance of honest mistake
        let label = groundTruth;
        if (Math.random() < 0.05) {
            // Assuming labels are available in config or defaulting
            // For simple binary/multi, we might just pick a wrong one if we knew the set.
            // Since we extract labels from groundTruth logic in Simulation, 
            // we simulate a "mistake" by hardcoding a likely wrong label or just 'Unknown'
            // Ideally we'd pick from a set. Let's toggle one if possible.
            if (label === 'Sports') label = 'World';
            else if (label === 'Business') label = 'Sci/Tech';
            // Simple swap for simulation sake
        }

        return {
            label: label,
            timeMs: timeMs
        };
    }
}

module.exports = HonestAnnotator;
