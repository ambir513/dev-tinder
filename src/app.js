const express = require("express");
const { authToken } = require("./middlewares/auth");
const app = express();

app.use("/user", authToken);

app.get("/user/signup", (req, res) => {
  res.send("Successful Signup");
});
app.post("/user/dashboard", (req, res) => {
  res.send("Dashboard Open");
});

app.listen(7777, () => {
  console.log("Server is running on PORT 7777");
});
