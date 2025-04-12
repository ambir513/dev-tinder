const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("invalid cookies");
    }
    const decodedObj = await jwt.verify(token, "devTinder");
    const user = await User.findById(decodedObj._id);
    if (!user) {
      throw new Error("User is not found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = {
  userAuth,
};
