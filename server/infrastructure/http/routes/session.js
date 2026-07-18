// CRUD routes for annotation sessions — save, load, and reset per evaluator.
// Each evaluator gets one session doc keyed by their contestantId.
/**
 * INTERFACE LAYER: Session Router
 * ARCHITECTURAL ROLE: Controller (REST API Surface)
 *
 * Handles communication between the React frontend and MongoDB.
 * Manages session lifecycle: create/resume, periodic state saves, and full reset.
 */
const express = require('express');
const router = express.Router();
const AnnotationSession = require('../../database/models/AnnotationSession');
const AnnotatorProfile  = require('../../database/models/AnnotatorProfile');


// POST /api/session/save — upsert the evaluator's running session.
// fires after each annotation so progress is never lost if the browser dies.
// CITATION: findOneAndUpdate() — atomic find-and-modify with upsert support
// SOURCE: Mongoosejs.com (n.d.). "Model.findOneAndUpdate()"
// URL: https://mongoosejs.com/docs/api/model.html#Model.findOneAndUpdate()
router.post('/save', async (req, res) => {
    try {
        const { contestantId, annotationCount, labeledTaskIds, newAnnotation } = req.body;

        if (!contestantId) {
            return res.status(400).json({ error: 'Contestant ID is required' });
        }

        // scalar fields we overwrite on every save
        const updateOps = {
            annotationCount: annotationCount || 0,
            labeledTaskIds: labeledTaskIds || [],
            cumulativeTimeSaved: req.body.cumulativeTimeSaved || 0,
            cumulativeEntropyCost: req.body.cumulativeEntropyCost || 0,
            cumulativeRandomCost: req.body.cumulativeRandomCost || 0,
            cumulativeCalLogCost: req.body.cumulativeCalLogCost || 0,
            lastUpdated: Date.now()
        };

        if (req.body.datasetName) updateOps.datasetName = req.body.datasetName;
        if (req.body.labels) updateOps.labels = req.body.labels;
        if (req.body.uploadedTexts) updateOps.uploadedTexts = req.body.uploadedTexts;
        if (req.body.roundSize) updateOps.roundSize = req.body.roundSize;
        if (req.body.autoLabelThreshold) updateOps.autoLabelThreshold = req.body.autoLabelThreshold;
        if (req.body.ece !== undefined) updateOps.ece = req.body.ece;
        if (req.body.accuracy !== undefined) updateOps.accuracy = req.body.accuracy;
        if (req.body.cognitivePacingActive !== undefined) updateOps.cognitivePacingActive = req.body.cognitivePacingActive;
        if (req.body.beta !== undefined) updateOps.beta = req.body.beta;
        if (req.body.baselineBeta !== undefined) updateOps.baselineBeta = req.body.baselineBeta;

        // $set replaces scalar fields, $push appends to the annotations array.
        // doing both in one call makes it atomic — no read-modify-write race conditions
        // CITATION: $push — append an element to an array field in a single atomic update
        // SOURCE: MongoDB Inc. (n.d.). "$push"
        // URL: https://www.mongodb.com/docs/manual/reference/operator/update/push/
        const update = { $set: updateOps };
        if (newAnnotation) {
            update.$push = { annotations: newAnnotation };
        }

        // upsert: true  → creates a new doc if this contestantId hasn't saved before
        // new: true     → gives us back the updated doc, not the stale one
        const session = await AnnotationSession.findOneAndUpdate(
            { contestantId },
            update,
            { upsert: true, new: true }
        );

        // only send the fields the frontend actually needs
        res.json({
            success: true,
            session: {
                contestantId: session.contestantId,
                annotationCount: session.annotationCount,
                labeledTaskIds: session.labeledTaskIds,
                cumulativeTimeSaved: session.cumulativeTimeSaved,
                cumulativeEntropyCost: session.cumulativeEntropyCost,
                cumulativeRandomCost: session.cumulativeRandomCost || 0,
                cumulativeCalLogCost: session.cumulativeCalLogCost || 0,
                lastUpdated: session.lastUpdated
            }
        });
    } catch (error) {
        console.error('Error saving session:', error);
        res.status(500).json({ error: 'Failed to save session' });
    }
});

// GET /api/session/load/:contestantId — pull up a saved session.
// sends { exists: false } when there's nothing, so the frontend
// knows whether to resume or start fresh.
router.get('/load/:contestantId', async (req, res) => {
    try {
        const { contestantId } = req.params;

        // CITATION: findOne() — return the first document that matches a query
        // SOURCE: Mongoosejs.com (n.d.). "Model.findOne()"
        // URL: https://mongoosejs.com/docs/api/model.html#Model.findOne()
        const session = await AnnotationSession.findOne({ contestantId });

        if (!session) {
            return res.json({
                exists: false,
                session: null
            });
        }

        res.json({
            exists: true,
            session: {
                contestantId: session.contestantId,
                annotationCount: session.annotationCount,
                labeledTaskIds: session.labeledTaskIds,
                cumulativeTimeSaved: session.cumulativeTimeSaved,
                cumulativeEntropyCost: session.cumulativeEntropyCost,
                cumulativeRandomCost: session.cumulativeRandomCost || 0,
                cumulativeCalLogCost: session.cumulativeCalLogCost || 0,
                annotations: session.annotations || [],
                lastUpdated: session.lastUpdated,
                datasetName: session.datasetName,
                labels: session.labels,
                uploadedTexts: session.uploadedTexts,
                roundSize: session.roundSize,
                autoLabelThreshold: session.autoLabelThreshold || 0.95,
                ece: session.ece || 0,
                accuracy: session.accuracy || 0,
                cognitivePacingActive: session.cognitivePacingActive || false,
                beta: session.beta || 3.0,
                baselineBeta: session.baselineBeta || 3.0
            }
        });
    } catch (error) {
        console.error('Error loading session:', error);
        res.status(500).json({ error: 'Failed to load session' });
    }
});

