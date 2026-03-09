// Route for evaluator feedback form submissions.
/**
 * INTERFACE LAYER: Feedback Router
 * ARCHITECTURAL ROLE: Controller (REST API Surface)
 * 
 * Specifically designed to ingest evaluator survey data. 
 * Orchestrates the persistence of calculated metrics (ROI, Efficiency) 
 * alongside subjective user feedback.
 */
const express = require("express");
const router = express.Router();
const EvaluatorFeedback = require("../../database/models/EvaluatorFeedback");

// POST /api/feedback — persist a completed feedback form.
// We pass req.body straight into the model constructor; Mongoose's schema
// validators (enum, min/max, required) handle input validation for us.
router.post("/", async (req, res) => {
    try {
        const feedback = new EvaluatorFeedback(req.body);
        await feedback.save();
        res.status(201).json({ message: "Feedback submitted successfully.", feedback });
    } catch (error) {
        console.error("Error saving feedback:", error);
        // 400 because validation failures are client-side data issues, not server errors
        res.status(400).json({ error: error.message || "Failed to process feedback submission." });
    }
});

module.exports = router;
