const express = require('express');
const router = express.Router();
const ExperimentResult = require('../../database/models/ExperimentResult');

// GET all experiment results
router.get('/', async (req, res) => {
    try {
        const results = await ExperimentResult.find().sort({ dataset: 1, strategy: 1 });
        res.json(results);
    } catch (err) {
        console.error('Error fetching experiments:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST seed sample data
router.post('/seed', async (req, res) => {
    try {
        // Clear existing data
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
