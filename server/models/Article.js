const mongoose = require('mongoose')

const ArticleSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    default: ''
  },
  tags: [{ type: String }],
  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled', 'archived'],
    default: 'draft'
  },
  publishAt: {
    type: Date,
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: { type: String, required: true },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  readTime: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  series: {
    type: String,
    default: ''
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true })

module.exports = mongoose.model('Article', ArticleSchema)