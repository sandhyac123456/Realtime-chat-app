require("dotenv").config();
const mongoose = require("mongoose");
const url = process.env.MONGO_URL;
const connectDB = async () => {
  try {
    await mongoose.connect(url);
    console.log("MongoDB connected");
  } catch (error) {     
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
