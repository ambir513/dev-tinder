const validator = require("validator");
const bcrypt = require("bcrypt");
const User = require("../models/user.js");

const validationSignUpDate = (req, isUserExist) => {
  const { firstName, lastName, userName, emailId, password } = req.body;

  if (!firstName) {
    throw new Error("please enter your Name");
  } else if (!lastName) {
    throw new Error("please enter your LastName");
  } else if (!userName) {
    throw new Error("please enter your userName");
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
    "avatar",
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
    "emailId",
    "currentPassword"
  ];
  const isAllowedThePassword = Object.keys(req.body).every((k) =>
    allowedPasswordOnly.includes(k)
  );
  if (!isAllowedThePassword) {
    throw new Error("invalid password edit fields");
  }
  const { emailId, currentPassword } = req.body;
  return { emailId, currentPassword };
};

module.exports = {
  validationSignUpDate,
  validateLoginData,
  validateEditData,
  validateEditPassword,
};
