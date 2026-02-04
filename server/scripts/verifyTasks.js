/**
 * Verify Tasks Script
 * Checks if tasks in the database have text content
 */
require("dotenv").config();
const mongoose = require("mongoose");

async function verify() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/alx_research");

        const Task = mongoose.model("Task", new mongoose.Schema({ data: Object }, { strict: false }));

        // Find one task
        const task = await Task.findOne();

        if (task) {
            console.log("✅ Found task!");
            console.log("ID:", task._id);
            console.log("Data:", JSON.stringify(task.data, null, 2));

            if (task.data && task.data.text) {
                console.log("📜 Text Content:", task.data.text.substring(0, 50) + "...");
                console.log("✅ VERIFICATION PASSED: Task has text.");
            } else {
                console.log("❌ VERIFICATION FAILED: Task missing data.text");
            }
        } else {
            console.log("❌ No tasks found in database.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

verify();
