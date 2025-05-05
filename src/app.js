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
} = require("./routes/index.js");
const initializeSocket = require("./utils/socket.js");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/", authRouter);
app.use("/account", profileRouter);
app.use("/request", requestRouter);
app.use("/user", userRouter);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Database connect to established");
    server.listen(PORT, () => {
      console.log("Server is running on PORT 7777");
    });
  })
  .catch((err) => {
    console.log("Database could not be established");
  });
