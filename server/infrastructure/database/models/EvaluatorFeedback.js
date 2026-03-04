const mongoose = require("mongoose");

const EvaluatorFeedbackSchema = new mongoose.Schema({
    sessionId: { type: String, required: true },

    // Demographics
    role: { type: String, enum: ['Undergraduate student', 'Postgraduate / PhD student', 'Academic researcher', 'Industry professional', 'Other'], required: true },
    nlpFamiliarity: { type: String, enum: ['None', 'Basic', 'Intermediate', 'Expert'], required: true },
    selfReportedReadingStyle: { type: String, enum: ['I skim quickly and pick up key points', 'I read at a moderate pace', 'I read carefully and thoroughly'], required: true },

    // Quantitative (Auto-captured)
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

    // Strategy Efficiencies (Auto-captured)
    calLogEfficiency: { type: Number, default: 0 },
    entropyEfficiency: { type: Number, default: 0 },
    randomEfficiency: { type: Number, default: 0 },

    // Qualitative (Likert 1-5 where applicable)
    ratingDocumentSelection: { type: Number, min: 1, max: 5 },
    ratingMathUnderstandable: { type: Number, min: 1, max: 5 },
    ratingSystemAdaptationVisible: { type: Number, min: 1, max: 5 },
    ratingTrustSystem: { type: Number, min: 1, max: 5 },
    ratingInterfaceClear: { type: Number, min: 1, max: 5 },

    // Open-Ended
    noticeChangeAtAnnotation: { type: Number },
    mostSurprising: { type: String },
    mostConfusing: { type: String },
    strengthenSubmission: { type: String },

}, { timestamps: true });

module.exports = mongoose.model("EvaluatorFeedback", EvaluatorFeedbackSchema);
