// CRUD routes for annotation projects — create, list, update, and delete projects.
// Also exposes annotator-scoped views and aggregate statistics for the manager dashboard.
/**
 * INTERFACE LAYER: Projects Router
 * ARCHITECTURAL ROLE: Controller (REST API Surface)
 *
 * Handles communication between the React frontend and MongoDB for Project docs.
 * Progress is computed on-the-fly by cross-referencing AnnotationSession.labeledTaskIds
 * so the session collection remains the single source of truth for annotation state.
 */
const express = require('express');
const router = express.Router();
const Project           = require('../../database/models/Project');
const AnnotationSession = require('../../database/models/AnnotationSession');
const AnnotatorProfile  = require('../../database/models/AnnotatorProfile');

// POST /api/projects — create a new annotation project.
// texts arrive as plain strings; we assign stable ids here so the session layer
// can reference them by id without coupling to array position.
// CITATION: findOne() / save() — persist a new Mongoose document
// SOURCE: Mongoosejs.com (n.d.). "Models"
// URL: https://mongoosejs.com/docs/models.html#constructing-documents
router.post('/', async (req, res) => {
    try {
        const { name, description, labelTypes, texts, createdBy } = req.body;

        // POST to ML service to evaluate complexity
        let complexityScore = 0.5;
        let targetProfile = 'Moderate Reader';
        try {
            // CITATION: native fetch — make HTTP requests without external libraries
            // SOURCE: MDN Web Docs (n.d.). "Fetch API"
            // URL: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
            const mlResponse = await fetch('http://127.0.0.1:5000/evaluate_complexity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texts: texts || [] })
            });
            if (mlResponse.ok) {
                const mlData = await mlResponse.json();
                if (mlData.complexityScore !== undefined) {
                    complexityScore = mlData.complexityScore;
                }
                if (mlData.targetProfile !== undefined) {
                    targetProfile = mlData.targetProfile;
                }
            }
        } catch (mlError) {
            console.error('Error fetching complexity from ML server, using fallback:', mlError);
        }

        // map raw strings to { id, text } sub-documents.
        // Date.now() + index makes ids unique even when texts are created in bulk.
        const textDocs = (texts || []).map((text, i) => ({
            id:   `text_${Date.now()}_${i}`,
            text
        }));

        const project = new Project({
            name,
            description,
            labelTypes:          labelTypes          || [],
            texts:               textDocs,
            complexityScore,
            targetProfile,
            createdBy
        });

        await project.save();

        res.json({ success: true, project });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// GET /api/projects — list all projects with aggregated progress (manager view).
// progress is derived from AnnotationSession docs, keyed by the naming convention
// '<username>_<projectId>', so a regex suffix-match finds every session for a project.
// CITATION: RegExp in a Mongoose query — use a JS RegExp as a MongoDB $regex filter
// SOURCE: Mongoosejs.com (n.d.). "Queries"
// URL: https://mongoosejs.com/docs/queries.html
router.get('/', async (req, res) => {
    try {
        // CITATION: sort() — order results by a field, -1 for descending
        // SOURCE: Mongoosejs.com (n.d.). "Query.prototype.sort()"
        // URL: https://mongoosejs.com/docs/api/query.html#Query.prototype.sort()
        const projects = await Project.find().sort({ createdAt: -1 });

        // for each project, gather all its annotator sessions in one query
        const result = await Promise.all(projects.map(async (project) => {
            const sessions = await AnnotationSession.find({
                // suffix-match '<anything>_<projectId>' to catch all annotators
                contestantId: new RegExp('_' + project.projectId + '$')
            });

            // sum up every labeled task across all annotators for this project
            const totalLabeled = sessions.reduce(
                (sum, s) => sum + (s.labeledTaskIds?.length ?? 0),
                0
            );

            return {
                ...project.toObject(),
                totalLabeled,
                annotatorSessions: sessions
            };
        }));

        res.json(result);
    } catch (error) {
        console.error('Error listing projects:', error);
        res.status(500).json({ error: 'Failed to list projects' });
    }
});

// GET /api/projects/annotator/:username — projects assigned to one annotator.
// returns board-level progress so the annotator dashboard can show status chips
// without a separate round-trip per project.
router.get('/annotator/:username', async (req, res) => {
    try {
        const { username } = req.params;

        const profile = await AnnotatorProfile.findOne({ username });
        if (!profile || !profile.pilotCompleted) {
            return res.json([]);
        }

        // exclude soft-deleted projects; 'deleted' isn't in the enum but guard anyway
        const projects = await Project.find({
            $or: [
                { targetProfile: profile.readingStyle },
                { targetProfile: 'All' }
            ],
            status: { $ne: 'deleted' }
        });

        const result = await Promise.all(projects.map(async (project) => {
            // one session per (annotator, project) pair, keyed by convention
            const session = await AnnotationSession.findOne({
                contestantId: `${username}_${project.projectId}`
            });

            const labeled = session?.labeledTaskIds?.length ?? 0;
            const total   = project.texts.length;

            // derive a human-readable board status from raw progress numbers
            let boardStatus;
            if (labeled === 0) {
                boardStatus = 'pending';
            } else if (labeled > 0 && labeled < total) {
                boardStatus = 'in_progress';
            } else if (labeled >= total && total > 0) {
                boardStatus = 'done';
            } else {
                boardStatus = 'pending';
            }

            return {
                ...project.toObject(),
                progress: { labeled, total },
                boardStatus
            };
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching annotator projects:', error);
        res.status(500).json({ error: 'Failed to fetch annotator projects' });
    }
});

// GET /api/projects/stats/all — aggregate statistics for every project (manager dashboard).
// returns a lightweight summary array so the dashboard avoids loading full text corpora.
// CITATION: Promise.all() — run multiple async DB calls concurrently for throughput
// SOURCE: MDN Web Docs (n.d.). "Promise.all()"
// URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
router.get('/stats/all', async (req, res) => {
    try {
        const projects = await Project.find();

        const stats = await Promise.all(projects.map(async (project) => {
            const sessions = await AnnotationSession.find({
                contestantId: new RegExp('_' + project.projectId + '$')
            });

            const labeled = sessions.reduce(
                (sum, s) => sum + (s.labeledTaskIds?.length ?? 0),
                0
            );

            return {
                projectId:      project.projectId,
                name:           project.name,
                total:          project.texts.length,
                labeled,
                annotatorCount: sessions.length,
                status:         project.status,
                labelTypes:     project.labelTypes
            };
        }));

        res.json(stats);
    } catch (error) {
        console.error('Error fetching project stats:', error);
        res.status(500).json({ error: 'Failed to fetch project stats' });
    }
});

// GET /api/projects/:id — fetch a single project by its projectId.
// CITATION: findOne() — return the first document that matches a query
// SOURCE: Mongoosejs.com (n.d.). "Model.findOne()"
// URL: https://mongoosejs.com/docs/api/model.html#Model.findOne()
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findOne({ projectId: req.params.id });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// PUT /api/projects/:id — update mutable project fields.
// new: true gives us back the post-update doc so the frontend stays in sync.
// CITATION: findOneAndUpdate() — atomic find-and-modify with upsert support
// SOURCE: Mongoosejs.com (n.d.). "Model.findOneAndUpdate()"
// URL: https://mongoosejs.com/docs/api/model.html#Model.findOneAndUpdate()
router.put('/:id', async (req, res) => {
    try {
        const { name, description, labelTypes, targetProfile, status } = req.body;

        const updated = await Project.findOneAndUpdate(
            { projectId: req.params.id },
            {
                $set: {
                    ...(name               !== undefined && { name }),
                    ...(description        !== undefined && { description }),
                    ...(labelTypes         !== undefined && { labelTypes }),
                    ...(targetProfile !== undefined && { targetProfile }),
                    ...(status             !== undefined && { status }),
                    lastUpdated: Date.now()
                }
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ success: true, project: updated });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// DELETE /api/projects/:id — permanently remove a project document.
// CITATION: findOneAndDelete() — atomically find and remove a document
// SOURCE: Mongoosejs.com (n.d.). "Model.findOneAndDelete()"
// URL: https://mongoosejs.com/docs/api/model.html#Model.findOneAndDelete()
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Project.findOneAndDelete({ projectId: req.params.id });

        if (!deleted) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

module.exports = router;
