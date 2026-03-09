// Schema for the post-session feedback survey each evaluator fills in.
// Fields map directly to the SUS-inspired questionnaire on the frontend.
/**
 * DOMAIN MODEL: EvaluatorFeedback
 * ARCHITECTURAL ROLE: Data Entity (Qualitative Research Input)
 *
 * Captures post-session metrics and human-centric feedback.
 * Pairs quantitative performance data (Alpha/Beta cost parameters) with
 * qualitative Likert-scale responses and open-ended survey answers.
 */
const mongoose = require("mongoose");

// all validation (enum, min, max, required) is handled by Mongoose's
// built-in validators so the route handler doesn't need extra checks.
// CITATION: built-in validators — enum, min, max, required on schema fields
// SOURCE: Mongoosejs.com (n.d.). "Validation"
// URL: https://mongoosejs.com/docs/validation.html#built-in-validators
const EvaluatorFeedbackSchema = new mongoose.Schema({
    sessionId: { type: String, required: true },

    // --- demographics (self-reported by participant) ---
    // enum restricts each field to a fixed set of allowed values.
    // anything outside the list throws a ValidationError on .save()
    // CITATION: enum — restrict a string field to a predefined set of values
    // SOURCE: Stack Overflow (2013). "Mongoose enum validation on string"
    // URL: https://stackoverflow.com/questions/29299477/mongoose-enum-validation-on-string-type
    role: { type: String, enum: ['Undergraduate student', 'Postgraduate / PhD student', 'Academic researcher', 'Industry professional', 'Other'], required: true },
    nlpFamiliarity: { type: String, enum: ['None', 'Basic', 'Intermediate', 'Expert'], required: true },
    selfReportedReadingStyle: { type: String, enum: ['I skim quickly and pick up key points', 'I read at a moderate pace', 'I read carefully and thoroughly'], required: true },

    // --- quantitative metrics (auto-captured by the frontend, not user-entered) ---
    contestantId: { type: String },
    annotationsCompleted: { type: Number, required: true },
    startingAlpha: { type: Number, default: 5.0 },
    endingAlpha: { type: Number, default: 0 },
    startingBeta: { type: Number, required: true },
    endingBeta: { type: Number, required: true },
    avgTimeSavedVsEntropy: { type: Number, required: true },
    avgTimeSavedVsRandom: { type: Number, default: 0 },
    vsEntropyPct: { type: String, default: '0' },
    vsRandomPct: { type: String, default: '0' },
    tasksReceived: [{ type: Number }],
    avgTaskLength: { type: Number, default: 0 },
    sessionDurationSeconds: { type: Number, default: 0 },
    systemReadingProfile: { type: String, required: true },
    systemClassificationMatch: { type: String, enum: ['Yes, it matched exactly', 'Partially matched', 'No, it was the opposite', "I didn't notice / couldn't tell"], required: true },

    // --- strategy efficiency scores (information gained per second) ---
    calLogEfficiency: { type: Number, default: 0 },
    entropyEfficiency: { type: Number, default: 0 },
    randomEfficiency: { type: Number, default: 0 },

    // --- qualitative ratings (Likert 1-5, min/max enforced by Mongoose) ---
    // CITATION: min/max validators — constrain numeric fields to a valid range
    // SOURCE: Mongoosejs.com (n.d.). "SchemaType Options"
    // URL: https://mongoosejs.com/docs/schematypes.html#schematype-options
    ratingDocumentSelection: { type: Number, min: 1, max: 5 },
    ratingMathUnderstandable: { type: Number, min: 1, max: 5 },
    ratingSystemAdaptationVisible: { type: Number, min: 1, max: 5 },
    ratingTrustSystem: { type: Number, min: 1, max: 5 },
    ratingInterfaceClear: { type: Number, min: 1, max: 5 },

    // --- open-ended text responses ---
    noticeChangeAtAnnotation: { type: Number },
    mostSurprising: { type: String },
    mostConfusing: { type: String },
    strengthenSubmission: { type: String },

// timestamps: true auto-adds createdAt and updatedAt to every saved doc
// CITATION: timestamps option — auto-manage creation and update dates
// SOURCE: Stack Overflow (2016). "Mongoose timestamps option"
// URL: https://stackoverflow.com/questions/12669615/add-created-at-and-updated-at-fields-to-mongoose-schemas
}, { timestamps: true });

module.exports = mongoose.model("EvaluatorFeedback", EvaluatorFeedbackSchema);
