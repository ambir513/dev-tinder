const ConnectionRequest = require("../models/connectionRequest.js");
const User = require("../models/user.js");

const requestStatus = async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    const allowedStatus = ["interested", "ignore"];
    const isAllowedStatus = allowedStatus.includes(status);

    if (!isAllowedStatus) {
      return res.status(400).json({
        message: "Invalid status type" + status,
      });
    } else if (toUserId.length != 24) {
      return res.status(400).json({
        message: "Invalid User Id",
      });
    }
    const isUserExist = await User.findById(toUserId);
    if (!isUserExist) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isConnectionExist = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (isConnectionExist) {
      return res.status(400).json({
        message: "Connection request already exists!",
      });
    }
    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });
    const data = await connectionRequest.save();
    res.json({
      message:
        req.user.firstName + " is " + status + " in " + isUserExist.firstName,
      data,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const reviewStatus = async (req, res) => {
  try {
    const user = req.user;
    const { status, requestId } = req.params;

    // check the params
    // check the requestId in DB

    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status) || requestId.length != 24) {
      return res.status(400).json({
        message: "Invalid request",
      });
    }
    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: user._id,
      status: "interested",
    });
    if (!connectionRequest) {
      return res.status(400).json({ message: "Connection request not found" });
    }
    connectionRequest.status = status;
    const data = await connectionRequest.save();
    res.json({
      message: "Connection request " + status,
      data,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = {
  requestStatus,
  reviewStatus,
};
