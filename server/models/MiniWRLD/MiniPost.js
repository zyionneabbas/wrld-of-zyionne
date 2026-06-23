const mongoose = require('mongoose')

const MiniReplySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MiniUser',
    required: true
  },
  content: { type: String, required: true },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MiniUser'
  }],
  createdAt: { type: Date, default: Date.now }
})

const MiniCommentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MiniUser',
    required: true
  },
  content: { type: String, required: true },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MiniUser'
  }],
  replies: [MiniReplySchema],
  createdAt: { type: Date, default: Date.now }
})

const MiniPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MiniUser',
    required: true
  },
  content: { type: String, default: '' },
  media: [{
    url: { type: String },
    type: { type: String, enum: ['image', 'video'] }
  }],
  postType: {
    type: String,
    enum: ['post', 'reel', 'tweet', 'story'],
    default: 'post'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MiniUser'
  }],
  comments: [MiniCommentSchema],
  hashtags: [{ type: String }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MiniUser'
  }],
  status: {
    type: String,
    enum: ['published', 'scheduled', 'draft', 'archived'],
    default: 'published'
  },
  publishAt: { type: Date, default: null },
  isArchived: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  // All posts go through age appropriate filter
  moderationStatus: {
    type: String,
    enum: ['approved', 'flagged', 'rejected'],
    default: 'approved'
  },
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MiniUser'
    },
    reason: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true })

module.exports = mongoose.model('MiniPost', MiniPostSchema)