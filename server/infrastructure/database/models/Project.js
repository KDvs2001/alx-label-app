const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["active", "archived"], default: "active" },
  datasetConfig: {
    source: String,
    totalItems: Number
  },
  // We will store actual tasks/annotations in separate collections or linked
});

module.exports = mongoose.model("Project", ProjectSchema);
