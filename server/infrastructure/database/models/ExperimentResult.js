const mongoose = require("mongoose");

const ExperimentResultSchema = new mongoose.Schema({
    dataset: { type: String, required: true }, // e.g., "ag_news", "imdb", "tweet_eval"
    strategy: { type: String, required: true }, // e.g., "CAL-Log", "Random", "BADGE", "Entropy"
    totalCost: { type: Number, required: true }, // Total annotation time in seconds
    f1Score: { type: Number, required: true }, // Model F1 score
    accuracy: { type: Number }, // Model accuracy (optional)
    pValue: { type: Number }, // Statistical significance (Mann-Whitney U)
    cohensD: { type: Number }, // Effect size
    tasksAnnotated: { type: Number }, // Number of tasks completed
    rounds: { type: Number, default: 10 }, // Number of AL rounds
    metadata: mongoose.Schema.Types.Mixed, // Additional experiment details
    createdAt: { type: Date, default: Date.now }
});

// Index for fast querying
ExperimentResultSchema.index({ dataset: 1, strategy: 1 });

module.exports = mongoose.model("ExperimentResult", ExperimentResultSchema);
