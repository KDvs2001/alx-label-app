require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
// const { Server } = require("socket.io"); // Unused

const connectDB = require("./config/db");

// Initialize App
const app = express();
const server = http.createServer(app);
// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    "https://alx-label-app-research-tool.vercel.app",
    "http://localhost:5173",
    "http://localhost:4173"
  ],
  credentials: true
}));

// Explicit preflight handler for Vercel serverless
app.options('*', cors({
  origin: [
    "https://alx-label-app-research-tool.vercel.app",
    "http://localhost:5173",
    "http://localhost:4173"
  ],
  credentials: true
}));

// Database Connection
connectDB();

// Socket.io removed (Unused)

// Routes
app.use("/api/experiments", require("./infrastructure/http/routes/experiment"));
app.use("/api/session", require("./infrastructure/http/routes/session"));
app.use("/api/feedback", require("./infrastructure/http/routes/feedback"));

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
