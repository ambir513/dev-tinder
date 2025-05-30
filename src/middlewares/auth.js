const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please login now");
    }
    const decodedObj = await jwt.verify(token, "devTinder");
    const user = await User.findById(decodedObj._id)
      .populate("postId", "photoUrl caption")
      .select("-password");
    if (!user) {
      throw new Error("User is not found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const isUserLoginOrNot = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (token) {
      const decodedObj = await jwt.verify(token, "devTinder");
      const userId = await User.findById(decodedObj._id);
      if (userId) {
        throw new Error("Your are already login");
      }
      res.cookie("token", null, {
        expires: new Date(Date.now()),
      });
    }
    next();
  } catch (error) {
    res.status(400).send(error.message);
  }
};
module.exports = {
  userAuth,
  isUserLoginOrNot,
};
