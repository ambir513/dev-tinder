const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const { view, edit, password } = require("../controllers/profileController.js");

const profileRouter = express.Router();

profileRouter.use(userAuth);
profileRouter.get("/view", view);
profileRouter.patch("/edit", edit);
profileRouter.patch("/password", password);

module.exports = profileRouter;
