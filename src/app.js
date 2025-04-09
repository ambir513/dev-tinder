const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Hii this is Home page");
});

app.get("/test", (req, res) => {
  res.send("This is for testing!");
});

app.listen(7777, () => {
  console.log("Server is running on PORT 7777");
});
