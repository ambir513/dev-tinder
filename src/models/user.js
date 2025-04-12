const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const validator = require("validator");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 20,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is not valid: " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password must be Strong: " + value);
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "custom"].includes(value)) {
          throw new Error("It should be either male, female or custom");
        }
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://i.pinimg.com/736x/0f/78/5d/0f785d55cea2a407ac8c1d0c6ef19292.jpg",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("invalid photo url: " + value);
        }
      },
    },
    description: {
      type: String,
      default: "I'm user of devTinder!!",
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
