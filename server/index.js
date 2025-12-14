require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Import Routes
const projectRoutes = require("./infrastructure/http/routes/project");
const taskRoutes = require("./infrastructure/http/routes/task");
const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store io instance
app.set('socketio', io);

io.on('connection', (socket) => {
  console.log('ðŸ”Œ Client connected');
});

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.send("Research Tool API is Running...");
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(ðŸš€ Server running on port );
});
