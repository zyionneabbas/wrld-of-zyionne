const mongoose = require('mongoose')

const ChildMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  media: {
    url: { type: String, default: null },
    type: { type: String, enum: ['image', 'drawing', null], default: null }
  },
  // All messages go through moderation
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  read: {
    type: Boolean,
    default: false
  },
  // Parent can see all messages
  parentViewed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

module.exports = mongoose.model('ChildMessage', ChildMessageSchema)