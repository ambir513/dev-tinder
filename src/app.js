const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");

const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
  const user = new User(req.body);
  try {
    const isExist = await User.findOne({ emailId: req.body?.emailId });
    if (isExist) {
      throw new Error("Email is already register to this " + req.body?.emailId);
    }
    await user.save();
    res.send("User created Successfully");
  } catch (err) {
    res.status(400).send(err.message);
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

app.patch("/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  const data = req.body;
  try {
    const ALLOWED_UPDATES = [
      "age",
      "gender",
      "description",
      "photoUrl",
      "skills",
    ];
    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }
    if (data?.skills.length > 10) {
      throw new Error("skills cannot be more than 10");
    }
    await User.findByIdAndUpdate(userId, data, {
      returnDocument: "after",
      runValidators: true,
    });
    res.send("User update successfully");
  } catch (error) {
    res.status(500).send("UPDATE ERROR: " + error.message);
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
