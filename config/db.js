const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

// Connection successful
db.on("connected", () => {
  console.log("✅ MongoDB connected successfully!");
});

// Connection error
db.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Disconnected
db.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected!");
});
