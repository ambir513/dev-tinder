const express = require("express");
const cors = require("cors");
const http = require("http");
const connectDB = require("./config/database.js");
const cookieParser = require("cookie-parser");
const {
  authRouter,
  profileRouter,
  requestRouter,
  userRouter,
  paymentRouter,
} = require("./routes/index.js");
const initializeSocket = require("./utils/socket.js");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://devtinder.web.app",
    credentials: true,
  })
);
require("./utils/cronjob.js");
app.use("/", authRouter);
app.use("/account", profileRouter);
app.use("/request", requestRouter);
app.use("/user", userRouter);
app.use("/payment", paymentRouter);

const PORT = process.env.PORT || 7777;
const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Database connect to established");
    server.listen(PORT, () => {
      console.log("Server is running on PORT " + PORT);
    });
  })
  .catch((err) => {
    console.log("Database could not be established");
  });
