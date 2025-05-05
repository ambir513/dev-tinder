const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userPostSchema = new Schema(
  {
    photoUrl: {
      type: String,
    },
    caption: {
      type: String,
    },
  },
  { timestamps: true }
);

const Post = model("Post", userPostSchema);
module.exports = Post;
