const mongoose = require('mongoose')

const ArchiveSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemType: {
    type: String,
    enum: [
      'post',
      'conversation',
      'story',
      'article',
      'forumPost',
      'user'
    ],
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemType'
  },
  note: {
    type: String,
    default: ''
  },
  archivedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true })

module.exports = mongoose.model('Archive', ArchiveSchema)