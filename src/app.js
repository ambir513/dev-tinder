const express = require("express");

const app = express();
app.use(express.json());
let data = [];

app.get("/user/:userId", (req, res) => {
  const { userId } = req.params;
  const user = data.filter((user) => user.id == userId);

  if (user.length === 0) {
    return res.send("User is Not Found");
  }
  return res.send(user[0]);
});

app.post("/user", (req, res) => {
  const { id, email, password } = req.body;
  data.push({ id, email, password });

  res.send("User Successfully Created");
});

app.delete("/user/:userId", (req, res) => {
  const { userId } = req.params;
  const user = data.filter((user) => user.id == userId);
  if (user.length === 0) {
    return res.send("User is Not found");
  }
  data = data.filter((user) => user.id != userId);
  res.send(`${userId} User is Successfully Deleted`);
});

app.patch("/user/:userId", (req, res) => {
  const { userId } = req.params;
  const user = data.filter((user) => user.id == userId);
  if (user.length === 0) {
    return res.send("User is Not found");
  }
  const newUser = user.filter((user) => {
    if (req.body.email) {
      return (user.email = req.body.email);
    } else if (req.body.password) {
      return (user.password = req.body.password);
    } else {
      return (user.email = req.body.email), (user.password = req.body.password);
    }
  });
  data = data.filter((user) => user.id != userId);
  data.push(newUser[0]);
  res.send("Successfully change");
});

app.put("/user/:userId", (req, res) => {
  const { userId } = req.params;
  const user = data.filter((user) => user.id == userId);
  if (user.length === 0) {
    return res.send("User is Not found");
  }
  const newUser = user.filter((user) => {
    if (req.body.id && req.body.email && req.body.password) {
      return (
        (user.id = req.body.id),
        (user.email = req.body.email),
        (user.password = req.body.password)
      );
    } else {
      return res.send("All fields are Mandatory");
    }
  });
  data = data.filter((user) => user.id != userId);
  data.push(newUser[0]);
  res.send("Successfully change");
});

app.listen(7777, () => {
  console.log("Server is running on PORT 7777");
});
