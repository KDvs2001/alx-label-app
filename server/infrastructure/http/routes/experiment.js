// Routes for experiment benchmark results — GET all and POST seed.
const express = require('express');
const router = express.Router();
const ExperimentResult = require('../../database/models/ExperimentResult');

// GET /api/experiments — fetch every result, sorted by dataset then strategy.
// the sort order matches the compound index in the model so Mongo skips in-memory sorting
// CITATION: .sort() — order query results by one or more fields
// SOURCE: Mongoosejs.com (n.d.). "Query.prototype.sort()"
// URL: https://mongoosejs.com/docs/api/query.html#Query.prototype.sort()
router.get('/', async (req, res) => {
    try {
        const results = await ExperimentResult.find().sort({ dataset: 1, strategy: 1 });
        res.json(results);
    } catch (err) {
        console.error('Error fetching experiments:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/experiments/seed — wipe and re-insert baseline benchmark data.
// dev-only convenience route. deleteMany + insertMany keeps it idempotent —
// you can hit this endpoint 10 times and still end up with the same 3 rows.
// CITATION: Model.insertMany() — bulk insert documents in a single operation
// SOURCE: Mongoosejs.com (n.d.). "Model.insertMany()"
// URL: https://mongoosejs.com/docs/api/model.html#Model.insertMany()
router.post('/seed', async (req, res) => {
    try {
        // nuke everything first so repeated seeds don't stack duplicates
        // CITATION: Model.deleteMany() — remove all documents matching a filter
        // SOURCE: Mongoosejs.com (n.d.). "Model.deleteMany()"
        // URL: https://mongoosejs.com/docs/api/model.html#Model.deleteMany()
        await ExperimentResult.deleteMany({});

        // baseline benchmark numbers from the IMDB experiment runs
        // pValue = statistical significance vs Random, cohensD = effect size
        const seedData = [
            {
                dataset: 'imdb',
                strategy: 'Random',
                totalCost: 18000,
                f1Score: 0.82,
                accuracy: 0.82,
                tasksAnnotated: 800,
                pValue: 1.0,       // baseline compared against itself
                cohensD: 0.0
            },
            {
                dataset: 'imdb',
                strategy: 'CAL-Log',
                totalCost: 9500,
                f1Score: 0.84,
                accuracy: 0.84,
                tasksAnnotated: 450,
                pValue: 0.001,     // significant at α = 0.05
                cohensD: 0.92      // large effect (> 0.8)
            },
            {
                dataset: 'imdb',
                strategy: 'BADGE',
                totalCost: 14000,
                f1Score: 0.83,
                accuracy: 0.83,
                tasksAnnotated: 600,
                pValue: 0.10,      // not significant at α = 0.05
                cohensD: 0.4       // small-to-medium effect
            }
        ];

        await ExperimentResult.insertMany(seedData);
        console.log('Sample experiment data seeded successfully');
        res.json({ message: 'Seeding successful', count: seedData.length });

    } catch (err) {
        console.error('Error seeding experiments:', err);
        res.status(500).json({ error: 'Seeding failed' });
    }
});

module.exports = router;
