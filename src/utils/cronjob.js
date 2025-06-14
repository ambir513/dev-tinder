// require("dotenv").config();
// const cron = require("node-cron");
// const nodemailer = require("nodemailer");
// console.log("Cron job script started...");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS, // app password
//   },
// });

// const mailOptions = {
//   from: process.env.EMAIL_USER,
//   to: "ambir0513@gmail.com",
//   subject: "Cron Test Email",
//   text: "This is a test email from Nodemailer and node-cron.",
// };

// cron.schedule(
//   "*/10 * * * * *",
//   () => {
//     console.log("Cron job running at");

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error("Email send failed:", error);
//       } else {
//         console.log("Email sent:", info.response);
//       }
//     });
//   },
//   {
//     scheduled: true,
//     timezone: "Asia/Kolkata",
//   }
// );
