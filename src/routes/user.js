const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const { getAllRequest } = require("../controllers/userController.js");
const userRouter = express.Router();

userRouter.get("/request/received", userAuth, getAllRequest);
module.exports = userRouter;
