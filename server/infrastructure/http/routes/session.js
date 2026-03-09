// CRUD routes for annotation sessions (save/load/reset per evaluator).
/**
 * INTERFACE LAYER: Session Router
 * ARCHITECTURAL ROLE: Controller (REST API Surface)
 * 
 * Handles the communication between the React frontend and the MongoDB persistence layer.
 * Manages session lifecycle: initialization, periodic state saves, and session resets.
 */
const express = require('express');
const router = express.Router();
const AnnotationSession = require('../../database/models/AnnotationSession');

// POST /api/session/save — upsert the evaluator's running session.
// Each annotation triggers this so we persist progress incrementally.
router.post('/save', async (req, res) => {
    try {
        const { contestantId, annotationCount, labeledTaskIds, newAnnotation } = req.body;

        if (!contestantId) {
            return res.status(400).json({ error: 'Contestant ID is required' });
        }

        const updateOps = {
            annotationCount: annotationCount || 0,
            labeledTaskIds: labeledTaskIds || [],
            cumulativeTimeSaved: req.body.cumulativeTimeSaved || 0,
            cumulativeEntropyCost: req.body.cumulativeEntropyCost || 0,
            cumulativeRandomCost: req.body.cumulativeRandomCost || 0,
            cumulativeCalLogCost: req.body.cumulativeCalLogCost || 0,
            lastUpdated: Date.now()
        };

        // $set replaces scalar fields, $push appends to the annotations array.
        // This keeps the update atomic — no read-modify-write race conditions.
        // Ref: https://www.mongodb.com/docs/manual/reference/operator/update/push/
        const update = { $set: updateOps };
        if (newAnnotation) {
            update.$push = { annotations: newAnnotation };
        }

        // upsert: true  — create doc if contestantId doesn't exist yet
        // new: true      — return the updated document (not the old one)
        // Ref: https://mongoosejs.com/docs/api/model.html#Model.findOneAndUpdate()
        const session = await AnnotationSession.findOneAndUpdate(
            { contestantId },
            update,
            { upsert: true, new: true }
        );

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

// GET /api/session/load/:contestantId — retrieve a saved session.
// Returns { exists: false } if no session found so the frontend knows
// whether to resume or start fresh.
router.get('/load/:contestantId', async (req, res) => {
    try {
        const { contestantId } = req.params;

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
                lastUpdated: session.lastUpdated
            }
        });
    } catch (error) {
        console.error('Error loading session:', error);
        res.status(500).json({ error: 'Failed to load session' });
    }
});

// POST /api/session/reset/:contestantId — zero out all fields to start fresh.
// We use $set to overwrite everything instead of deleting the document so
// the contestantId record stays in the collection (preserves the evaluator row).
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
