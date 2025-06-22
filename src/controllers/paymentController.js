const razorpayInstance = require("../utils/razorpay.js");
const Payment = require("../models/payment.js");
const User = require("../models/user.js");
const nodemailer = require("nodemailer");
var {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465, // Use 465 for SSL (secure)
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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
    return res.json(user);
  }
  return res.json(user);
};

const webhook = async (req, res) => {
  try {
    const webhookSignature = req.get("X-Razorpay-Signature");
    const rawBody = JSON.stringify(req.body);

    // Validate Signature
    const isWebhookValid = validateWebhookSignature(
      rawBody,
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      console.warn("❌ Invalid webhook signature");
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = req.body.event;
    const paymentDetails = req.body.payload.payment.entity;
    const {
      order_id,
      id: paymentId,
      status,
      amount,
      email: emailId,
      error_reason,
    } = paymentDetails;

    console.log(
      `[Webhook] Event: ${event}, Payment ID: ${paymentId}, Order ID: ${order_id}`
    );

    // Find payment record
    const payment = await Payment.findOne({ orderId: order_id });
    if (!payment) {
      console.error("❌ Payment not found for orderId:", order_id);
      return res.status(404).json({ message: "Payment record not found" });
    }

    // Avoid double processing
    if (payment.status === "captured" && event === "payment.captured") {
      return res.status(200).json({ message: "Already processed" });
    }

    // Update payment status
    payment.status = status;
    await payment.save();

    // Find user
    const user = await User.findById(payment.userId);
    if (!user) {
      console.error("❌ User not found:", payment.userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Mark user as premium
    if (event === "payment.captured") {
      user.isPremium = true;
      user.membershipType = payment.notes?.membership || "basic";
      await user.save();
    }

    // Compose Email
    const amountINR = amount / 100;
    const emailTemplate = {
      from: process.env.EMAIL_USER,
      to: emailId,
      subject:
        event === "payment.captured"
          ? "🎉 Payment Successful - DevTinder Membership"
          : "⚠️ Payment Failed - DevTinder Membership",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f6f6f6;">
          <table align="center" width="600" style="background-color: #ffffff; border-radius: 6px;">
            <tr>
              <td style="background-color: #242f3e; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0;">🧑‍💻 DevTinder</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px;">
                <h2 style="color: ${
                  event === "payment.captured" ? "#333" : "#e63946"
                };">
                  ${
                    event === "payment.captured"
                      ? "Payment Confirmed"
                      : "Payment Failed"
                  }
                </h2>
                <p style="font-size: 16px; color: #555;">Hello ${emailId},</p>
                <p style="font-size: 16px; color: #555;">
                  ${
                    event === "payment.captured"
                      ? `Thank you for your payment of <strong>₹${amountINR}</strong>! Your DevTinder membership is now active.`
                      : `Unfortunately, your payment of <strong>₹${amountINR}</strong> failed.`
                  }
                </p>
                <p style="font-size: 14px; color: #555;">
                  <strong>Payment ID:</strong> ${paymentId}
                  ${
                    event === "payment.failed"
                      ? `<br/><strong>Reason:</strong> ${
                          error_reason || "Unknown reason"
                        }`
                      : ""
                  }
                </p>
                ${
                  event === "payment.failed"
                    ? `
                    <div style="text-align: center; margin: 20px 0;">
                      <a href="https://thedevtinder.xyz/premium" style="background-color: #242f3e; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Retry Payment</a>
                    </div>
                    `
                    : ""
                }
                <p style="font-size: 14px; color: #777;">
                  ${
                    event === "payment.captured"
                      ? "You can now explore and connect with developers around the world. 🚀"
                      : "Please try again using a different payment method or contact our support."
                  }
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f0f0f0; padding: 20px; text-align: center;">
                <p style="font-size: 12px; color: #888;">
                  Need help? Contact <a href="mailto:support@thedevtinder.xyz">support@thedevtinder.xyz</a>
                </p>
                <div style="margin: 10px;">
                  <a href="https://linkedin.com/in/ambir513" target="_blank"><img src="https://cdn-icons-png.flaticon.com/24/174/174857.png" alt="LinkedIn" /></a>
                  <a href="https://wa.me/+918956817729" target="_blank"><img src="https://cdn-icons-png.flaticon.com/24/733/733585.png" alt="WhatsApp" /></a>
                  <a href="https://twitter.com/ambir513" target="_blank"><img src="https://cdn-icons-png.flaticon.com/24/733/733579.png" alt="Twitter" /></a>
                </div>
                <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} DevTinder, All rights reserved.</p>
              </td>
            </tr>
          </table>
        </div>
      `,
    };

    // Send Email
    try {
      await transporter.sendMail(emailTemplate);
      console.log("✅ Email sent to:", emailId);
    } catch (mailErr) {
      console.error("❌ Failed to send email:", mailErr);
    }

    return res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("🔥 Webhook Error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createOrder, paymentVerify, webhook };
