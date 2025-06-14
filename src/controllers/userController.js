const ConnectionRequest = require("../models/connectionRequest.js");
const User = require("../models/user.js");

const USER_FIELDS =
  "firstName lastName photoUrl age description skills emailId userName isPremium membershipType";

const getAllRequest = async (req, res) => {
  try {
    const user = req.user;
    const connectionRequest = await ConnectionRequest.find({
      toUserId: user._id,
      status: "interested",
    }).populate("fromUserId", USER_FIELDS);
    if (!connectionRequest) {
      return res
        .status(400)
        .json({ message: "No Connection request as been found" });
    }
    const data = connectionRequest.map((user) => user.fromUserId);
    res.json({
      message: "Successfully fetched Connection request",
      data: data,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getAllConnection = async (req, res) => {
  try {
    const user = req.user;
    const getConnection = await ConnectionRequest.find({
      $or: [
        { fromUserId: user._id, status: "accepted" },
        { toUserId: user._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_FIELDS)
      .populate("toUserId", USER_FIELDS);

    const data = getConnection.map((row) => {
      if (row.fromUserId._id.toString() === user._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.json({ message: "Connection Request Successfully", data: data });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getFeed = async (req, res) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequest = await ConnectionRequest.find({
      $or: [{ fromUserId: user._id }, { toUserId: user._id }],
    }).select("fromUserId toUserId");

    const hideUserId = new Set();
    const data = connectionRequest.map((users) => {
      hideUserId.add(users.fromUserId.toString());
      hideUserId.add(users.toUserId.toString());
    });
    const getFeed = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserId) } },
        { _id: { $ne: user._id } },
      ],
    })
      .select(USER_FIELDS)
      .skip(skip)
      .limit(limit);

    res.send(getFeed);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = { getAllRequest, getAllConnection, getFeed };
