const Socket = require("socket.io");
const crypto = require("crypto");

const getHashAuth = (userId, _id) => {
  return crypto
    .createHash("sha256")
    .update([userId, _id].sort().join("_"))
    .digest("hex");
};
const initializeSocket = (server) => {
  const io = Socket(server, {
    cors: {
      origin: "https://dev-tinder-ggrn.onrender.com",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, _id }) => {
      const roomId = getHashAuth(userId, _id);
      console.log(firstName + " joined Room " + roomId);
      socket.join(roomId);
    });
    socket.on("sendMessage", ({ firstName, userId, _id, text }) => {
      const roomId = getHashAuth(userId, _id);
      io.to(roomId).emit("messageRecieved", { firstName, text });
    });
    socket.on("disconnect", ({ firstName, userId, _id }) => {
      const roomId = getHashAuth(userId, _id);
      socket.leave(roomId);
    });
  });
};

module.exports = initializeSocket;
