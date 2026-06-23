const mongoose = require('mongoose')

const MiniUserSchema = new mongoose.Schema({
  parentAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // optional for 13-17, not required for 18-20
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  friendId: {
    type: String,
    unique: true,
    sparse: true
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MiniUser'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MiniUser'
  }],
  friends: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MiniUser'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'blocked'],
      default: 'pending'
    }
  }],
  worlds: [{
    type: String
  }],
  interests: [{ type: String }],
  purpose: [{ type: String }],
  // Age bracket determines content access
  ageBracket: {
    type: String,
    enum: ['teen_13_15', 'teen_16_17', 'young_adult_18_20'],
    required: true
  },
  // Parent monitoring — optional for 18-20, encouraged for 13-17
  parentMonitoring: {
    isEnabled: { type: Boolean, default: true },
    canSeeMessages: { type: Boolean, default: false }, // teens only
    canSeePosts: { type: Boolean, default: true },
    canSeeFollowers: { type: Boolean, default: true }
  },
  // Content restrictions per age bracket
  contentAccess: {
    canPostVideos: { type: Boolean, default: true },
    canGoLive: { type: Boolean, default: false }, // unlocks at 16
    canJoinForums: { type: Boolean, default: true },
    canJoinCommunities: { type: Boolean, default: true },
    canWriteArticles: { type: Boolean, default: false }, // unlocks at 16
    canSendSnaps: { type: Boolean, default: true },
    canViewExplore: { type: Boolean, default: true },
    maxDailyScreenMinutes: { type: Number, default: 180 }
  },
  appearance: {
    mode: { type: String, enum: ['light', 'dark'], default: 'dark' },
    primaryColor: { type: String, default: '#FFD700' },
    backgroundColor: { type: String, default: '#0D0D0D' },
    accentColor: { type: String, default: '#FFD700' },
    font: { type: String, default: 'Montserrat' }
  },
  verified: { type: Boolean, default: false },
  hasGraduated: { type: Boolean, default: false },
  graduatedAt: { type: Date, default: null },
  mainWRLDAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Came from Little WRLD
  fromLittleWRLD: {
    type: Boolean,
    default: false
  },
  littleWRLDAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    default: null
  }
}, { timestamps: true })

module.exports = mongoose.model('MiniUser', MiniUserSchema)