// POST /api/session/reset/:contestantId — zero everything out for a fresh start.
// we $set fields to empty instead of deleting the doc so the evaluator's
// row stays in the collection — handy for tracking who actually participated.
// CITATION: $set — replace the value of a field in a document
// SOURCE: MongoDB Inc. (n.d.). "$set"
// URL: https://www.mongodb.com/docs/manual/reference/operator/update/set/
router.post('/reset/:contestantId', async (req, res) => {
    try {
        const { contestantId } = req.params;

        await AnnotationSession.findOneAndUpdate(
            { contestantId },
            {
                $set: {
                    annotationCount: 0,
                    labeledTaskIds: [],
                    cumulativeTimeSaved: 0,
                    cumulativeEntropyCost: 0,
                    cumulativeRandomCost: 0,
                    cumulativeCalLogCost: 0,
                    annotations: [],
                    lastUpdated: Date.now()
                }
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: 'Session reset successfully' });
    } catch (error) {
        console.error('Error resetting session:', error);
        res.status(500).json({ error: 'Failed to reset session' });
    }
});

// GET /api/session/profile/:username — fetch annotator profile.
router.get('/profile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const profile = await AnnotatorProfile.findOne({ username });

        if (!profile) {
            return res.json({ exists: false });
        }

        res.json({ exists: true, profile });
    } catch (error) {
        console.error('Error loading annotator profile:', error);
        res.status(500).json({ error: 'Failed to load annotator profile' });
    }
});

// POST /api/session/pilot — save pilot results and mark it completed.
// Each new pilot run appends to a rolling window of the last 10 speed readings.
// The baselineSpeed is recalculated as the moving average of this window.
// The speedStdDev is the standard deviation, which powers the ± cost confidence band in the UI.
router.post('/pilot', async (req, res) => {
    try {
        const { username, baselineSpeed, readingStyle } = req.body;

        if (!username || !readingStyle) {
            return res.status(400).json({ error: 'Username and readingStyle are required' });
        }

        // Load existing profile to get the current rolling window
        const existing = await AnnotatorProfile.findOne({ username });
        const WINDOW_SIZE = 10;

        // Append the new speed reading to the rolling window, capped at WINDOW_SIZE
        // CITATION: slice(-N) — extract the last N elements of an array
        // SOURCE: MDN Web Docs (n.d.). "Array.prototype.slice()"
        // URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
        const prevReadings = existing?.recentSpeedReadings || [];
        const updatedReadings = [...prevReadings, baselineSpeed].slice(-WINDOW_SIZE);

        // Recompute the moving average across the rolling window
        const movingAvg = updatedReadings.reduce((a, b) => a + b, 0) / updatedReadings.length;

        // Compute standard deviation across the rolling window for the cost confidence band
        // CITATION: population std dev — square root of mean squared deviation from the mean
        // SOURCE: Stack Overflow (2011). "Calculating standard deviation in JavaScript"
        // URL: https://stackoverflow.com/questions/7343890/standard-deviation-javascript
        let stdDev = 0;
        if (updatedReadings.length > 1) {
            const variance = updatedReadings
                .map(r => Math.pow(r - movingAvg, 2))
                .reduce((a, b) => a + b, 0) / updatedReadings.length;
            stdDev = Math.sqrt(variance);
        }

        const profile = await AnnotatorProfile.findOneAndUpdate(
            { username },
            {
                $set: {
                    baselineSpeed: parseFloat(movingAvg.toFixed(4)),
                    readingStyle,
                    pilotCompleted: true,
                    recentSpeedReadings: updatedReadings,
                    speedStdDev: parseFloat(stdDev.toFixed(4))
                }
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, profile });
    } catch (error) {
        console.error('Error saving pilot results:', error);
        res.status(500).json({ error: 'Failed to save pilot results' });
    }
});

// POST /api/session/undo/:contestantId — remove the last annotation from the session.
// This addresses the Nielsen Severity 2 issue: misclick on a label has no recovery path.
// We remove the last element from the annotations array and decrement the count.
// CITATION: $pop — remove the last element from an array field
// SOURCE: MongoDB Inc. (n.d.). "$pop"
// URL: https://www.mongodb.com/docs/manual/reference/operator/update/pop/
router.post('/undo/:contestantId', async (req, res) => {
    try {
        const { contestantId } = req.params;

        const session = await AnnotationSession.findOne({ contestantId });
        if (!session || !session.annotations || session.annotations.length === 0) {
            return res.status(404).json({ error: 'No annotation to undo' });
        }

        // Grab the last annotation before removing it, so the frontend can restore the task
        const lastAnnotation = session.annotations[session.annotations.length - 1];

        // Atomically remove the last annotation and fix the counts
        await AnnotationSession.findOneAndUpdate(
            { contestantId },
            {
                $pop: { annotations: 1 },
                $inc: { annotationCount: -1 },
                $pull: { labeledTaskIds: lastAnnotation.taskId },
                $set: { lastUpdated: Date.now() }
            },
            { new: true }
        );

        res.json({ success: true, removedAnnotation: lastAnnotation });
    } catch (error) {
        console.error('Error undoing annotation:', error);
        res.status(500).json({ error: 'Failed to undo annotation' });
    }
});

module.exports = router;
