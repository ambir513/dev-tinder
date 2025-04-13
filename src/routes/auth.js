const express = require("express");
const { signup, login, logout } = require("../controllers/authController.js");
const { isUserLoginOrNot } = require("../middlewares/auth.js");
const authRouter = express.Router();

authRouter.post("/signup", isUserLoginOrNot, signup);
authRouter.post("/login", isUserLoginOrNot, login);
authRouter.post("/logout", logout);

module.exports = authRouter;
