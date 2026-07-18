// Route for evaluator feedback form submissions — single POST endpoint.
/**
 * INTERFACE LAYER: Feedback Router
 * ARCHITECTURAL ROLE: Controller (REST API Surface)
 *
 * Ingests evaluator survey data after they finish the annotation task.
 * Persists calculated metrics (ROI, Efficiency) alongside subjective user feedback.
 */
const express = require("express");
const router = express.Router();
const EvaluatorFeedback = require("../../database/models/EvaluatorFeedback");

// POST /api/feedback — save a completed feedback form.
// req.body goes straight into the model constructor and Mongoose's schema
// validators (enum, min/max, required) catch bad input for us automatically.
// CITATION: Mongoose validation — built-in schema-level validators
// SOURCE: Mongoosejs.com (n.d.). "Validation"
// URL: https://mongoosejs.com/docs/validation.html
        const {
            sessionId, role, nlpFamiliarity, selfReportedReadingStyle,
            contestantId, annotationsCompleted, startingAlpha, endingAlpha,
            startingBeta, endingBeta, avgTimeSavedVsEntropy, avgTimeSavedVsRandom,
            vsEntropyPct, vsRandomPct, tasksReceived, avgTaskLength,
            sessionDurationSeconds, systemReadingProfile, systemClassificationMatch,
            calLogEfficiency, entropyEfficiency, randomEfficiency,
            ratingDocumentSelection, ratingMathUnderstandable, ratingSystemAdaptationVisible,
            ratingTrustSystem, ratingInterfaceClear, noticeChangeAtAnnotation,
            mostSurprising, mostConfusing, strengthenSubmission
        } = req.body;

        const feedback = new EvaluatorFeedback({
            sessionId, role, nlpFamiliarity, selfReportedReadingStyle,
            contestantId, annotationsCompleted, startingAlpha, endingAlpha,
            startingBeta, endingBeta, avgTimeSavedVsEntropy, avgTimeSavedVsRandom,
            vsEntropyPct, vsRandomPct, tasksReceived, avgTaskLength,
            sessionDurationSeconds, systemReadingProfile, systemClassificationMatch,
            calLogEfficiency, entropyEfficiency, randomEfficiency,
            ratingDocumentSelection, ratingMathUnderstandable, ratingSystemAdaptationVisible,
            ratingTrustSystem, ratingInterfaceClear, noticeChangeAtAnnotation,
            mostSurprising, mostConfusing, strengthenSubmission
        });
        await feedback.save();

        // 201 = "Created", the right status code when a new resource is born
        // CITATION: 201 Created — response status for successful resource creation
        // SOURCE: Mozilla (n.d.). "201 Created"
        // URL: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201
        res.status(201).json({ message: "Feedback submitted successfully.", feedback });
    } catch (error) {
        console.error("Error saving feedback:", error);
        // 400 because bad input is the client's problem, not ours
        res.status(400).json({ error: error.message || "Failed to process feedback submission." });
    }
});

module.exports = router;
