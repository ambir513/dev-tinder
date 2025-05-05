const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const URL = process.env.MONGODB_KEY;
const connectDB = async () => {
  try {
    await mongoose.connect(URL);
  } catch (error) {
    console.log("Something went to wrong", error);
  }
};

module.exports = connectDB;
