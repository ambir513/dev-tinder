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
    user: process.env.EMAIL_USER2,
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

    const user = await User.findById(payment.userId);
    if (!user) {
      console.error("❌ User not found:", payment.userId);
      return;
    }

    user.isPremium = true;
    user.membershipType = payment.notes.membership;
    console.log(user.membershipType);
    console.log(payment.notes.membership);
    await user.save();
    if (req.body.event === "payment.captured") {
      const { email: emailId } = req.body.payload.payment.entity;
      const amount = req.body.payload.payment.entity.amount / 100;
      const paymentId = req.body.payload.payment.entity.id;

      const mailOptions = {
        from: process.env.EMAIL_USER2,
        to: emailId,
        subject: "🎉 Payment Successful - DevTinder Membership",
        html: `
  <div style="font-family: Arial, sans-serif; background-color: #f6f6f6;">
    <table align="center" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">
      <tr>
        <td style="background-color: #242f3e; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">🧑‍💻 DevTinder</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px;">
          <h2 style="color: #333333;">Payment Confirmed</h2>
          <p style="font-size: 16px; color: #555;">
            Hello ${emailId},
          </p>
          <p style="font-size: 16px; color: #555;">
            Thank you for your payment of <strong>₹${amount}</strong>! Your DevTinder membership has been successfully activated.
          </p>
          <p style="font-size: 14px; color: #555;">
            <strong>Payment ID:</strong> ${paymentId}
          </p>
          <p style="font-size: 14px; color: #555;">
            You can now explore and connect with developers around the world. 🚀
          </p>
          <p style="font-size: 14px; color: #777;">
            If you did not make this payment or have any concerns, please contact us immediately.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background-color: #f0f0f0; padding: 20px; text-align: center;">
          <p style="font-size: 12px; color: #888; margin-bottom: 10px;">
            Need help? Contact <a href="mailto:support@thedevtinder.xyz">support@thedevtinder.xyz</a>
          </p>
          <div style="margin-bottom: 10px;">
            <a href="https://linkedin.com/in/ambir513" style="margin: 0 8px;" target="_blank">
              <img src="https://cdn-icons-png.flaticon.com/24/174/174857.png" alt="LinkedIn" width="24" height="24" style="vertical-align: middle;">
            </a>
            <a href="https://wa.me/+918956817729" style="margin: 0 8px;" target="_blank">
              <img src="https://cdn-icons-png.flaticon.com/24/733/733585.png" alt="WhatsApp" width="24" height="24" style="vertical-align: middle;">
            </a>
            <a href="https://twitter.com/ambir513" style="margin: 0 8px;" target="_blank">
              <img src="https://cdn-icons-png.flaticon.com/24/733/733579.png" alt="Twitter" width="24" height="24" style="vertical-align: middle;">
            </a>
          </div>
          <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} DevTinder, All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
    `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Email send failed:", error);
          return res
            .status(500)
            .json({ message: "Payment succeeded, but email failed to send." });
        } else {
          console.log("Payment confirmation email sent:", info.response);
        }
      });
    }
    if (req.body.event === "payment.failed") {
      const { email: emailId } = req.body.payload.payment.entity;
      const amount = req.body.payload.payment.entity.amount / 100; // convert paise to INR
      const paymentId = req.body.payload.payment.entity.id;
      const reason =
        req.body.payload.payment.entity.error_reason || "Unknown reason";

      const mailOptions = {
        from: process.env.EMAIL_USER2,
        to: emailId,
        subject: "⚠️ Payment Failed - DevTinder Membership",
        html: `
  <div style="font-family: Arial, sans-serif; background-color: #f6f6f6;">
    <table align="center" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">
      <tr>
        <td style="background-color: #242f3e; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">🧑‍💻 DevTinder</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px;">
          <h2 style="color: #e63946;">Payment Failed</h2>
          <p style="font-size: 16px; color: #555;">
            Hello ${emailId},
          </p>
          <p style="font-size: 16px; color: #555;">
            Unfortunately, your payment of <strong>₹${amount}</strong> could not be processed.
          </p>
          <p style="font-size: 14px; color: #555;">
            <strong>Payment ID:</strong> ${paymentId}<br />
            <strong>Reason:</strong> ${reason}
          </p>
          <p style="font-size: 14px; color: #777;">
            This may happen due to insufficient funds, card issues, or technical glitches. Please try again using a different payment method.
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://thedevtinder.xyz/premium" style="background-color: #242f3e; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Retry Payment</a>
          </div>
          <p style="font-size: 14px; color: #777;">
            If you believe this was an error, feel free to contact our support team.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background-color: #f0f0f0; padding: 20px; text-align: center;">
          <p style="font-size: 12px; color: #888; margin-bottom: 10px;">
            Need help? Contact <a href="mailto:support@thedevtinder.xyz">support@thedevtinder.xyz</a>
          </p>
          <div style="margin-bottom: 10px;">
            <a href="https://linkedin.com/in/ambir513" style="margin: 0 8px;" target="_blank">
              <img src="https://cdn-icons-png.flaticon.com/24/174/174857.png" alt="LinkedIn" width="24" height="24" style="vertical-align: middle;">
            </a>
            <a href="https://wa.me/+918956817729" style="margin: 0 8px;" target="_blank">
              <img src="https://cdn-icons-png.flaticon.com/24/733/733585.png" alt="WhatsApp" width="24" height="24" style="vertical-align: middle;">
            </a>
            <a href="https://twitter.com/ambir513" style="margin: 0 8px;" target="_blank">
              <img src="https://cdn-icons-png.flaticon.com/24/733/733579.png" alt="Twitter" width="24" height="24" style="vertical-align: middle;">
            </a>
          </div>
          <p style="font-size: 12px; color: #888;">&copy; ${new Date().getFullYear()} DevTinder, All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
    `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Payment failure email send failed:", error);
        } else {
          console.log("Payment failure email sent:", info.response);
        }
      });
    }

    return res.status(200).json({ message: "Webhook received successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, paymentVerify, webhook };
