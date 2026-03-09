/**
 * DOMAIN MODEL: AnnotationSession
 * ARCHITECTURAL ROLE: Aggregate Root (Data Persistence)
 * 
 * This model encapsulates the state of a single human-in-the-loop experiment.
 * It follows the 'Document' pattern in NoSQL to embed individual annotation 
 * interactions directly within the parent session to optimize read/write performance
 * during active learning simulation loops.
 */
const mongoose = require('mongoose');

// Embedded sub-document for individual annotation records.
// Using { _id: false } to skip auto-generated _id on sub-docs — saves storage.
// Ref: https://mongoosejs.com/docs/subdocs.html#subdocuments-versus-nested-paths
const AnnotationDetailSchema = new mongoose.Schema({
    taskId: Number,
    textSnippet: String,    // first N chars of the annotated text (for audit)
    wordCount: Number,
    label: String,          // 'Positive' or 'Negative'
    timeSeconds: Number,    // how long the evaluator took on this task
    alpha: Number,          // cost model alpha at time of annotation
    beta: Number,           // cost model beta at time of annotation
    timestamp: Date,
    annotationIndex: Number // sequential counter within the session
}, { _id: false });

// Main session document. Uses unique contestantId so findOneAndUpdate with
// upsert: true in the route handler creates or updates in a single atomic op.
// Ref: https://mongoosejs.com/docs/api/model.html#Model.findOneAndUpdate()
const AnnotationSessionSchema = new mongoose.Schema({
    contestantId: {
        type: String,
        required: true,
        unique: true,    // creates a unique index in MongoDB automatically
        trim: true
    },
    annotationCount: {
        type: Number,
        default: 0
    },
    cumulativeTimeSaved: {
        type: Number,
        default: 0
    },
    cumulativeEntropyCost: {
        type: Number,
        default: 0
    },
    cumulativeRandomCost: {
        type: Number,
        default: 0
    },
    cumulativeCalLogCost: {
        type: Number,
        default: 0
    },
    labeledTaskIds: [{
        type: Number
    }],
    // Embed the full annotation history as an array of sub-documents.
    // This avoids a separate collection + JOIN — acceptable here because each
    // session has at most ~50 annotations (well within MongoDB's 16MB doc limit).
    annotations: [AnnotationDetailSchema],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true     // auto-adds createdAt and updatedAt fields
});

// Mongoose middleware: update lastUpdated timestamp on every save.
// Ref: https://mongoosejs.com/docs/middleware.html#pre
AnnotationSessionSchema.pre('save', function (next) {
    this.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model('AnnotationSession', AnnotationSessionSchema);

