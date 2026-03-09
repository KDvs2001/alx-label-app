// Mongoose connection helper for MongoDB Atlas.
// Ref: https://mongoosejs.com/docs/connections.html#options
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // serverSelectionTimeoutMS: how long the driver waits to find a suitable server.
    // On free-tier Atlas (M0), cold starts can be slow so 30s avoids premature timeout.
    // Ref: https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/connection-options/
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      bufferCommands: true,       // let Mongoose queue DB ops until connection is ready
      maxPoolSize: 5,             // keep pool small to stay within Atlas free-tier limits
    });
    // bufferTimeoutMS caps how long queued operations wait before failing
    mongoose.set('bufferTimeoutMS', 30000);
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    // Simple retry-once pattern with a 3s delay.
    // For production you'd want exponential backoff, but for a research tool
    // a single retry handles most transient Atlas cold-start failures.
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
