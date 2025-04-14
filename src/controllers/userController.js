const ConnectionRequest = require("../models/connectionRequest.js");

const getAllRequest = async (req, res) => {
  try {
    const user = req.user;
    const connectionRequest = await ConnectionRequest.find({
      toUserId: user._id,
      status: "interested",
    }).populate(
      "fromUserId",
      "firstName lastName photoUrl age description skills"
    );
    if (!connectionRequest) {
      return res
        .status(400)
        .json({ message: "No Connection request as been found" });
    }
    const data = connectionRequest;
    res.json({
      message: "Successfully fetched Connection request",
      data: data,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};
module.exports = { getAllRequest };
