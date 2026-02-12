const { Server } = require("socket.io");
const Messages = require("./models/Messages");
const Room = require("./models/Rooms");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

module.exports = (server) => {
  const io = new Server(server, {
    connectionStateRecovery: false,
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.user = decoded
      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }

  });

  io.on("connection", async (socket) => {

    socket.on("join room", async () => {
      const rooms = await Room.find({ users: socket.user.id });
      rooms.forEach((room) => {
        socket.join(room.id);
      });
    });

    socket.on("chat message", async (msg, id, roomId) => {
      try {
        const message = new Messages({ content: msg, senderId: id, roomId });
        await message.save();

        const room = await Room.findById(roomId);
        if (!room) {
          console.log("Room not found");
          return;
        }

        room.messages.push(message._id);
        await room.save();

        const result = await message.populate("senderId", ["username", "gender"]);
        io.to(roomId).emit("chat message", result, roomId);
        io.to(roomId).emit("notification", result);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("read room", async (roomId) => {
      socket.join(roomId);

      try {
        const messages = await Messages.find({ roomId }).populate("senderId", ["username", "gender"]);
        socket.emit("chat init", messages);
      } catch (error) {
        console.log(error);
      }
    });

    // Calling events

    socket.on("start call", async (callId, roomId) => {
      socket.to(roomId).except(socket.id).emit("start call", callId, roomId);
    });

    socket.on("decline call", (roomId) => {
      socket.to(roomId).emit("decline call");
    })

    socket.on("join-call", async (callId, roomId, userId) => {
      socket.join(callId);

      try{
        if (!mongoose.Types.ObjectId.isValid(roomId)) {
          socket.emit("Invalid", "Room invalid");

          return
        }

        const room = await Room.findOne({ _id: roomId, users: socket.user.id });

        if (!room) {
          socket.emit("Invalid", "You are not in that room");

          return;
        }
      } catch (error) {
        console.log(error);
      }

      socket.to(callId).emit("user-connected", userId);

      socket.on("leave call", () => {
        socket.leave(callId);
        socket.to(callId).emit("user-disconnected", userId);
      });
    });




  });

  return io;
};

