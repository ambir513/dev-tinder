const User = require("../models/user.js");
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
    const userId = req.user._id
    validateEditData(req);
    const isUpdate = await User.findByIdAndUpdate(userId, req.body, {
      returnDocument: true,
      runValidators: true,
    });
    if (!isUpdate) {
      throw new Error("something went wrong");
    }
    res.send("Successfully updated");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const password = async (req, res) => {
  try {
    const userId = req.user._id
    const { currentPassword, newPassword, confirmPassword } =
      validateEditPassword(req);
    const user = await User.findById(userId);
    const isCurrentPassword = user.validatePassword(currentPassword);
    if (!isCurrentPassword) {
      throw new Error("Current Password is Incorrect");
    }
    const newHashPassword = await bcrypt.hash(newPassword, 10);
    const isUpdateUserPassword = await User.findByIdAndUpdate(
      userId,
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
    res.send("Password successfully update");
  } catch (error) {
    res.status(401).send(error.message);
  }
};

module.exports = { view, edit, password };
