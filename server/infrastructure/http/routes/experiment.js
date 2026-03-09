// Route handler for experiment benchmark results.
const express = require('express');
const router = express.Router();
const ExperimentResult = require('../../database/models/ExperimentResult');

// GET /api/experiments — return all results sorted by dataset then strategy.
// sort({ dataset: 1, strategy: 1 }) uses the compound index we created in the model.
router.get('/', async (req, res) => {
    try {
        const results = await ExperimentResult.find().sort({ dataset: 1, strategy: 1 });
        res.json(results);
    } catch (err) {
        console.error('Error fetching experiments:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/experiments/seed — wipe & re-insert baseline benchmark data.
// This is a dev convenience route, not exposed to end-users.
// deleteMany + insertMany is the simplest way to do an idempotent reseed.
// Ref: https://mongoosejs.com/docs/api/model.html#Model.insertMany()
router.post('/seed', async (req, res) => {
    try {
        await ExperimentResult.deleteMany({});

        const seedData = [
            // IMDB Dataset
            {
                dataset: 'imdb',
                strategy: 'Random',
                totalCost: 18000,
                f1Score: 0.82,
                accuracy: 0.82,
                tasksAnnotated: 800,
                pValue: 1.0,
                cohensD: 0.0
            },
            {
                dataset: 'imdb',
                strategy: 'CAL-Log',
                totalCost: 9500,
                f1Score: 0.84,
                accuracy: 0.84,
                tasksAnnotated: 450,
                pValue: 0.001,
                cohensD: 0.92
            },
            {
                dataset: 'imdb',
                strategy: 'BADGE',
                totalCost: 14000,
                f1Score: 0.83,
                accuracy: 0.83,
                tasksAnnotated: 600,
                pValue: 0.10,
                cohensD: 0.4
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
