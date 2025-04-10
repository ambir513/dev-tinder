const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://amarbiradar147:Biradar2006@namastenode.iawwfex.mongodb.net/devTinder"
    );
  } catch (error) {
    console.log("Something went to wrong");
  }
};

module.exports = connectDB;
