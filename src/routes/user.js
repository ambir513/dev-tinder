const express = require("express");
const { userAuth } = require("../middlewares/auth.js");

const {
  getAllRequest,
  getAllConnection,
  getFeed,
} = require("../controllers/userController.js");

const userRouter = express.Router();

userRouter.get("/request/received", userAuth, getAllRequest);
userRouter.get("/connection", userAuth, getAllConnection);
userRouter.get("/feed", userAuth, getFeed);

module.exports = userRouter;


