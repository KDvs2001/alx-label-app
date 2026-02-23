const mongoose = require('mongoose');

const AnnotationDetailSchema = new mongoose.Schema({
    taskId: Number,
    textSnippet: String,
    wordCount: Number,
    label: String,
    timeSeconds: Number,
    alpha: Number,
    beta: Number,
    timestamp: Date,
    annotationIndex: Number
}, { _id: false });

const AnnotationSessionSchema = new mongoose.Schema({
    contestantId: {
        type: String,
        required: true,
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
    annotations: [AnnotationDetailSchema],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Update lastUpdated on save
AnnotationSessionSchema.pre('save', function (next) {
    this.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model('AnnotationSession', AnnotationSessionSchema);

