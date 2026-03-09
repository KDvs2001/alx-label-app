// Schema for offline experiment benchmark results (pre-seeded data).
// These records feed the comparison charts showing CAL-Log vs baselines.
const mongoose = require("mongoose");

const ExperimentResultSchema = new mongoose.Schema({
    dataset: { type: String, required: true },   // e.g. "ag_news", "imdb", "tweet_eval"
    strategy: { type: String, required: true },   // e.g. "CAL-Log", "Random", "BADGE", "Entropy"
    totalCost: { type: Number, required: true },   // total annotation time in seconds
    f1Score: { type: Number, required: true },     // model F1 score after training
    accuracy: { type: Number },                    // model accuracy (optional)
    pValue: { type: Number },                      // statistical significance (Mann-Whitney U test)
    cohensD: { type: Number },                     // effect size for practical significance
    tasksAnnotated: { type: Number },
    rounds: { type: Number, default: 10 },
    // Mixed type — flexible bag for any extra experiment details we want to tack on
    // CITATION: Schema.Types.Mixed — store arbitrary key-value data without a fixed shape
    // SOURCE: Mongoosejs.com (n.d.). "SchemaTypes"
    // URL: https://mongoosejs.com/docs/schematypes.html#mixed
    metadata: mongoose.Schema.Types.Mixed,
    // default: Date.now (without parentheses) passes the function reference,
    // so each new doc gets a fresh timestamp instead of reusing the one from server boot
    // CITATION: default: Date.now — set a default timestamp on document creation
    // SOURCE: Stack Overflow (2012). "Mongoose default date"
    // URL: https://stackoverflow.com/questions/12669615/add-created-at-and-updated-at-fields-to-mongoose-schemas
    createdAt: { type: Date, default: Date.now }
});

// compound index on (dataset, strategy) so the GET route's
// .sort({ dataset: 1, strategy: 1 }) can use it directly
// CITATION: compound index — index on multiple fields for faster filtered + sorted queries
// SOURCE: MongoDB Inc. (n.d.). "Compound Indexes"
// URL: https://www.mongodb.com/docs/manual/core/indexes/index-types/index-compound/
ExperimentResultSchema.index({ dataset: 1, strategy: 1 });

module.exports = mongoose.model("ExperimentResult", ExperimentResultSchema);
