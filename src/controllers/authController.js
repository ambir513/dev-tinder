const bcrypt = require("bcrypt");
const User = require("../models/user.js");
const Otp = require("../models/otp.js");
const {
  validationSignUpDate,
  validateLoginData,
} = require("../utils/validation.js");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const signup = async (req, res) => {
  const { firstName, lastName, userName, emailId, password } = req.body;
  const isUserExist = await User.findOne({ emailId: emailId });
  try {
    if (isUserExist) {
      return res.status(402).json({
        message: "Email is already register",
      });
    }

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
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailId,
      subject: "Welcome to DevTinder 🎉",
      html: `
  <div style="font-family: Arial, sans-serif; background-color: #f6f6f6;">
    <table align="center" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">
      <tr>
        <td style="background-color: #242f3e; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">🧑‍💻 DevTinder</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px;">
        <h2 style="color: #333333;">Welcome aboard, ${
          firstName + " " + lastName
        } 👋</h2>

          <p style="font-size: 16px; color: #555;">
            Your account has been successfully created on <strong>DevTinder</strong> – the social discovery platform for developers.
          </p>
          <p style="font-size: 16px; color: #555;">
            Here’s what you can do now:
          </p>
          <ul style="font-size: 16px; color: #555; line-height: 1.6;">
            <li>Create your developer profile</li>
            <li>Explore and match with other devs</li>
            <li>Collaborate on projects or ideas</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://thedevtinder.xyz/" style="background-color: #ff6b00; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Go to DevTinder →
            </a>
          </div>
          <p style="font-size: 14px; color: #777;">
            If you didn’t create this account, please contact us immediately.
          </p>
        </td>
      </tr>
      <td style="background-color: #f0f0f0; padding: 20px; text-align: center;">
    <p style="font-size: 12px; color: #888; margin-bottom: 10px;">
      Need help? Contact <a href="mailto:amarbiradar147@gmail.com">amarbiradar147@gmail.com</a>
    </p>
    <div style="margin-bottom: 10px;">
      <a href="https://linkedin.com/in/ambir513" style="margin: 0 8px;" target="_blank">
        <img src="https://cdn-icons-png.flaticon.com/24/174/174857.png" alt="LinkedIn" width="24" height="24" style="vertical-align: middle;">
      </a>
      <a href="https://wa.me/+918956817729" style="margin: 0 8px;" target="_blank">
        <img src="https://cdn-icons-png.flaticon.com/24/733/733585.png" alt="WhatsApp" width="24" height="24" style="vertical-align: middle;">
      </a>
      <a href="https://twitter.com/ambir513" style="margin: 0 8px;" target="_blank">
        <img src="https://cdn-icons-png.flaticon.com/24/733/733579.png" alt="Twitter" width="24" height="24" style="vertical-align: middle;">
      </a>
    </div>
    <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} DevTinder, All rights reserved.</p>
  </td>
</tr>
    </table>
  </div>
    `,
    };
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error("Email send failed:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
    res.json({ message: "Created Successfully login now" });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const sentotp = async (req, res) => {
  const { emailId } = req.body;
  const isUserExist = await User.findOne({ emailId: emailId });
  try {
    if (isUserExist) {
      return res.status(402).json({
        message: "Email is already register",
      });
    }
    let newOTP = Math.floor(100000 + Math.random() * 900000);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailId,
      subject: "Your DevTinder OTP for Verification",
      html: `
  <div style="font-family: Arial, sans-serif; background-color: #f6f6f6;">
    <table align="center" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">
      <tr>
        <td style="background-color: #242f3e; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">🧑‍💻 DevTinder</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px;">
          <h2 style="color: #333333;">Your One-Time Password (OTP)</h2>
          <p style="font-size: 16px; color: #555;">
            Dear ${emailId},
          </p>
          <p style="font-size: 16px; color: #555;">
            Your OTP for secure access is:
          </p>
          <p style="font-size: 24px; font-weight: bold; color: #242f3e; text-align: center; margin: 20px 0;">
            ${newOTP}
          </p>
          <p style="font-size: 14px; color: #777;">
            This OTP is valid for <strong>1 minutes</strong>. Please do not share it with anyone.
          </p>
          <p style="font-size: 14px; color: #777;">
            If you didn’t request this, you can safely ignore this email.
          </p>
        </td>
      </tr>
     <tr>
  <td style="background-color: #f0f0f0; padding: 20px; text-align: center;">
    <p style="font-size: 12px; color: #888; margin-bottom: 10px;">
      Need help? Contact <a href="mailto:amarbiradar147@gmail.com">amarbiradar147@gmail.com</a>
    </p>
    <div style="margin-bottom: 10px;">
      <a href="https://linkedin.com/in/ambir513" style="margin: 0 8px;" target="_blank">
        <img src="https://cdn-icons-png.flaticon.com/24/174/174857.png" alt="LinkedIn" width="24" height="24" style="vertical-align: middle;">
      </a>
      <a href="https://wa.me/+918956817729" style="margin: 0 8px;" target="_blank">
        <img src="https://cdn-icons-png.flaticon.com/24/733/733585.png" alt="WhatsApp" width="24" height="24" style="vertical-align: middle;">
      </a>
      <a href="https://twitter.com/ambir513" style="margin: 0 8px;" target="_blank">
        <img src="https://cdn-icons-png.flaticon.com/24/733/733579.png" alt="Twitter" width="24" height="24" style="vertical-align: middle;">
      </a>
    </div>
    <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} DevTinder, All rights reserved.</p>
  </td>
</tr>
    </table>
  </div>
    `,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email send failed:", error);
        return res
          .status(401)
          .json({ message: "Something went to wrong, try again" });
      } else {
        console.log("Email sent:", info.response);
      }
    });
    console.log(newOTP);
    const newOtp = new Otp({ emailId, otp: newOTP });
    await newOtp.save();
    return res.json({ message: "OTP Send Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.json({ message: "Logged Successfully", data: user });
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

const resentotp = async (req, res) => {
  const { emailId } = req.body;
  try {
    const isEmailExit = await Otp.findOne({ emailId });
    if (isEmailExit) {
      return res.status(501).json({
        message: "OTP already sent. Please check your email",
      });
    } else {
      let newOTP = Math.floor(100000 + Math.random() * 900000);
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emailId,
        subject: "Your DevTinder OTP (Resent) – Secure Verification Code",
        html: `
  <div style="font-family: Arial, sans-serif; background-color: #f6f6f6;">
  <table align="center" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">
    <tr>
      <td style="background-color: #242f3e; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0;">🧑‍💻 DevTinder</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px;">
        <h2 style="color: #333333;">Your One-Time Password (OTP)</h2>
        <p style="font-size: 16px; color: #555;">
          Hello <strong>${emailId}</strong>,
        </p>
        <p style="font-size: 16px; color: #555;">
          You requested a new OTP to verify your identity on DevTinder. Please use the code below to continue:
        </p>
        <p style="font-size: 24px; font-weight: bold; color: #242f3e; text-align: center; margin: 20px 0;">
          ${newOTP}
        </p>
        <p style="font-size: 14px; color: #777;">
          This OTP is valid for <strong>1 minute</strong>. Please do not share it with anyone for security reasons.
        </p>
        <p style="font-size: 14px; color: #777;">
          If you didn’t request this OTP, you can safely ignore this message.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f0f0f0; padding: 20px; text-align: center;">
        <p style="font-size: 12px; color: #888; margin-bottom: 10px;">
          Need help? Contact <a href="mailto:amarbiradar147@gmail.com">amarbiradar147@gmail.com</a>
        </p>
        <div style="margin-bottom: 10px;">
          <a href="https://linkedin.com/in/ambir513" style="margin: 0 8px;" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/24/174/174857.png" alt="LinkedIn" width="24" height="24" style="vertical-align: middle;">
          </a>
          <a href="https://wa.me/+918956817729" style="margin: 0 8px;" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/24/733/733585.png" alt="WhatsApp" width="24" height="24" style="vertical-align: middle;">
          </a>
          <a href="https://twitter.com/ambir513" style="margin: 0 8px;" target="_blank">
            <img src="https://cdn-icons-png.flaticon.com/24/733/733579.png" alt="Twitter" width="24" height="24" style="vertical-align: middle;">
          </a>
        </div>
        <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} DevTinder, All rights reserved.</p>
      </td>
    </tr>
  </table>
</div>
    `,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Email send failed:", error);
          return res
            .status(401)
            .json({ message: "Something went to wrong, try again" });
        } else {
          console.log("Email sent:", info.response);
        }
      });
      console.log(newOTP);
      const newOtp = new Otp({ emailId, otp: newOTP });
      await newOtp.save();
      return res.json({
        message: "OTP resent successfully. Please check your email.",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verify = async (req, res) => {
  const { emailId, otp } = req.body;
  const otpDoc = await Otp.findOne({ emailId });
  try {
    if (!otpDoc) {
      return res.status(404).json({
        message: "OTP not found or may have expired. Please try again.",
        status: "FAILED",
      });
    }
    const now = new Date();
    const otpAge = now - otpDoc.createdAt; // in ms
    if (otpAge > 1 * 60 * 1000) {
      return res
        .status(400)
        .json({ message: "Your OTP has expired.", status: "FAILED" });
    }
    if (otpDoc.otp === otp) {
      return res
        .status(200)
        .json({ message: "OTP verified successfully.", status: "SUCCESS" });
    } else {
      return res.status(401).json({ message: "Invalid OTP", status: "FAILED" });
    }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = { signup, login, logout, verify, sentotp, resentotp };
