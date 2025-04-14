const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth.js");
const {
  requestStatus,
  reviewStatus,
} = require("../controllers/requestController.js");

requestRouter.post("/send/:status/:toUserId", userAuth, requestStatus);
requestRouter.post("/review/:status/:requestId", userAuth, reviewStatus);

module.exports = requestRouter;
