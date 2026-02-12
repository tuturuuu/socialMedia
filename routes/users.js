const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Users = require("../models/Users");
const Posts = require("../models/Posts");
const Messages = require("../models/Messages")
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const Room = require("../models/Rooms");

router.post("/register", async (req, res) => {
  const { username, email, password, age } = req.body;
  try {
    const existingUser = await Users.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Users({
      username,
      email,
      password: hashedPassword,
      age,
    });
    await newUser.save();
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// In read user
router.get("/profile", auth, async (req, res) => {
  const { id } = req.user;
  try {
    const user = await Users.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Read other user
router.get("/profile/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { id: userId } = req.user;
  try {
    const user = await Users.findById(id, "username email age gender birthday bio _id").lean();
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const theUser = await Users.findById(userId);
    if(theUser.friends.includes(id)){
      user.isFriend = true;
    }
    else{
      user.isFriend = false;
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


// Update user
router.put("/profile", auth, async (req, res) => {
  const { id } = req.user;
  const { username, age, gender, birthday, bio } = req.body;
  try {
    const user = await Users.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    user.username = username;
    user.age = age;
    user.gender = gender;
    user.birthday = birthday;
    user.bio = bio;
    await user.save();
    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/profile", auth, async (req, res) => {
  const { id } = req.user;
  try {
    const user = await Users.findById(id);

    // Delete all the messages
    await Messages.deleteMany({ senderId: id });

    // Delete all the posts
    await Posts.deleteMany({ userId: id});


    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    await user.deleteOne();
    return res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/suggestions/:limit", auth, async (req, res) => {
  const limit = parseInt(req.params.limit, 10);
  const { id } = req.user;
  try {
    const users = await Users.find({ _id: { $ne: id } }, "username gender id")
      .limit(limit)
      .lean();
    const theUser = await Users.findById(id);

    for (let i = 0; i < users.length; i++) {
      if (theUser.friends.includes(users[i]._id)) {
        users[i].isFriend = true;
      } else {
        users[i].isFriend = false;
      }
    }

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:search", auth, async (req, res) => {
  const search = req.params.search;
  const { id } = req.user;
  try {
    const users = await Users.find(
      {
        $or: [{ username: { $regex: new RegExp(search, "i") } }],
      },
      "username gender id"
    )
      .where("_id")
      .ne(id).lean();

    const theUser = await Users.findById(id);

    for (let i = 0; i < users.length; i++) {
      if (theUser.friends.includes(users[i]._id)) {
        users[i].isFriend = true;
      } else {
        users[i].isFriend = false;
      }
    }

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/follow/:friend_id", auth, async (req, res) => {
  const { friend_id } = req.params;
  const { id } = req.user;
  try {
    const user = await Users.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const friend = await Users.findById(friend_id);
    if (!friend) {
      return res.status(400).json({ message: "Friend not found" });
    }
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ message: "You are already friends" });
    }
    user.friends.push(friend._id);

    if (friend.friends.includes(id)) {
      const roomName = `${friend.username} & ${user.username}`;
      const room = await Room.create({
        name: roomName,
        users: [id, friend._id],
      });
      await room.save();

      user.rooms.push(room._id);
    }

    await user.save();
    return res.status(200).json({ message: "Friend added successfully"});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/unfollow/:friend_id", auth, async (req, res) => {
  const { friend_id } = req.params;
  const { id } = req.user;
  try {
    const user = await Users.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const friend = await Users.findById(friend_id);
    if (!friend) {
      return res.status(400).json({ message: "Friend not found" });
    }
    const friendIndex = user.friends.indexOf(friend._id);
    if (friendIndex === -1) {
      return res.status(400).json({ message: "You are not friends" });
    }
    user.friends.splice(friendIndex, 1);

    const room = await Room.findOneAndDelete({
      users: { $all: [id, friend._id] },
    });
    if (room) {
      const roomIndex = user.rooms.indexOf(room._id);
      if (roomIndex !== -1) {
        user.rooms.splice(roomIndex, 1);
      }
      await Messages.deleteMany({ roomId: room._id });
    }

    await user.save();
    return res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
