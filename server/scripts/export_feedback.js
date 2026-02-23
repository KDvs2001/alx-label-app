const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const EvaluatorFeedback = require("../infrastructure/database/models/EvaluatorFeedback");
const connectDB = require("../config/db");

async function exportFeedback() {
    try {
        await connectDB();
        console.log("Connected to database. Fetching feedback...");

        const feedback = await EvaluatorFeedback.find({}).lean();

        if (feedback.length === 0) {
            console.log("No feedback found in the database.");
            process.exit(0);
        }

        const outputPath = path.join(__dirname, "../../evaluator_feedback_export.json");
        fs.writeFileSync(outputPath, JSON.stringify(feedback, null, 2));

        console.log(`✅ Successfully exported ${feedback.length} feedback records to:`);
        console.log(outputPath);

    } catch (error) {
        console.error("Error exporting feedback:", error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
}

exportFeedback();
