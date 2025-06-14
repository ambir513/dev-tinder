const bcrypt = require("bcrypt");
const User = require("../models/user.js");
const {
  validationSignUpDate,
  validateLoginData,
} = require("../utils/validation.js");
const nodemailer = require("nodemailer");
require("dotenv").config();

const signup = async (req, res) => {
  const { firstName, lastName, userName, emailId, password } = req.body;
  const isUserExist = await User.findOne({ emailId: emailId });
  try {
    if (isUserExist) {
      return res.status(402).json({
        message: "Email is already register",
      });
    }
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    //   },
    // });

    // const mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: emailId,
    //   subject: "Cron Test Email",
    //   text: "OTP is " + otp,
    // };
    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.error("Email send failed:", error);
    //   } else {
    //     console.log("Email sent:", info.response);
    //   }
    // }); if (value !== "success") {
    //   res.status(401).json({ message: "Invalid OTP" });
    // }
    validationSignUpDate(req, isUserExist);
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      userName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.json({ message: "Created Successfully login now" });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const login = async (req, res) => {
  const { emailId, password } = req.body;
  const user = await User.findOne({ emailId: emailId });
  try {
    validateLoginData(req, user);
    const isPaswordValid = await user.validatePassword(password);
    if (!isPaswordValid) {
      throw new Error("Invalid Credentials");
    }

    const token = await user.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    res.json({ message: "Login Successfully", data: user });
  } catch (error) {
    res.status(401).send(error.message);
  }
};

const logout = async (req, res) => {
  res.cookie("token", null, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(Date.now()),
  });
  res.send("Successfully logout");
};

const verify = async (req, res) => {
  // const { firstName, lastName, userName, emailId, password, value } = req.body;
  // const isUserExist = await User.findOne({ emailId: emailId });
  try {
    // if (isUserExist) {
    return res.status(402).json({
      message: "Email is already register",
    });
    // }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = { signup, login, logout, verify };
