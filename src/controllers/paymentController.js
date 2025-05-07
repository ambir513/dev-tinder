const razorpayInstance = require("../utils/razorpay.js");
const Payment = require("../models/payment.js");
const User = require("../models/user.js");
var {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

const dotenv = require("dotenv");
dotenv.config();

const createOrder = async (req, res) => {
  try {
    const { amount, membership, firstName, lastName, email } = req.body;
    const order = await razorpayInstance.orders.create({
      amount: amount,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName: firstName,
        lastName: lastName,
        membership: membership,
        email: email,
      },
    });
    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });
    const keyId = process.env.RAZORPAY_KEY_ID;
    const savePayment = await payment.save();
    res.json({ ...savePayment.toJSON(), keyId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const paymentVerify = async (req, res) => {
  const user = req.user;
  if (user.isPremium) {
    return res.json({ isPremium: true });
  }
  return res.json({ isPremium: false });
};

const webhook = async (req, res) => {
  try {
    const webhookSignature = req.get("X-Razorpay-Signature");
    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      return res.status(400).json({ message: "Webhook signature is invalid" });
    }

    // update my payment status in DB
    // Update the User as premium

    const paymentDetails = req.body.payload.payment.entity;
    console.log("Looking for orderId:", paymentDetails.order_id);
   const payment = await Payment.findOne({
  orderId: paymentDetails.order_id,
});
    console.log("Payment found:", payment);

    payment.status = paymentDetails.status;
    await payment.save();

    const user = await User.findOne({ _id: payment.userId });
    console.log("User found:", user);
    if (user) {
    user.isPremium = true;
    user.membershipType = payment.notes.membership;
    await user.save();
    }
    // if (req.body.event == "payment.captured") {
    // }

    // if (req.body.event == "payment.failed") {
    // }
    return res.status(200).json({ message: "Webhook received successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, paymentVerify, webhook };
