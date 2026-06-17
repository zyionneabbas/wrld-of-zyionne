const express = require('express')
const router = express.Router()
const Community = require('../models/Community')
const auth = require('../middleware/auth')

const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// CREATE community
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const existing = await Community.findOne({ slug })
    if (existing) {
      return res.status(400).json({ error: 'Community name already taken' })
    }

    const inviteCode = generateInviteCode()

    const community = new Community({
      name,
      slug,
      description,
      owner: req.user.id,
      isPublic: isPublic !== undefined ? isPublic : true,
      inviteCode,
      members: [{
        user: req.user.id,
        roles: ['owner'],
        joinedAt: new Date()
      }],
      memberCount: 1,
      channels: [
        { name: 'general', type: 'text', description: 'General discussion' },
        { name: 'announcements', type: 'announcement', description: 'Community announcements' }
      ],
      roles: [
        { name: 'owner', color: '#FFD700', permissions: ['manage_channels', 'manage_members', 'manage_roles', 'ban_members', 'kick_members', 'pin_messages', 'send_messages', 'read_messages'] },
        { name: 'moderator', color: '#7A9E7E', permissions: ['ban_members', 'kick_members', 'pin_messages', 'send_messages', 'read_messages'] },
        { name: 'member', color: '#8A9E8D', permissions: ['send_messages', 'read_messages'] }
      ]
    })

    await community.save()
    res.status(201).json(community)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET all public communities
router.get('/', auth, async (req, res) => {
  try {
    const communities = await Community.find({ isPublic: true })
      .sort({ memberCount: -1 })
      .limit(20)

    res.json(communities)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET single community
router.get('/:slug', auth, async (req, res) => {
  try {
    const community = await Community.findOne({ slug: req.params.slug })
      .populate('members.user', 'username displayName avatar verified')
      .populate('owner', 'username displayName avatar verified')

    if (!community) {
      return res.status(404).json({ error: 'Community not found' })
    }

    res.json(community)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// JOIN via invite code
router.post('/join/:inviteCode', auth, async (req, res) => {
  try {
    const community = await Community.findOne({
      inviteCode: req.params.inviteCode
    })

    if (!community) {
      return res.status(404).json({ error: 'Invalid invite code' })
    }

    const isMember = community.members.some(
      m => m.user.toString() === req.user.id
    )

    if (isMember) {
      return res.status(400).json({ error: 'Already a member' })
    }

    community.members.push({
      user: req.user.id,
      roles: ['member'],
      joinedAt: new Date()
    })

    community.memberCount += 1
    await community.save()

    res.json({ message: 'Joined community', community })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ADD channel
router.post('/:id/channels', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
    if (!community) {
      return res.status(404).json({ error: 'Community not found' })
    }

    if (community.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    community.channels.push({
      name: req.body.name,
      type: req.body.type || 'text',
      description: req.body.description || ''
    })

    await community.save()
    res.json(community.channels)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// LEAVE community
router.patch('/:id/leave', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
    if (!community) {
      return res.status(404).json({ error: 'Community not found' })
    }

    if (community.owner.toString() === req.user.id) {
      return res.status(400).json({ error: 'Owner cannot leave. Transfer ownership first.' })
    }

    community.members = community.members.filter(
      m => m.user.toString() !== req.user.id
    )

    community.memberCount = Math.max(0, community.memberCount - 1)
    await community.save()

    res.json({ message: 'Left community' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router