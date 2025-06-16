const express = require("express");
const {
  signup,
  login,
  logout,
  verify,
  sentotp,
  resentotp,
  forgetotp,
} = require("../controllers/authController.js");
const { isUserLoginOrNot } = require("../middlewares/auth.js");
const authRouter = express.Router();

authRouter.post("/signup", isUserLoginOrNot, signup);
authRouter.post("/sentotp", isUserLoginOrNot, sentotp);
authRouter.post("/resentotp", isUserLoginOrNot, resentotp);
authRouter.post("/forgetotp", isUserLoginOrNot, forgetotp);
authRouter.post("/verify", isUserLoginOrNot, verify);
authRouter.post("/login", isUserLoginOrNot, login);
authRouter.post("/logout", logout);

module.exports = authRouter;
