/**
 * Utility: Clear Database
 * Contains simulation reset logic and common helper functions.
 * Includes: asyncHandler, validation helpers, and database cleanup script.
 */

require('dotenv').config();
const mongoose = require('mongoose');

// --- Helper: Async Handler ---
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// --- Helper: Validation ---
const isValidId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

const validateBody = (body, fields) => {
    const missing = fields.filter(field => !body[field]);
    if (missing.length > 0) {
        return `Missing required fields: ${missing.join(', ')}`;
    }
    return null;
};

// --- Script: Clear Database ---
// Only load models if we are running the cleanup script to avoid side effects
// (or if we need them for the script execution)
const DatasetConfig = require('../infrastructure/database/models/DatasetConfig');
const Task = require('../infrastructure/database/models/Task');
const Annotation = require('../infrastructure/database/models/Annotation');
const ActiveRound = require('../infrastructure/database/models/ActiveRound');

async function clearDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('âœ… Connected to MongoDB');

        // Count existing documents
        const projectCount = await DatasetConfig.countDocuments();
        const taskCount = await Task.countDocuments();
        const annotationCount = await Annotation.countDocuments();
        const roundCount = await ActiveRound.countDocuments();

        console.log('\nðŸ“Š Current Database State:');
        console.log(`   Projects: ${projectCount}`);
        console.log(`   Tasks: ${taskCount}`);
        console.log(`   Annotations: ${annotationCount}`);
        console.log(`   Active Rounds: ${roundCount}`);

        if (projectCount === 0 && taskCount === 0 && annotationCount === 0 && roundCount === 0) {
            console.log('\nâœ¨ Database is already clean!');
            process.exit(0);
        }

        // Clear all collections
        console.log('\nðŸ§¹ Clearing database...');
        await DatasetConfig.deleteMany({});
        await Task.deleteMany({});
        await Annotation.deleteMany({});
        await ActiveRound.deleteMany({});

        console.log('âœ… Database cleared successfully!');
        
        console.log('\nðŸ“Š New Database State:');
        console.log(`   Projects: 0`);
        console.log(`   Tasks: 0`);
        console.log(`   Annotations: 0`);
        console.log(`   Active Rounds: 0`);

        process.exit(0);
    } catch (error) {
        console.error('âŒ Error:', error.message);
        process.exit(1);
    }
}

// Execute logic if run directly
if (require.main === module) {
    clearDatabase();
}

// Export helpers for use in server application
module.exports = { 
    clearDatabase,
    asyncHandler,
    isValidId,
    validateBody
};
