const bcrypt = require("bcrypt");
const User = require("../models/user.js");
const {
  validationSignUpDate,
  validateLoginData,
} = require("../utils/validation.js");

const signup = async (req, res) => {
  const { firstName, lastName, userName, emailId, password } = req.body;
  const isUserExist = await User.findOne({ emailId: emailId });
  try {
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
    res.json({ message: "User created Successfully" });
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
  sameSite: 'None',
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
  sameSite: 'None',
    expires: new Date(Date.now()),
  });
  res.send("Successfully logout");
};

module.exports = { signup, login, logout };
