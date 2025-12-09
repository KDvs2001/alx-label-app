const BaseAnnotator = require('./BaseAnnotator');

class FatiguedAnnotator extends BaseAnnotator {
    constructor(name, config) {
        super(name, config);
        this.labels = config.labels || ["Positive", "Negative"];
        this.baseEnergy = 100;
        this.currentEnergy = 100;
    }

    decide(task, groundTruth) {
        // Fatigue Behavior (Humanized):
        // Energy drops non-linearly. Harder tasks drain more? For now static drop.

        // Drop rate increases as energy gets lower (Spiral effect)
        let dropRate = 2; // Base
        if (this.currentEnergy < 50) dropRate = 3;
        if (this.currentEnergy < 20) dropRate = 5;

        this.currentEnergy -= dropRate;
        this.currentEnergy = Math.max(0, this.currentEnergy); // Floor at 0

        // Base time
        const wordCount = task.text.split(/\s+/).length;
        let baseTime = wordCount * 200;

        // COGNITIVE OVERHEAD (Alpha)
        // Fatigued users take longer to START a task (Zoning out)
        // 100% Energy = 2s startup
        // 0% Energy = 8s startup (Staring at screen)
        const fatigueFactor = (100 - this.currentEnergy) / 100; // 0.0 to 1.0
        const setupOverhead = 2000 + (fatigueFactor * 6000) + (Math.random() * 1000);

        baseTime += setupOverhead;

        // Apply Fatigue Penalty (Exponential breakdown)
        if (this.currentEnergy < 50) {
            baseTime = baseTime * 1.5; // 50% Slower
            console.log(`   [${this.name}] 🥱 Beginning to tire...`);
        }
        if (this.currentEnergy < 20) {
            baseTime = baseTime * 3.0; // 300% Slower (Struggling)
            console.log(`   [${this.name}] 💤 Exhausted.`);
        }

        // Error Rate increases dramatically with Fatigue
        let label = groundTruth;

        // < 40% Energy = 20% mistake chance
        // < 20% Energy = 50% mistake chance
        let mistakeChance = 0;
        if (this.currentEnergy < 40) mistakeChance = 0.2;
        if (this.currentEnergy < 20) mistakeChance = 0.5;

        if (Math.random() < mistakeChance) {
            console.log(`   [${this.name}] ❌ Made a mistake due to fatigue (Energy: ${this.currentEnergy}%)`);
            // Pick random wrong label if possible
            const otherLabels = this.labels.filter(l => l !== groundTruth);
            if (otherLabels.length > 0) {
                label = otherLabels[Math.floor(Math.random() * otherLabels.length)];
            } else {
                label = this.labels[Math.floor(Math.random() * this.labels.length)];
            }
        }

        // Ambiguous Flag triggering (giving up)
        let isAmbiguous = false;
        if (this.currentEnergy < 15 && Math.random() < 0.4) {
            isAmbiguous = true; // "I don't know, just flag it"
        }

        return {
            label: label,
            timeMs: baseTime,
            isAmbiguous: isAmbiguous
        };
    }

    // Fatigue Nudge / Break
    async markBreak() {
        console.log(`   [${this.name}] ☕ Taking a coffee break...`);
        await this.sleep(3000); // 3s break

        // Realistic Recovery: Only recover to 80% (Can't get back to full fresh state)
        this.currentEnergy = 80;
        console.log(`   [${this.name}] Back to work. Energy at ${this.currentEnergy}%`);
    }
}

module.exports = FatiguedAnnotator;
