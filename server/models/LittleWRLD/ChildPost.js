const mongoose = require('mongoose')

const ChildPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  media: [{
    url: { type: String },
    type: { type: String, enum: ['image', 'video', 'drawing'] }
  }],
  postType: {
    type: String,
    enum: ['drawing', 'photo', 'thought', 'achievement'],
    default: 'thought'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child'
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child'
    },
    content: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  // All content goes through moderation before publishing
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderationNote: {
    type: String,
    default: ''
  },
  isVisible: {
    type: Boolean,
    default: false // only true after moderation approval
  }
}, { timestamps: true })

module.exports = mongoose.model('ChildPost', ChildPostSchema)