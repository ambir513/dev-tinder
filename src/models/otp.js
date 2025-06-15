const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const otpSchema = new Schema({
  emailId: String,
  otp: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60,
  },
});

const Otp = model("Otp", otpSchema);
module.exports = Otp;
