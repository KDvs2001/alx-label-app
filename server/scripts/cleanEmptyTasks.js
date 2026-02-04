/**
 * Clean Empty Tasks Script
 * Removes tasks that don't have text content
 */
require("dotenv").config();
const mongoose = require("mongoose");

async function cleanDatabase() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/alx_research");
        console.log("✅ Connected to MongoDB");

        const Task = mongoose.model("Task", new mongoose.Schema({ data: Object }, { strict: false }));

        // Count total tasks
        const total = await Task.countDocuments();
        console.log(`📊 Total tasks before cleanup: ${total}`);

        // Find tasks with no text in data.text, data.content, text, or content
        const result = await Task.deleteMany({
            $and: [
                { "data.text": { $exists: false } },
                { "data.content": { $exists: false } },
                { "text": { $exists: false } },
                { "content": { $exists: false } }
            ]
        });

        console.log(`🗑️ Deleted ${result.deletedCount} empty/defective tasks`);

        const remaining = await Task.countDocuments();
        console.log(`📊 Remaining tasks: ${remaining}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error cleaning database:", error);
        process.exit(1);
    }
}

cleanDatabase();
