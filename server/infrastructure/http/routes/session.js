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
                uploadedTexts: session.uploadedTexts
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

module.exports = router;
