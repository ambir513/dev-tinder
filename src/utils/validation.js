const validator = require("validator");

const validation = (req, isUserExist) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (req.url === "/signup") {
    if (!firstName) {
      throw new Error("please enter your Name");
    } else if (!lastName) {
      throw new Error("please enter your LastName");
    } else if (!emailId) {
      throw new Error("please enter your Email");
    } else if (!password) {
      throw new Error("please enter your password");
    } else if (!validator.isEmail(req.body.emailId)) {
      throw new Error("please enter your correct email ID ");
    } else if (isUserExist) {
      throw new Error("Email is already register to this " + emailId);
    }
  } else if (req.url === "/login") {
    if (!validator.isEmail(req.body.emailId)) {
      throw new Error("please enter your correct email ID ");
    }
    if (!isUserExist) {
      throw new Error("Invalid Credentials");
    }
  }
};

module.exports = { validation };
