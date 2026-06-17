const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Post = require('../models/Post')
const User = require('../models/User')

// Blocked words list — expandable
const blockedWords = [
  'nigger', 'faggot', 'retard', 'tranny', 'kike',
  'chink', 'spic', 'wetback', 'cunt', 'whore'
]

// Content filter function
const filterContent = (text) => {
  if (!text) return { clean: true, flagged: [] }

  const flagged = []
  const lower = text.toLowerCase()

  blockedWords.forEach(word => {
    if (lower.includes(word)) {
      flagged.push(word)
    }
  })

  return {
    clean: flagged.length === 0,
    flagged
  }
}

// CHECK content before posting
router.post('/check', auth, async (req, res) => {
  try {
    const { content } = req.body
    const result = filterContent(content)

    if (!result.clean) {
      return res.status(400).json({
        allowed: false,
        reason: 'Content contains harmful language',
        flagged: result.flagged
      })
    }

    res.json({ allowed: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// REPORT a post
router.post('/report/post/:id', auth, async (req, res) => {
  try {
    const { reason } = req.body
    const post = await Post.findById(req.params.id)

    if (!post) return res.status(404).json({ error: 'Post not found' })

    // For now store report reason in post
    // Later this feeds into a moderation queue
    if (!post.reports) post.reports = []
    post.reports.push({
      reportedBy: req.user.id,
      reason,
      createdAt: new Date()
    })

    await post.save()
    res.json({ message: 'Report submitted. Our team will review it.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// REPORT a user
router.post('/report/user/:id', auth, async (req, res) => {
  try {
    const { reason } = req.body
    const user = await User.findById(req.params.id)

    if (!user) return res.status(404).json({ error: 'User not found' })

    if (!user.reports) user.reports = []
    user.reports.push({
      reportedBy: req.user.id,
      reason,
      createdAt: new Date()
    })

    await user.save()
    res.json({ message: 'Report submitted. Our team will review it.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router