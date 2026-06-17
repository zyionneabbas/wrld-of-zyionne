const mongoose = require('mongoose')

const ChannelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'voice', 'announcement'],
    default: 'text'
  },
  description: { type: String, default: '' },
  isPrivate: { type: Boolean, default: false },
  allowedRoles: [{ type: String }]
})

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#7A9E7E' },
  permissions: [{
    type: String,
    enum: [
      'manage_channels',
      'manage_members',
      'manage_roles',
      'ban_members',
      'kick_members',
      'pin_messages',
      'send_messages',
      'read_messages'
    ]
  }]
})

const CommunitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    roles: [{ type: String }],
    joinedAt: { type: Date, default: Date.now },
    nickname: { type: String, default: '' }
  }],
  channels: [ChannelSchema],
  roles: [RoleSchema],
  isPublic: {
    type: Boolean,
    default: true
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  memberCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true })

module.exports = mongoose.model('Community', CommunitySchema)