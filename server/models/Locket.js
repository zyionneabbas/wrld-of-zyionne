const mongoose = require('mongoose')

const LocketSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  media: {
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true }
  },
  caption: {
    type: String,
    default: ''
  },
  visibility: {
    type: String,
    enum: ['friends', 'close_friends', 'custom'],
    default: 'friends'
  },
  customRecipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true })

module.exports = mongoose.model('Locket', LocketSchema)