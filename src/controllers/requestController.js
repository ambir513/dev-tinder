const ConnectionRequest = require("../models/connectionRequest.js");
const User = require("../models/user.js");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const nodemailer = require("nodemailer");
const sendEmail = require("../utils/sendEmail.js");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465, // Use 465 for SSL (secure)
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const requestStatus = async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;
    const { emailId, senderName, receiverName, senderBio } = req.body;

    const allowedStatus = ["interested", "ignored"];
    const isAllowedStatus = allowedStatus.includes(status);

    if (!isAllowedStatus) {
      return res.status(400).json({
        message: "Invalid status type" + status,
      });
    } else if (toUserId.length != 24) {
      return res.status(400).json({
        message: "Invalid User Id",
      });
    }
    const isUserExist = await User.findById(toUserId);
    if (!isUserExist) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isConnectionExist = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (isConnectionExist) {
      return res.status(400).json({
        message: "Connection request already exists!",
      });
    }
    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailId,
      subject: `${senderName} is interested in connecting with you! 👋`,
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
            <h2 style="color: #333333;">Hi ${receiverName}, ${senderName} is interested in connecting with you! 👋</h2>

            <p style="font-size: 16px; color: #555;">
              <strong>${senderName}</strong>, a <strong>${senderBio}</strong>, wants to connect with you on <strong>DevTinder</strong> – the social discovery platform for developers.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://thedevtinder.xyz/" style="background-color: #ff6b00; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                See you request →
              </a>
            </div>

            <p style="font-size: 14px; color: #777;">
              You can log in to DevTinder to learn more or reply to this interest.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f0f0f0; padding: 20px; text-align: center;">
            <p style="font-size: 12px; color: #888; margin-bottom: 10px;">
              Need help? Contact <a href="mailto:support@thedevtinder.xyz">support@thedevtinder.xyz</a>
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
    if (status === "interested") {
      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.error("Email send failed:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });
    }

    const data = await connectionRequest.save();
    console.log(data);
    res.json({
      message: "Request send successfully",
      data,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const reviewStatus = async (req, res) => {
  try {
    const user = req.user;
    const { status, requestId } = req.params;

    // check the params
    // check the requestId in DB

    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status) || requestId.length != 24) {
      return res.status(400).json({
        message: "Invalid request",
      });
    }
    const connectionRequest = await ConnectionRequest.findOne({
      fromUserId: requestId,
      toUserId: user._id,
      status: "interested",
    });
    if (!connectionRequest) {
      return res.status(400).json({ message: "Connection request not found" });
    }
    connectionRequest.status = status;
    const data = await connectionRequest.save();
    res.json({
      message: "Connection request",
      data,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = {
  requestStatus,
  reviewStatus,
};
