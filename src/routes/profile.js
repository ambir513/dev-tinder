const express = require("express");
const { userAuth } = require("../middlewares/auth.js");
const {
  view,
  edit,
  verifyPassword,
  post,
  userName,
  verify,
  newPassword,
  oauth,
} = require("../controllers/profileController.js");
const uploadMiddleware = require("../config/multer.js");
const upload = uploadMiddleware("avatar");

const profileRouter = express.Router();

profileRouter.get("/view", userAuth, view);
profileRouter.post("/oauth", userAuth, oauth);
profileRouter.patch("/edit", userAuth, upload.single("avatar"), edit);
profileRouter.post("/post/upload", userAuth, upload.single("avatar"), post);
profileRouter.post("/password/verify", verify);
profileRouter.post("/verifyPassword", verifyPassword);
profileRouter.post("/newPassword", newPassword);
profileRouter.get("/:userName", userName);

module.exports = profileRouter;
