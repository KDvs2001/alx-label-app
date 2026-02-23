const express = require('express');
const router = express.Router();
const AnnotationSession = require('../../database/models/AnnotationSession');

// Save or update session
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

        // Build update: set fields + push annotation if provided
        const update = { $set: updateOps };
        if (newAnnotation) {
            update.$push = { annotations: newAnnotation };
        }

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

// Load session by contestant ID
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

// Reset session
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
