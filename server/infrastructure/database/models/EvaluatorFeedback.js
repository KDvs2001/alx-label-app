const mongoose = require("mongoose");

const EvaluatorFeedbackSchema = new mongoose.Schema({
    sessionId: { type: String, required: true },

    // Demographics
    role: { type: String, enum: ['Undergraduate student', 'Postgraduate / PhD student', 'Academic researcher', 'Industry professional', 'Other'], required: true },
    nlpFamiliarity: { type: String, enum: ['None', 'Basic', 'Intermediate', 'Expert'], required: true },
    selfReportedReadingStyle: { type: String, enum: ['I skim quickly and pick up key points', 'I read at a moderate pace', 'I read carefully and thoroughly'], required: true },

    // Quantitative (Auto-captured)
    annotationsCompleted: { type: Number, required: true },
    startingBeta: { type: Number, required: true },
    endingBeta: { type: Number, required: true },
    avgTimeSavedVsEntropy: { type: Number, required: true },
    systemReadingProfile: { type: String, required: true }, // The classification the system gave
    systemClassificationMatch: { type: String, enum: ['Yes, it matched exactly', 'Partially matched', 'No, it was the opposite', "I didn't notice / couldn't tell"], required: true },

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
    strengthenSubmission: { type: String }, // Optional depending on NLP familiarity

}, { timestamps: true });

module.exports = mongoose.model("EvaluatorFeedback", EvaluatorFeedbackSchema);
