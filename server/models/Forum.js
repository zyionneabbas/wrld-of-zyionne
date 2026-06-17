const mongoose = require('mongoose')

const ForumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
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
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rules: [{
    title: { type: String },
    description: { type: String }
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  postCount: {
    type: Number,
    default: 0
  },
  tags: [{ type: String }]
}, { timestamps: true })

module.exports = mongoose.model('Forum', ForumSchema)