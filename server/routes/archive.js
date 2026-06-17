const express = require('express')
const router = express.Router()
const Archive = require('../models/Archive')
const Post = require('../models/Post')
const Conversation = require('../models/Conversation')
const auth = require('../middleware/auth')

// ARCHIVE an item
router.post('/', auth, async (req, res) => {
  try {
    const { itemType, itemId, note } = req.body

    // Check if already archived
    const existing = await Archive.findOne({
      owner: req.user.id,
      itemType,
      itemId
    })

    if (existing) {
      return res.status(400).json({ error: 'Item already archived' })
    }

    // If archiving a post, update its status
    if (itemType === 'post') {
      await Post.findByIdAndUpdate(itemId, {
        isArchived: true,
        status: 'archived'
      })
    }

    // If archiving a conversation, just store it
    // The conversation still exists but is hidden from main inbox
    const archive = new Archive({
      owner: req.user.id,
      itemType,
      itemId,
      note: note || ''
    })

    await archive.save()
    res.status(201).json({ message: `${itemType} archived successfully`, archive })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET all archived items
router.get('/', auth, async (req, res) => {
  try {
    const { type } = req.query

    const filter = { owner: req.user.id }
    if (type) filter.itemType = type

    const archives = await Archive.find(filter)
      .sort({ archivedAt: -1 })

    // Populate based on type
    const populated = await Promise.all(
      archives.map(async (archive) => {
        let item = null

        try {
          if (archive.itemType === 'post') {
            item = await Post.findById(archive.itemId)
              .populate('author', 'username displayName avatar verified')
          }
          if (archive.itemType === 'conversation') {
            item = await Conversation.findById(archive.itemId)
              .populate('participants', 'username displayName avatar verified')
          }
        } catch (e) {
          item = null
        }

        return {
          ...archive.toObject(),
          item
        }
      })
    )

    res.json(populated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// UNARCHIVE an item
router.delete('/:id', auth, async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id)

    if (!archive) {
      return res.status(404).json({ error: 'Archive not found' })
    }

    if (archive.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    // If unarchiving a post, restore it
    if (archive.itemType === 'post') {
      await Post.findByIdAndUpdate(archive.itemId, {
        isArchived: false,
        status: 'published'
      })
    }

    await archive.deleteOne()
    res.json({ message: 'Item unarchived successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET archived conversations (separate from main inbox)
router.get('/conversations', auth, async (req, res) => {
  try {
    const archivedConvos = await Archive.find({
      owner: req.user.id,
      itemType: 'conversation'
    })

    const conversationIds = archivedConvos.map(a => a.itemId)

    const conversations = await Conversation.find({
      _id: { $in: conversationIds }
    })
      .populate('participants', 'username displayName avatar verified')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 })

    res.json(conversations)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET archived posts
router.get('/posts', auth, async (req, res) => {
  try {
    const posts = await Post.find({
      author: req.user.id,
      isArchived: true
    })
      .populate('author', 'username displayName avatar verified')
      .sort({ createdAt: -1 })

    res.json(posts)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router