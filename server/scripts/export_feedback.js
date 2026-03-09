// Quick CLI script to dump all evaluator feedback from Mongo into a JSON file.
// Run it with: node scripts/export_feedback.js
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// grab env vars from the server's .env (one folder up from /scripts)
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const EvaluatorFeedback = require("../infrastructure/database/models/EvaluatorFeedback");
const connectDB = require("../config/db");

async function exportFeedback() {
    try {
        await connectDB();
        console.log("Connected to database. Fetching feedback...");

        // .lean() returns plain JS objects instead of full Mongoose documents —
        // way faster when we just need to read data, not modify it
        // CITATION: .lean() — skip Mongoose document overhead for read-only queries
        // SOURCE: Mongoosejs.com (n.d.). "Lean Queries"
        // URL: https://mongoosejs.com/docs/tutorials/lean.html
        const feedback = await EvaluatorFeedback.find({}).lean();

        if (feedback.length === 0) {
            console.log("No feedback found in the database.");
            process.exit(0);
        }

        // write everything out as formatted JSON
        // writeFileSync is fine here since this is a one-off script, not a server route
        // CITATION: fs.writeFileSync() — synchronously write data to a file
        // SOURCE: Node.js Foundation (n.d.). "fs.writeFileSync(file, data[, options])"
        // URL: https://nodejs.org/api/fs.html#fswritefilesyncfile-data-options
        const outputPath = path.join(__dirname, "../../evaluator_feedback_export.json");
        fs.writeFileSync(outputPath, JSON.stringify(feedback, null, 2));

        console.log(`Successfully exported ${feedback.length} feedback records to:`);
        console.log(outputPath);

    } catch (error) {
        console.error("Error exporting feedback:", error);
    } finally {
        // close the connection so the script doesn't hang forever
        // CITATION: connection.close() — cleanly shut down a Mongoose connection
        // SOURCE: Mongoosejs.com (n.d.). "Connections — Closing"
        // URL: https://mongoosejs.com/docs/connections.html#closing-connections
        mongoose.connection.close();
        process.exit(0);
    }
}

exportFeedback();
