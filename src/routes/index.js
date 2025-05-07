const authRouter = require("./auth.js");
const paymentRouter = require("./payment.js");
const profileRouter = require("./profile.js");
const requestRouter = require("./request.js");
const userRouter = require("./user.js");
module.exports = {
  authRouter,
  profileRouter,
  requestRouter,
  userRouter,
  paymentRouter,
};
