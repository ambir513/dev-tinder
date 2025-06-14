const express = require("express");
const {
  signup,
  login,
  logout,
  verify,
} = require("../controllers/authController.js");
const { isUserLoginOrNot } = require("../middlewares/auth.js");
const authRouter = express.Router();

authRouter.post("/signup", isUserLoginOrNot, signup);
authRouter.post("/verify", isUserLoginOrNot, verify);
authRouter.post("/login", isUserLoginOrNot, login);
authRouter.post("/logout", logout);

module.exports = authRouter;
