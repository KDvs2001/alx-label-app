require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");

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

// Explicit preflight handler (compatible with all Express versions)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(204);
  }
  next();
});

// Security Headers Middleware (defense-in-depth alongside vercel.json)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});


// Database Connection
connectDB();

// Routes
app.use("/api/experiments", require("./infrastructure/http/routes/experiment"));
app.use("/api/session", require("./infrastructure/http/routes/session"));
app.use("/api/feedback", require("./infrastructure/http/routes/feedback"));

app.get("/", (req, res) => {
  res.send("Research Tool API is Running...");
});

// Loader.io verification endpoint
app.get("/loaderio-f966d5f9ea44275362b21b0760059373/", (req, res) => {
  res.send("loaderio-f966d5f9ea44275362b21b0760059373");
});
app.get("/loaderio-f966d5f9ea44275362b21b0760059373.txt", (req, res) => {
  res.send("loaderio-f966d5f9ea44275362b21b0760059373");
});

const PORT = process.env.PORT || 5001;
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
