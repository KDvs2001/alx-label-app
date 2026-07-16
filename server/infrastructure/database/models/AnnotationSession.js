// Schema for a single evaluator's annotation session.
// One document per evaluator, keyed by contestantId.
/**
 * DOMAIN MODEL: AnnotationSession
 * ARCHITECTURAL ROLE: Aggregate Root (Data Persistence)
 *
 * Holds the full state of one human-in-the-loop experiment.
 * Individual annotations are embedded as sub-documents inside the session
 * to avoid a separate collection and extra lookups.
 */
const mongoose = require('mongoose');

// each annotation the evaluator makes gets stored as one of these.
// { _id: false } stops Mongoose from generating a pointless ObjectId
// on every sub-doc — we don't need to query them individually.
// CITATION: { _id: false } — disable auto-generated _id on subdocuments
// SOURCE: Mongoosejs.com (n.d.). "Subdocuments"
// URL: https://mongoosejs.com/docs/subdocs.html#subdocuments-versus-nested-paths
const AnnotationDetailSchema = new mongoose.Schema({
    taskId: Number,
    textSnippet: String,    // first N chars of the annotated text, kept for audit
    wordCount: Number,
    label: String,          // 'Positive' or 'Negative'
    timeSeconds: Number,    // how long the evaluator spent on this task
    alpha: Number,          // cost model alpha at time of annotation
    beta: Number,           // cost model beta at time of annotation
    timestamp: Date,
    annotationIndex: Number, // sequential counter within the session
    // Self-reported perceived difficulty rating (1 = very easy, 5 = very hard).
    // Collected via a brief star-rating prompt shown after each annotation.
    // Evaluators suggested this allows the system to distinguish genuine cognitive load
    // from length-based cost estimates, informing future alpha/beta calibration.
    perceivedDifficulty: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    }
}, { _id: false });

// main session document. contestantId is unique so findOneAndUpdate with
// upsert: true in the route handler can create-or-update in one atomic call.
const AnnotationSessionSchema = new mongoose.Schema({
    contestantId: {
        type: String,
        required: true,
        // unique: true tells Mongoose to create a unique index on this field
        // CITATION: unique — create a unique index to prevent duplicate values
        // SOURCE: Stack Overflow (2014). "Mongoose unique validation"
        // URL: https://stackoverflow.com/questions/24430220/mongoose-unique-validation
        unique: true,
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
    datasetName: {
        type: String,
        default: 'imdb'
    },
    labels: [{
        type: String
    }],
    uploadedTexts: [{
        type: String
    }],
    roundSize: {
        type: Number,
        default: 10
    },
    autoLabelThreshold: {
        type: Number,
        default: 0.95
    },
    // embed annotation history directly inside the session doc.
    // each session has ~50 annotations max, well within Mongo's 16MB doc limit,
    // so embedding beats a separate collection + JOIN here.
    // CITATION: embedded subdocuments — nest related data inside the parent doc
    // SOURCE: Stack Overflow (2013). "Mongoose subdocuments vs nested schema"
    // URL: https://stackoverflow.com/questions/17254008/mongoose-subdocuments-vs-nested-schema
    annotations: [AnnotationDetailSchema],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    // timestamps: true auto-adds createdAt and updatedAt fields
    // CITATION: timestamps option — auto-manage createdAt and updatedAt
    // SOURCE: Stack Overflow (2016). "Mongoose timestamps option"
    // URL: https://stackoverflow.com/questions/12669615/add-created-at-and-updated-at-fields-to-mongoose-schemas
    timestamps: true
});

// bump lastUpdated every time we save
// CITATION: pre('save') — middleware hook that runs before document persistence
// SOURCE: Mongoosejs.com (n.d.). "Middleware"
// URL: https://mongoosejs.com/docs/middleware.html#pre
AnnotationSessionSchema.pre('save', function (next) {
    this.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model('AnnotationSession', AnnotationSessionSchema);
