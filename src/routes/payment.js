const express = require("express");
const { userAuth } = require("../middlewares/auth");
const {
  createOrder,
  paymentVerify,
  webhook,
} = require("../controllers/paymentController");

const paymentRouter = express.Router();

paymentRouter.post("/create", userAuth, createOrder);
paymentRouter.post("/webhook", webhook);
paymentRouter.get("/verify", userAuth, paymentVerify);

module.exports = paymentRouter;
