const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const { validation } = require("./utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { userAuth } = require("./middlewares/auth");
const app = express();
app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
  const { firstName, lastName, emailId, password } = req.body;
  const isUserExist = await User.findOne({ emailId: emailId });

  try {
    validation(req, isUserExist);
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.send("User created Successfully");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.post("/login", async (req, res) => {
  const { emailId, password } = req.body;
  const isUserExist = await User.findOne({ emailId: emailId });
  try {
    validation(req, isUserExist);
    const isPaswordValid = await bcrypt.compare(password, isUserExist.password);
    if (!isPaswordValid) {
      throw new Error("Invalid Credentials");
    }
    const token = await jwt.sign({ _id: isUserExist._id }, "devTinder", {
      expiresIn: "1d",
    });
    res.cookie("token", token);
    res.send("successfully login");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.get("/profile", userAuth, (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});



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
