const express = require("express");
const router = express.Router();
const Task = require("../../database/models/Task"); // Temporary direct access

router.get("/", async (req, res) => {
    try {
        const query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.projectId) query.projectId = req.query.projectId;

        const tasks = await Task.find(query).limit(parseInt(req.query.limit) || 100);
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:projectId", async (req, res) => {
    try {
        const tasks = await Task.find({ projectId: req.params.projectId });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        console.log(`[PATCH] Updating Task ${req.params.id}`, req.body);
        const { status, label } = req.body;
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { status, label },
            { new: true }
        );
        if (!task) {
            console.log("[PATCH] Task not found");
            return res.status(404).json({ error: "Task not found" });
        }
        res.json(task);
    } catch (err) {
        console.error("[PATCH] Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
