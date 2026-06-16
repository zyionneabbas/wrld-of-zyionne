const express = require('express')
const router = express.Router()
const Notification = require('../models/Notification')
const auth = require('../middleware/auth')

// GET all notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'username displayName avatar verified')
      .populate('post', 'content media')
      .sort({ createdAt: -1 })
      .limit(50)

    res.json(notifications)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// MARK all as read
router.patch('/read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET unread count
router.get('/unread', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    })
    res.json({ count })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router