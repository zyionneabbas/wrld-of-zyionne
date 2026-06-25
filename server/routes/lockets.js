const express = require('express')
const router = express.Router()
const Locket = require('../models/Locket')
const User = require('../models/User')
const auth = require('../middleware/auth')
const { upload } = require('../config/cloudinary')
const { getIO } = require('../socket')

// SEND a locket
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'A locket needs a photo or video moment' })
    }

    const { caption, visibility, customRecipients } = req.body

    const locket = new Locket({
      author: req.user.id,
      media: {
        url: req.file.path,
        type: req.file.mimetype.startsWith('video/') ? 'video' : 'image'
      },
      caption: caption || '',
      visibility: visibility || 'friends',
      customRecipients: customRecipients ? customRecipients.split(',') : []
    })

    await locket.save()
    await locket.populate('author', 'username displayName avatar verified')

    const author = await User.findById(req.user.id)
    let recipientIds = []

    if (locket.visibility === 'friends') {
      recipientIds = author.friends
        .filter(f => f.status === 'accepted')
        .map(f => f.user.toString())
    } else if (locket.visibility === 'close_friends') {
      recipientIds = author.closeFriends.map(id => id.toString())
    } else if (locket.visibility === 'custom') {
      recipientIds = locket.customRecipients.map(id => id.toString())
    }

    const io = getIO()
    recipientIds.forEach(recipientId => {
      io.to(recipientId).emit('newLocket', { locket })
    })

    res.status(201).json(locket)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET locket feed
router.get('/feed', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const friendIds = user.friends
      .filter(f => f.status === 'accepted')
      .map(f => f.user)

    const lockets = await Locket.find({
      author: { $in: friendIds },
      $or: [
        { visibility: 'friends' },
        { visibility: 'close_friends', author: { $in: user.closeFriends } },
        { visibility: 'custom', customRecipients: req.user.id }
      ]
    })
      .populate('author', 'username displayName avatar verified')
      .sort({ createdAt: -1 })
      .limit(50)

    res.json(lockets)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// REACT to a locket
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { emoji } = req.body
    const locket = await Locket.findById(req.params.id)
    if (!locket) return res.status(404).json({ error: 'Locket not found' })

    locket.reactions = locket.reactions.filter(
      r => r.user.toString() !== req.user.id
    )
    locket.reactions.push({ user: req.user.id, emoji })
    await locket.save()

    const io = getIO()
    io.to(locket.author.toString()).emit('locketReaction', {
      locketId: locket._id,
      emoji,
      from: req.user.id
    })

    res.json({ reactions: locket.reactions })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// VIEW a locket
router.patch('/:id/view', auth, async (req, res) => {
  try {
    const locket = await Locket.findById(req.params.id)
    if (!locket) return res.status(404).json({ error: 'Locket not found' })

    const alreadyViewed = locket.views.some(
      v => v.user.toString() === req.user.id
    )

    if (!alreadyViewed) {
      locket.views.push({ user: req.user.id })
      await locket.save()
    }

    res.json({ viewed: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE a locket
router.delete('/:id', auth, async (req, res) => {
  try {
    const locket = await Locket.findById(req.params.id)
    if (!locket) return res.status(404).json({ error: 'Locket not found' })

    if (locket.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    await locket.deleteOne()
    res.json({ message: 'Locket deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router