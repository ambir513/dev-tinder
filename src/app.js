const express = require("express");
const connectDB = require("./config/database.js");
const cookieParser = require("cookie-parser");
const {
  authRouter,
  profileRouter,
  requestRouter,
  userRouter,
} = require("./routes/index.js");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/profile", profileRouter);
app.use("/request", requestRouter);
app.use("/user", userRouter);

connectDB()
  .then(() => {
    console.log("Database connect to established");
    app.listen(7777, () => {
      console.log("Server is running on PORT 7777");
    });
  })
  .catch((err) => {
    console.log("Database could not be established");
  });
