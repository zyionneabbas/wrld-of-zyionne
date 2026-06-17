const express = require('express')
const router = express.Router()
const Forum = require('../models/Forum')
const ForumPost = require('../models/ForumPost')
const auth = require('../middleware/auth')
const { upload } = require('../config/cloudinary')

// CREATE forum
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, isPrivate, rules, tags } = req.body

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const existing = await Forum.findOne({ slug })
    if (existing) {
      return res.status(400).json({ error: 'Forum name already taken' })
    }

    const forum = new Forum({
      name,
      slug,
      description,
      creator: req.user.id,
      moderators: [req.user.id],
      members: [req.user.id],
      isPrivate: isPrivate || false,
      rules: rules || [],
      tags: tags || []
    })

    await forum.save()
    await forum.populate('creator', 'username displayName avatar verified')

    res.status(201).json(forum)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET all forums
router.get('/', auth, async (req, res) => {
  try {
    const forums = await Forum.find({ isPrivate: false })
      .populate('creator', 'username displayName avatar verified')
      .sort({ postCount: -1 })
      .limit(20)

    res.json(forums)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET single forum
router.get('/:slug', auth, async (req, res) => {
  try {
    const forum = await Forum.findOne({ slug: req.params.slug })
      .populate('creator', 'username displayName avatar verified')
      .populate('moderators', 'username displayName avatar verified')

    if (!forum) return res.status(404).json({ error: 'Forum not found' })

    res.json(forum)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// JOIN forum
router.patch('/:id/join', auth, async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id)
    if (!forum) return res.status(404).json({ error: 'Forum not found' })

    const isMember = forum.members.includes(req.user.id)

    if (isMember) {
      forum.members = forum.members.filter(
        m => m.toString() !== req.user.id
      )
    } else {
      forum.members.push(req.user.id)
    }

    await forum.save()
    res.json({
      joined: !isMember,
      memberCount: forum.members.length
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// CREATE forum post
router.post('/:id/posts', auth, upload.array('media', 5), async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id)
    if (!forum) return res.status(404).json({ error: 'Forum not found' })

    const media = req.files?.map(file => ({
      url: file.path,
      type: file.mimetype.startsWith('video/') ? 'video' : 'image'
    })) || []

    const forumPost = new ForumPost({
      forum: req.params.id,
      author: req.user.id,
      title: req.body.title,
      content: req.body.content,
      media,
      flair: req.body.flair || ''
    })

    await forumPost.save()
    await forumPost.populate('author', 'username displayName avatar verified')

    forum.postCount += 1
    await forum.save()

    res.status(201).json(forumPost)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET forum posts
router.get('/:id/posts', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 20
    const skip = (page - 1) * limit
    const sort = req.query.sort || 'new'

    const sortOptions = {
      new: { createdAt: -1 },
      top: { upvotes: -1 },
      hot: { views: -1 }
    }

    const posts = await ForumPost.find({ forum: req.params.id })
      .populate('author', 'username displayName avatar verified')
      .sort(sortOptions[sort] || sortOptions.new)
      .skip(skip)
      .limit(limit)

    res.json(posts)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// UPVOTE / DOWNVOTE forum post
router.patch('/:postId/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body
    const post = await ForumPost.findById(req.params.postId)
    if (!post) return res.status(404).json({ error: 'Post not found' })

    if (voteType === 'up') {
      const hasUpvoted = post.upvotes.includes(req.user.id)
      const hasDownvoted = post.downvotes.includes(req.user.id)

      if (hasUpvoted) {
        post.upvotes = post.upvotes.filter(id => id.toString() !== req.user.id)
      } else {
        post.upvotes.push(req.user.id)
        if (hasDownvoted) {
          post.downvotes = post.downvotes.filter(id => id.toString() !== req.user.id)
        }
      }
    }

    if (voteType === 'down') {
      const hasDownvoted = post.downvotes.includes(req.user.id)
      const hasUpvoted = post.upvotes.includes(req.user.id)

      if (hasDownvoted) {
        post.downvotes = post.downvotes.filter(id => id.toString() !== req.user.id)
      } else {
        post.downvotes.push(req.user.id)
        if (hasUpvoted) {
          post.upvotes = post.upvotes.filter(id => id.toString() !== req.user.id)
        }
      }
    }

    await post.save()
    res.json({
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
      score: post.upvotes.length - post.downvotes.length
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ADD comment to forum post
router.post('/:postId/comment', auth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId)
    if (!post) return res.status(404).json({ error: 'Post not found' })

    post.comments.push({
      author: req.user.id,
      content: req.body.content
    })

    await post.save()
    await post.populate('comments.author', 'username displayName avatar verified')

    const newComment = post.comments[post.comments.length - 1]
    res.status(201).json(newComment)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router