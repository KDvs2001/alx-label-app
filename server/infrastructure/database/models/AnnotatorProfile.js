// Schema for an annotator's reading profile based on their pilot performance.
/**
 * DOMAIN MODEL: AnnotatorProfile
 * ARCHITECTURAL ROLE: Data Persistence
 *
 * Holds the profile data of an annotator, which includes their reading style
 * and baseline reading speed calculated during the pilot phase.
 */
const mongoose = require('mongoose');

const AnnotatorProfileSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        // unique: true tells Mongoose to create a unique index on this field
        // CITATION: unique — create a unique index to prevent duplicate values
        // SOURCE: Stack Overflow (2014). "Mongoose unique validation"
        // URL: https://stackoverflow.com/questions/24430220/mongoose-unique-validation
        unique: true,
        trim: true
    },
    readingStyle: {
        type: String,
        // CITATION: enum validator — restrict a String field to a fixed set of values
        // SOURCE: Mongoosejs.com (n.d.). "Validation"
        // URL: https://mongoosejs.com/docs/validation.html#built-in-validators
        enum: ['Fast Skimmer', 'Moderate Reader', 'Careful Analyst']
    },
    baselineSpeed: {
        type: Number // average time per word in seconds
    },
    pilotCompleted: {
        type: Boolean,
        default: false
    }
}, {
    // timestamps: true auto-adds createdAt and updatedAt fields
    // CITATION: timestamps option — auto-manage createdAt and updatedAt
    // SOURCE: Stack Overflow (2016). "Mongoose timestamps option"
    // URL: https://stackoverflow.com/questions/12669615/add-created-at-and-updated-at-fields-to-mongoose-schemas
    timestamps: true
});

module.exports = mongoose.model('AnnotatorProfile', AnnotatorProfileSchema);
