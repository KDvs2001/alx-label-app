const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,   // Wait up to 30s for Atlas to respond
      socketTimeoutMS: 45000,            // Socket idle timeout
      bufferCommands: true,              // Queue operations while reconnecting
      maxPoolSize: 5,                    // Keep connection pool small (free tier)
    });
    // Set buffer timeout globally so operations wait up to 30s for connection
    mongoose.set('bufferTimeoutMS', 30000);
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    // Retry once after 3 seconds
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
