const authToken = (req, res, next) => {
  const token = "XYZ";
  const isAuthenticate = token == "XYZ";
  console.log(isAuthenticate);
  if (!isAuthenticate) {
    res.status(401).send("Unauthorized Token");
  } else {
    next();
  }
};

module.exports = {
  authToken,
};
