require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
// const { Server } = require("socket.io"); // Unused

const connectDB = require("./config/db");
// const projectRoutes = require("./infrastructure/http/routes/project"); // REMOVED
const taskRoutes = require("./infrastructure/http/routes/task");

// Initialize App
const app = express();
const server = http.createServer(app);
// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
connectDB();

// Socket.io removed (Unused)

// Routes
// app.use("/api/projects", projectRoutes); // REMOVED (Project endpoints not used in demo)
app.use("/api/tasks", taskRoutes);
app.use("/api/experiments", require("./infrastructure/http/routes/experiment"));

app.get("/", (req, res) => {
  res.send("Research Tool API is Running...");
});

const PORT = process.env.PORT || 5001;
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
