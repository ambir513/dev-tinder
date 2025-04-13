const validator = require("validator");
const bcrypt = require("bcrypt");
const User = require("../models/user.js");

const validationSignUpDate = (req, isUserExist) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName) {
    throw new Error("please enter your Name");
  } else if (!lastName) {
    throw new Error("please enter your LastName");
  } else if (!emailId) {
    throw new Error("please enter your Email");
  } else if (!password) {
    throw new Error("please enter your password");
  } else if (!validator.isEmail(req.body.emailId)) {
    throw new Error("please enter your correct email ID ");
  } else if (!validator.isStrongPassword(req.body.password)) {
    throw new Error(
      "password should have, [ minLength - 8, minLowercase - 1, minUppercase - 1, minNumbers - 1, minSpecialCharacters - 1 ] "
    );
  } else if (isUserExist) {
    throw new Error("Email is already register to this " + emailId);
  }
};

const validateLoginData = (req, isUserExist) => {
  const { emailId, password } = req.body;
  if (!validator.isEmail(emailId)) {
    throw new Error("please enter your correct email ID ");
  } else if (!isUserExist) {
    throw new Error("Invalid Credentials");
  }
};

const validateEditData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "photoUrl",
    "description",
    "skills",
  ];
  const isEditAllowed = Object.keys(req.body).every((k) =>
    allowedEditFields.includes(k)
  );
  if (!isEditAllowed) {
    throw new Error("Invalid Edit Request");
  }
};

const validateEditPassword = (req) => {
  const allowedPasswordOnly = [
    "currentPassword",
    "newPassword",
    "confirmPassword",
  ];
  const isAllowedThePassword = Object.keys(req.body).every((k) =>
    allowedPasswordOnly.includes(k)
  );
  if (!isAllowedThePassword) {
    throw new Error("invalid password edit fields");
  }
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword) {
    throw new Error("Password doesn't Match");
  } else if (
    currentPassword === newPassword ||
    currentPassword === confirmPassword
  ) {
    throw new Error("New password must be different");
  }
  return { currentPassword, newPassword, confirmPassword };
};

module.exports = {
  validationSignUpDate,
  validateLoginData,
  validateEditData,
  validateEditPassword,
};
