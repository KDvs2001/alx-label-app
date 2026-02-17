const mongoose = require('mongoose');

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
    labeledTaskIds: [{
        type: Number
    }],
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
