const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const {
  view,
  edit,
  password,
  post,
  userName,
} = require("../controllers/profileController.js");
const uploadMiddleware = require("../config/multer.js");
const upload = uploadMiddleware("avatar");

const profileRouter = express.Router();

profileRouter.get("/view", userAuth, view);
profileRouter.patch("/edit", userAuth, upload.single("avatar"), edit);
profileRouter.post("/post/upload", userAuth, upload.single("avatar"), post);
profileRouter.patch("/password/reset", password);
profileRouter.get("/:userName", userName);

module.exports = profileRouter;
