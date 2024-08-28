require('dotenv').config();

const mongoose = require('mongoose');
const mongoURI = process.env.MONGODB_URI; // MongoDB Atlas connection string

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Optionally exit process if unable to connect
  }
};


module.exports = connectDB;
