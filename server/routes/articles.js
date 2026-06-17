const express = require('express')
const router = express.Router()
const Article = require('../models/Article')
const User = require('../models/User')
const auth = require('../middleware/auth')
const { upload } = require('../config/cloudinary')

// Calculate read time
const calculateReadTime = (content) => {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

// Generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    + '-' + Date.now()
}

// CREATE article
router.post('/', auth, upload.single('coverImage'), async (req, res) => {
  try {
    const {
      title,
      subtitle,
      content,
      tags,
      status,
      publishAt,
      series
    } = req.body

    const isScheduled = publishAt && new Date(publishAt) > new Date()
    const readTime = calculateReadTime(content)
    const slug = generateSlug(title)

    const article = new Article({
      author: req.user.id,
      title,
      subtitle: subtitle || '',
      content,
      coverImage: req.file ? req.file.path : '',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      status: isScheduled ? 'scheduled' : (status || 'draft'),
      publishAt: isScheduled ? new Date(publishAt) : null,
      readTime,
      slug,
      series: series || ''
    })

    await article.save()
    await article.populate('author', 'username displayName avatar verified')

    res.status(201).json(article)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUBLISH article
router.patch('/:id/publish', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
    if (!article) return res.status(404).json({ error: 'Article not found' })

    if (article.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    article.status = 'published'
    article.publishAt = null
    await article.save()

    res.json({ message: 'Article published', article })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET all published articles (feed)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 20
    const skip = (page - 1) * limit

    const articles = await Article.find({ status: 'published' })
      .populate('author', 'username displayName avatar verified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json(articles)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET articles from people you follow
router.get('/following', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const following = [...user.following, req.user.id]

    const articles = await Article.find({
      author: { $in: following },
      status: 'published'
    })
      .populate('author', 'username displayName avatar verified')
      .sort({ createdAt: -1 })
      .limit(20)

    res.json(articles)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET single article by slug
router.get('/:slug', auth, async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug })
      .populate('author', 'username displayName avatar verified')
      .populate('comments.author', 'username displayName avatar')

    if (!article) return res.status(404).json({ error: 'Article not found' })

    article.views += 1
    await article.save()

    res.json(article)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET your own articles (all statuses)
router.get('/me/all', auth, async (req, res) => {
  try {
    const articles = await Article.find({ author: req.user.id })
      .sort({ createdAt: -1 })

    res.json(articles)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// LIKE / UNLIKE article
router.patch('/:id/like', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
    if (!article) return res.status(404).json({ error: 'Article not found' })

    const alreadyLiked = article.likes.includes(req.user.id)

    if (alreadyLiked) {
      article.likes = article.likes.filter(
        id => id.toString() !== req.user.id
      )
    } else {
      article.likes.push(req.user.id)
    }

    await article.save()
    res.json({ likes: article.likes.length, liked: !alreadyLiked })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// COMMENT on article
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
    if (!article) return res.status(404).json({ error: 'Article not found' })

    article.comments.push({
      author: req.user.id,
      content: req.body.content
    })

    await article.save()
    await article.populate('comments.author', 'username displayName avatar')

    const newComment = article.comments[article.comments.length - 1]
    res.status(201).json(newComment)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// SUBSCRIBE to an author
router.patch('/:id/subscribe', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
    if (!article) return res.status(404).json({ error: 'Article not found' })

    const isSubscribed = article.subscribers.includes(req.user.id)

    if (isSubscribed) {
      article.subscribers = article.subscribers.filter(
        id => id.toString() !== req.user.id
      )
    } else {
      article.subscribers.push(req.user.id)
    }

    await article.save()
    res.json({
      subscribed: !isSubscribed,
      subscriberCount: article.subscribers.length
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE article
router.delete('/:id', auth, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
    if (!article) return res.status(404).json({ error: 'Article not found' })

    if (article.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    await article.deleteOne()
    res.json({ message: 'Article deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router