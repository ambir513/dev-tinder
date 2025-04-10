const express = require("express");
const { authToken } = require("./middlewares/auth");
const app = express();

app.get("/user", (req, res) => {
  try {
    res.send("User");
  } catch (err) {
    res.status(500).send("Something went to wrong");
  }
});
app.use("/", (err, req, res, next) => {
  if (err) {
    res.status(500).send("Something went to wrong");
  }
});

app.listen(7777, () => {
  console.log("Server is running on PORT 7777");
});
