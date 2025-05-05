const User = require("../models/user.js");
const Post = require("../models/userPost.js");
const bcrypt = require("bcrypt");
const {
  validateEditData,
  validateEditPassword,
} = require("../utils/validation.js");

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

const password = async (req, res) => {
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
    res.json({ message: "Password successfully update" });
  } catch (error) {
    res.status(401).send(error.message);
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

module.exports = { view, edit, password, post, userName };
