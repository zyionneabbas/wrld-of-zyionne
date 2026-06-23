const express = require('express')
const router = express.Router()
const MiniPost = require('../../models/MiniWRLD/MiniPost')
const MiniUser = require('../../models/MiniWRLD/MiniUser')
const miniAuth = require('../../middleware/miniAuth')
const { upload } = require('../../config/cloudinary')

// Age appropriate content filter
const miniBlockedWords = [
  'sex', 'porn', 'nude', 'naked', 'drugs',
  'alcohol', 'kill', 'suicide', 'self harm',
  'hate', 'racist', 'terrorist'
]

const filterMiniContent = (text) => {
  if (!text) return { clean: true }
  const lower = text.toLowerCase()
  const flagged = miniBlockedWords.filter(word => lower.includes(word))
  return { clean: flagged.length === 0, flagged }
}

// CREATE post
router.post('/posts', miniAuth, upload.array('media', 10), async (req, res) => {
  try {
    const { content, postType, publishAt } = req.body
    const miniUser = await MiniUser.findById(req.miniUser.id)

    // Check content access
    if (postType === 'reel' && !miniUser.contentAccess.canPostVideos) {
      return res.status(403).json({
        error: 'Video posting unlocks as you grow on WRLD Mini'
      })
    }

    // Filter content
    const filter = filterMiniContent(content)
    if (!filter.clean) {
      return res.status(400).json({
        error: 'Your post contains content that is not allowed on WRLD Mini'
      })
    }

    const hashtags = content
      ? [...content.matchAll(/#(\w+)/g)].map(m => m[1].toLowerCase())
      : []

    const isScheduled = publishAt && new Date(publishAt) > new Date()

    const media = req.files?.map(file => ({
      url: file.path,
      type: file.mimetype.startsWith('video/') ? 'video' : 'image'
    })) || []

    const post = new MiniPost({
      author: req.miniUser.id,
      content,
      media,
      postType: postType || 'post',
      hashtags,
      status: isScheduled ? 'scheduled' : 'published',
      publishAt: isScheduled ? new Date(publishAt) : null
    })

    await post.save()
    await post.populate('author', 'username displayName avatar verified')

    res.status(201).json(post)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET feed
router.get('/feed', miniAuth, async (req, res) => {
  try {
    const miniUser = await MiniUser.findById(req.miniUser.id)
    const following = [...miniUser.following, req.miniUser.id]

    const page = parseInt(req.query.page) || 1
    const limit = 10
    const skip = (page - 1) * limit

    const posts = await MiniPost.find({
      author: { $in: following },
      status: 'published',
      isArchived: false,
      moderationStatus: 'approved'
    })
      .populate('author', 'username displayName avatar verified ageBracket')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json(posts)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET explore
router.get('/explore', miniAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 20
    const skip = (page - 1) * limit

    const posts = await MiniPost.find({
      status: 'published',
      isArchived: false,
      moderationStatus: 'approved'
    })
      .populate('author', 'username displayName avatar verified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json(posts)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// LIKE post
router.patch('/posts/:id/like', miniAuth, async (req, res) => {
  try {
    const post = await MiniPost.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post not found' })

    const alreadyLiked = post.likes.includes(req.miniUser.id)

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        id => id.toString() !== req.miniUser.id
      )
    } else {
      post.likes.push(req.miniUser.id)
    }

    await post.save()
    res.json({ likes: post.likes.length, liked: !alreadyLiked })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// COMMENT on post
router.post('/posts/:id/comment', miniAuth, async (req, res) => {
  try {
    const post = await MiniPost.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post not found' })

    const filter = filterMiniContent(req.body.content)
    if (!filter.clean) {
      return res.status(400).json({
        error: 'Your comment contains content that is not allowed'
      })
    }

    post.comments.push({
      author: req.miniUser.id,
      content: req.body.content
    })

    await post.save()
    await post.populate('comments.author', 'username displayName avatar')

    const newComment = post.comments[post.comments.length - 1]
    res.status(201).json(newComment)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// FOLLOW / UNFOLLOW
router.patch('/users/:id/follow', miniAuth, async (req, res) => {
  try {
    if (req.params.id === req.miniUser.id) {
      return res.status(400).json({ error: 'You cannot follow yourself' })
    }

    const userToFollow = await MiniUser.findById(req.params.id)
    const currentUser = await MiniUser.findById(req.miniUser.id)

    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' })
    }

    const isFollowing = currentUser.following.includes(req.params.id)

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== req.params.id
      )
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== req.miniUser.id
      )
    } else {
      currentUser.following.push(req.params.id)
      userToFollow.followers.push(req.miniUser.id)
    }

    await currentUser.save()
    await userToFollow.save()

    res.json({
      following: !isFollowing,
      followersCount: userToFollow.followers.length
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET mini user profile
router.get('/users/:username', miniAuth, async (req, res) => {
  try {
    const user = await MiniUser.findOne({ username: req.params.username })
      .select('-password')
      .populate('followers', 'username displayName avatar')
      .populate('following', 'username displayName avatar')

    if (!user) return res.status(404).json({ error: 'User not found' })

    const posts = await MiniPost.find({
      author: user._id,
      status: 'published',
      isArchived: false
    })
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 })

    res.json({ user, posts })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router