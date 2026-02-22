const express = require("express");
const router = express.Router();
const EvaluatorFeedback = require("../../database/models/EvaluatorFeedback");

// @route   POST /api/feedback
// @desc    Submit evaluator feedback form
router.post("/", async (req, res) => {
    try {
        const feedback = new EvaluatorFeedback(req.body);
        await feedback.save();
        res.status(201).json({ message: "Feedback submitted successfully.", feedback });
    } catch (error) {
        console.error("Error saving feedback:", error);
        res.status(400).json({ error: error.message || "Failed to process feedback submission." });
    }
});

module.exports = router;
