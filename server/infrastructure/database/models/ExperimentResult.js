// Schema for storing offline experiment benchmark results (pre-seeded data).
// These records drive the comparison charts that show CAL-Log vs baselines.
const mongoose = require("mongoose");

const ExperimentResultSchema = new mongoose.Schema({
    dataset: { type: String, required: true }, // e.g., "ag_news", "imdb", "tweet_eval"
    strategy: { type: String, required: true }, // e.g., "CAL-Log", "Random", "BADGE", "Entropy"
    totalCost: { type: Number, required: true }, // Total annotation time in seconds
    f1Score: { type: Number, required: true }, // Model F1 score
    accuracy: { type: Number }, // Model accuracy (optional)
    pValue: { type: Number },            // statistical significance (Mann-Whitney U test)
    cohensD: { type: Number },            // effect size for practical significance
    tasksAnnotated: { type: Number },
    rounds: { type: Number, default: 10 },
    metadata: mongoose.Schema.Types.Mixed, // flexible bag for extra experiment details
    createdAt: { type: Date, default: Date.now }
});

// Compound index on (dataset, strategy) for fast filtered queries.
// Ref: https://www.mongodb.com/docs/manual/core/indexes/index-types/index-compound/
ExperimentResultSchema.index({ dataset: 1, strategy: 1 });

module.exports = mongoose.model("ExperimentResult", ExperimentResultSchema);
