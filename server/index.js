require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const projectRoutes = require("./infrastructure/http/routes/project");
const taskRoutes = require("./infrastructure/http/routes/task");

// Initialize App
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
connectDB();

// Socket.io Connection
io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Routes
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("Research Tool API is Running...");
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`ðŸš€ Server running on port ${PORT}`);
});
