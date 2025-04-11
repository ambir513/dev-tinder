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

app.get("/feed", async (req, res) => {
  try {
    const emailId = req.body;
    const userData = await User.findOne(emailId);
    res.send(userData);
  } catch (error) {
    res.status(500).send("Something went to wrong ");
  }
});

app.delete("/user", async (req, res) => {
  const userId = req.body;
  try {
    await User.findByIdAndDelete(userId);
    res.send("User deleted Successfully");
  } catch (error) {
    res.status(500).send("Something went to wrong ");
  }
});

app.patch("/user", async (req, res) => {
  const { _id, password } = req.body;
  try {
    console.log(_id, password);
    await User.findByIdAndUpdate(_id, { $set: { password } });
    res.send("User update successfully");
  } catch (error) {
    res.status(500).send("Something went to wrong ");
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
