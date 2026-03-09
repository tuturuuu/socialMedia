const express = require("express");
const Room = require("../models/Rooms");
const Messages = require("../models/Messages");
const Users = require("../models/Users");
const router = express.Router();
const auth = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");

router.get("/", auth, async (req, res) => {
  const { id } = req.user;

  try {
    const rooms = await Room.find({ users: id }).lean();

    const roomsWithLastMessage = await Promise.all(
      rooms.map(async (room) => {
        const lastMessage = await Messages.findOne({ roomId: room._id })
          .sort({ createdAt: -1 })
          .populate("senderId", ["username", "gender", "profileImage"])
          .lean();

        const otherUserId = room.users.find((userId) => String(userId) !== String(id));
        let otherUser = null;

        if (otherUserId) {
          otherUser = await Users.findById(otherUserId, "username gender profileImage").lean();
        }

        return {
          ...room,
          lastMessage: lastMessage || null,
          otherUser,
        };
      })
    );

    res.status(200).json(roomsWithLastMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rooms." });
    console.error(error);
  }
});

router.post("/call", auth, async (req, res) => {
  const { id } = req.user;

  //TODOS
  //Create a room metadata in the future

  res.status(200).json({ roomId: uuidv4() });
});

module.exports = router;
