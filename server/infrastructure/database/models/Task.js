const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  data: mongoose.Schema.Types.Mixed, // Flexible data payload (text, image url, etc.)
  status: { type: String, enum: ["pending", "annotated", "seed"], default: "pending" },
  label: { type: String }, // Stores the annotation
  ground_truth: { type: String }, // True label (for evaluation only, not used in selection)
  is_seed: { type: Boolean, default: false }, // Marks seed training examples
  priority: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Task", TaskSchema);
