const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
  const { firstName, lastName, emailId, password } = req.body;
  const user = new User({
    firstName,
    lastName,
    emailId,
    password,
  });

  try {
    await user.save();
    res.send("User created Successfully");
  } catch (err) {
    res.status(400).send("Error while save in Database");
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
