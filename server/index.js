// Load environment variables before anything else so MONGO_URI etc. are available
require("dotenv").config();
const express = require("express");   // https://expressjs.com/en/starter/hello-world.html
const mongoose = require("mongoose"); // https://mongoosejs.com/docs/connections.html
const cors = require("cors");         // https://www.npmjs.com/package/cors
const http = require("http");

const connectDB = require("./config/db");

// Wrap express in a raw http server so we can reuse it for testing or WebSocket later
const app = express();
const server = http.createServer(app);
// Parse incoming JSON bodies (built-in since Express 4.16+)
app.use(express.json());

// Restrict cross-origin access to our known frontends only.
// credentials: true is needed to allow cookies / auth headers across origins.
// Ref: https://expressjs.com/en/resources/middleware/cors.html
app.use(cors({
  origin: [
    "https://alx-label-app-research-tool.vercel.app",
    "http://localhost:5173",
    "http://localhost:4173"
  ],
  credentials: true
}));

// Manual OPTIONS preflight handler.
// Some browsers send an OPTIONS request before the real one (CORS preflight).
// We respond with 204 (No Content) and the required headers so the browser proceeds.
// Ref: https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request
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

// HTTP security headers — added here as a fallback in case vercel.json headers
// don't fire (e.g. local dev). These follow the OWASP Secure Headers checklist.
// Ref: https://owasp.org/www-project-secure-headers/
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');           // prevent MIME-sniffing
  res.setHeader('X-Frame-Options', 'DENY');                     // block clickjacking
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});


// Connect to MongoDB Atlas (connection config lives in config/db.js)
connectDB();

// Mount route modules under /api namespace (RESTful convention)
app.use("/api/experiments", require("./infrastructure/http/routes/experiment"));
app.use("/api/session", require("./infrastructure/http/routes/session"));
app.use("/api/feedback", require("./infrastructure/http/routes/feedback"));

app.get("/", (req, res) => {
  res.send("Research Tool API is Running...");
});

// Loader.io verification endpoint — required to prove domain ownership
// before running load tests. See: https://loader.io/targets
app.get("/loaderio-f966d5f9ea44275362b21b0760059373/", (req, res) => {
  res.send("loaderio-f966d5f9ea44275362b21b0760059373");
});
app.get("/loaderio-f966d5f9ea44275362b21b0760059373.txt", (req, res) => {
  res.send("loaderio-f966d5f9ea44275362b21b0760059373");
});

// Only start listening when this file is run directly (node index.js),
// not when it's imported for testing. This is a common Node.js pattern.
// Ref: https://nodejs.org/api/modules.html#requiremain
const PORT = process.env.PORT || 5001;
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel's serverless adapter (vercel.json points builds to this file)
module.exports = app;
