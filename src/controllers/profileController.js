const User = require("../models/user.js");
const Post = require("../models/userPost.js");
const bcrypt = require("bcrypt");
const {
  validateEditData,
  validateEditPassword,
} = require("../utils/validation.js");
const nodemailer = require("nodemailer");

const view = (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const edit = async (req, res) => {
  try {
    const userId = req.user._id;
    validateEditData(req);

    let avatarUrl = null;
    if (req.file) {
      avatarUrl = req.file.path;
    }

    const isUpdate = await User.findByIdAndUpdate(
      userId,
      { ...req.body, ...(avatarUrl && { photoUrl: avatarUrl }) },
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).select("-password");
    if (!isUpdate) {
      throw new Error("something went wrong");
    }
    res.status(200).json({
      message: "Successfully updated",
      data: isUpdate,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const verify = async (req, res) => {
  try {
    const { emailId, currentPassword, newPassword, confirmPassword } =
      validateEditPassword(req);
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("User is not found");
    }
    const isCurrentPassword = await user.validatePassword(currentPassword);
    const isNewPassword = await user.validatePassword(newPassword);
    if (isNewPassword) {
      throw new Error("Password could not be same");
    }
    if (!isCurrentPassword) {
      throw new Error("Current Password is Incorrect");
    }

    let otp = Math.floor(1000 + Math.random() * 9000);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailId,
      subject: "Cron Test Email",
      text: "OTP is " + otp,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email send failed:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.json({ message: "OTP send successfully", data: otp });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const post = async (req, res) => {
  // userid
  // file.url
  // store DB through post
  // postId store through User
  try {
    const _id = req.user._id;
    console.log("File received:", req.file);
    const fileUrl = req.file?.path;
    if (!fileUrl) {
      throw new Error("Something went wrong");
    }
    const userPost = await Post.create({
      photoUrl: fileUrl,
      caption: req.body?.caption,
    });
    console.log(userPost._id);
    const user = await User.findByIdAndUpdate(
      _id,
      {
        $push: { postId: userPost._id },
      },
      { returnDocument: "after" }
    ).populate("postId", "photoUrl caption");
    res.json({
      message: "Successfully posted",
      data: user,
    });
  } catch (error) {
    res.status(401).send(error.message);
  }
};

const userName = async (req, res) => {
  try {
    const { userName } = req.params;
    if (userName == "") {
      throw new Error("userName is not define");
    }
    const isUser = await User.findOne({ userName: userName })
      .populate("postId", "photoUrl caption")
      .select("-password")
      .lean();
    res.json({ message: "Get Successfullly", data: isUser });
  } catch (error) {
    res.status(402).send(error.message);
  }
};

const verifyPassword = async (req, res) => {
  try {
    const { emailId } = req.body;
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Email is not found");
    }
    res.json({ message: "All set", status: "SUCCESS" });
  } catch (error) {
    res.status(402).json({ message: error.message });
  }
};

const newPassword = async (req, res) => {
  const { emailId, newPassword, confirmPassword } = req.body;
  try {
    const user = await User.findOne({ emailId });
    const isNewPassword = await user.validatePassword(newPassword);
    const newHashPassword = await bcrypt.hash(newPassword, 10);
    const isUpdateUserPassword = await User.findByIdAndUpdate(
      user._id,
      {
        password: newHashPassword,
      },
      {
        runValidators: true,
      }
    );
    if (!isUpdateUserPassword) {
      throw new Error("Password is not updated");
    }
    res.json({ message: "Password Updated Successfully" });
  } catch (error) {
    res.status(402).json({ message: error.message });
  }
};
const oauth = async (req, res) => {
  const { photoUrl } = req.body;
  const userToken = req.user;
  try {
    const user = await User.findByIdAndUpdate(
      { _id: userToken?.id },
      { photoUrl },
      { new: true }
    );

    if (user) {
      await user.save();
      res.json({ message: "Logged Successfully", data: user });
    } else {
      res.status(401).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(401).send(error.message);
  }
};

module.exports = {
  view,
  edit,
  verifyPassword,
  newPassword,
  post,
  userName,
  verify,
  oauth,
};
