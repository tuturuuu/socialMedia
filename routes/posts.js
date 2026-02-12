const express = require("express");
const router = express.Router();
const Users = require("../models/Users");
const Posts = require("../models/Posts");
const auth = require("../middleware/auth");

router.get("/all", auth, async (req, res) => {
  const { id } = req.user;
  try {
    const user = await Users.findById(id).populate("friends", ["_id"]);
    const friendsIds = user.friends.map(friend => friend._id);
    friendsIds.push(id); // Include the user's own ID to fetch their posts as well
    const posts = await Posts.find({ userId: { $in: friendsIds } })
      .populate("userId", ["username", "gender"]);
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


router.post("/", auth, async (req, res) => {
  const { id } = req.user;
  const { content } = req.body;
  try {

    const user = await Users.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    console.log(id)

    const newPost = new Posts({ content, userId: id });
    await newPost.save();

    user.posts.push(newPost._id);
    await user.save();
    const populatedNewPost = await newPost.populate("userId", ["username", "gender"]);
    return res.status(200).json({ message: "Post created successfully", post: populatedNewPost });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/", auth, async (req, res) => {
  const { id } = req.user;
  const { content, post_id } = req.body;
  try {
    const post = await Posts.findById(post_id);
    if (!post) {
      return res.status(400).json({ message: "Post not found" });
    }
    if (!post.userId.equals(id)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    post.content = content;
    await post.save();
    return res.status(200).json({ message: "Post updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/", auth, async (req, res) => {
    const { id } = req.user;
    const { post_id } = req.body;
    try {
      const post = await Posts.findById(post_id);
      if (!post) {
        return res.status(400).json({ message: "Post not found" });
      }
      if (!post.userId.equals(id)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      await post.deleteOne();
      return res.status(200).json({ message: "Post delete successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }

});

module.exports = router;
