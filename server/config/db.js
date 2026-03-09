// Mongoose connection helper for MongoDB Atlas.
// Called once at server startup — every other file just imports the model, not this.
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // serverSelectionTimeoutMS = how long the driver looks for a server before giving up.
    // Atlas free-tier (M0) can have slow cold starts, 30s avoids premature timeouts.
    // socketTimeoutMS = how long a socket can sit idle before closing.
    // CITATION: mongoose.connect() — establish a connection with tuneable driver options
    // SOURCE: Mongoosejs.com (n.d.). "Connections"
    // URL: https://mongoosejs.com/docs/connections.html#options
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      bufferCommands: true,       // queue DB ops until connection is ready
      // keep the pool small — Atlas M0 free tier caps at 500 connections total,
      // and the default pool size of 100 is overkill for a research tool
      // CITATION: maxPoolSize — limit the number of concurrent sockets to the DB
      // SOURCE: MongoDB Inc. (n.d.). "Connection Pool Configuration"
      // URL: https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/connection-options/
      maxPoolSize: 5,
    });

    // cap how long queued operations wait before timing out
    mongoose.set('bufferTimeoutMS', 30000);
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    // simple retry-once with a 3s delay.
    // for production you'd want exponential backoff, but for a research tool
    // a single retry handles most transient Atlas cold-start hiccups.
    // CITATION: setTimeout retry — basic reconnect pattern for transient failures
    // SOURCE: Stack Overflow (2018). "Mongoose auto reconnect"
    // URL: https://stackoverflow.com/questions/45645791/how-to-handle-mongoose-connection-error
    setTimeout(async () => {
      try {
        await mongoose.connect(process.env.MONGO_URI, {
          serverSelectionTimeoutMS: 30000,
          socketTimeoutMS: 45000,
        });
        console.log("MongoDB Connected on retry");
      } catch (retryErr) {
        console.error("MongoDB Retry Failed:", retryErr.message);
      }
    }, 3000);
  }
};

module.exports = connectDB;
