const mongoose = require('mongoose')

const ChildSchema = new mongoose.Schema({
  // Linked to parent's main WRLD account
  parentAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  // Approved contacts — only these users can message the child
  approvedContacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child'
  }],
  // Pending contact requests waiting for parent approval
  pendingContacts: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child'
    },
    requestedAt: { type: Date, default: Date.now }
  }],
  // Interests for safe content curation
  interests: [{
    type: String,
    enum: [
      'art',
      'music',
      'science',
      'math',
      'reading',
      'sports',
      'gaming',
      'animals',
      'nature',
      'cooking',
      'dance',
      'coding',
      'history',
      'languages',
      'movies',
      'crafts'
    ]
  }],
  // Content age rating allowed
  contentRating: {
    type: String,
    enum: ['all_ages', 'ages_6_plus', 'ages_10_plus', 'ages_13_plus'],
    default: 'all_ages'
  },
  // Screen time limits set by parent
  screenTime: {
    dailyLimitMinutes: { type: Number, default: 120 },
    sessionStartTime: { type: String, default: '08:00' },
    sessionEndTime: { type: String, default: '20:00' },
    todayUsageMinutes: { type: Number, default: 0 },
    lastUsageReset: { type: Date, default: Date.now }
  },
  // Parental controls
  parentalControls: {
    canSendMessages: { type: Boolean, default: true },
    canPostContent: { type: Boolean, default: true },
    canComment: { type: Boolean, default: true },
    canPlayGames: { type: Boolean, default: true },
    requiresApprovalForContacts: { type: Boolean, default: true },
    contentFilterLevel: {
      type: String,
      enum: ['strict', 'moderate', 'standard'],
      default: 'strict'
    }
  },
  appearance: {
    theme: {
      type: String,
      enum: [
        'rainbow',
        'ocean',
        'forest',
        'space',
        'candy',
        'sunset',
        'night',
        'gold'
      ],
      default: 'rainbow'
    },
    avatarStyle: {
      type: String,
      default: 'cartoon'
    }
  },
  // Graduation tracking
  hasGraduated: {
    type: Boolean,
    default: false
  },
  graduatedAt: {
    type: Date,
    default: null
  },
  mainWRLDAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Achievements and badges
  badges: [{
    name: { type: String },
    description: { type: String },
    icon: { type: String },
    earnedAt: { type: Date, default: Date.now }
  }],
  points: {
    type: Number,
    default: 0
  }
}, { timestamps: true })

module.exports = mongoose.model('Child', ChildSchema)