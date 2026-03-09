const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const Users = require('../models/Users')
const Posts = require('../models/Posts')
const auth = require('../middleware/auth')

const postPopulate = [
  { path: 'userId', select: ['username', 'gender', 'profileImage'] },
  { path: 'comments.userId', select: ['username', 'gender', 'profileImage'] },
]

router.get('/all', auth, async (req, res) => {
  const { id } = req.user
  try {
    const user = await Users.findById(id).populate('friends', ['_id'])
    const friendsIds = user.friends.map((friend) => friend._id)
    friendsIds.push(id)

    const posts = await Posts.find({ userId: { $in: friendsIds } })
      .populate(postPopulate)
      .sort({ createdAt: -1 })

    return res.status(200).json(posts)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.post('/', auth, async (req, res) => {
  const { id } = req.user
  const { content } = req.body
  try {
    const user = await Users.findById(id)
    if (!user) {
      return res.status(400).json({ message: 'User not found' })
    }

    const newPost = new Posts({ content, userId: id })
    await newPost.save()

    user.posts.push(newPost._id)
    await user.save()

    const populatedNewPost = await Posts.findById(newPost._id).populate(postPopulate)

    return res.status(200).json({ message: 'Post created successfully', post: populatedNewPost })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.put('/', auth, async (req, res) => {
  const { id } = req.user
  const { content, post_id } = req.body
  try {
    const post = await Posts.findById(post_id)
    if (!post) {
      return res.status(400).json({ message: 'Post not found' })
    }
    if (!post.userId.equals(id)) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    post.content = content
    post.updatedAt = new Date()
    await post.save()

    return res.status(200).json({ message: 'Post updated successfully' })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.delete('/', auth, async (req, res) => {
  const { id } = req.user
  const { post_id } = req.body
  try {
    const post = await Posts.findById(post_id)
    if (!post) {
      return res.status(400).json({ message: 'Post not found' })
    }
    if (!post.userId.equals(id)) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await post.deleteOne()
    return res.status(200).json({ message: 'Post delete successfully' })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.put('/:postId/like', auth, async (req, res) => {
  const { id } = req.user
  const { postId } = req.params

  try {
    const post = await Posts.findById(postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const userObjectId = new mongoose.Types.ObjectId(id)
    const hasLiked = post.likes.some((likeId) => likeId.equals(userObjectId))

    if (hasLiked) {
      post.likes = post.likes.filter((likeId) => !likeId.equals(userObjectId))
    } else {
      post.likes.push(userObjectId)
    }

    await post.save()
    const populatedPost = await Posts.findById(postId).populate(postPopulate)

    return res.status(200).json({
      message: hasLiked ? 'Post unliked successfully' : 'Post liked successfully',
      post: populatedPost,
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.post('/:postId/comment', auth, async (req, res) => {
  const { id } = req.user
  const { postId } = req.params
  const { content } = req.body

  try {
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' })
    }

    const post = await Posts.findById(postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    post.comments.push({ userId: id, content: content.trim() })
    post.updatedAt = new Date()
    await post.save()

    const populatedPost = await Posts.findById(postId).populate(postPopulate)

    return res.status(200).json({ message: 'Comment added successfully', post: populatedPost })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

router.delete('/:postId/comment/:commentId', auth, async (req, res) => {
  const { id } = req.user
  const { postId, commentId } = req.params

  try {
    const post = await Posts.findById(postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const comment = post.comments.id(commentId)
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    const canDelete = comment.userId.equals(id) || post.userId.equals(id)
    if (!canDelete) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    post.comments.pull(commentId)
    post.updatedAt = new Date()
    await post.save()

    const populatedPost = await Posts.findById(postId).populate(postPopulate)

    return res.status(200).json({ message: 'Comment deleted successfully', post: populatedPost })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
})

module.exports = router
