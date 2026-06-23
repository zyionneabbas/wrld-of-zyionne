const express = require('express')
const router = express.Router()
const MiniUser = require('../../models/MiniWRLD/MiniUser')
const User = require('../../models/User')
const miniAuth = require('../../middleware/miniAuth')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const generateFriendId = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let isUnique = false
  let friendId

  while (!isUnique) {
    let id = 'WRLD#'
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    friendId = id
    const existing = await User.findOne({ friendId })
    if (!existing) isUnique = true
  }

  return friendId
}

const calculateAge = (dateOfBirth) => {
  const today = new Date()
  const birth = new Date(dateOfBirth)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// CHECK graduation eligibility
router.get('/check', miniAuth, async (req, res) => {
  try {
    const miniUser = await MiniUser.findById(req.miniUser.id)
    const age = calculateAge(miniUser.dateOfBirth)

    res.json({
      eligible: age >= 21,
      currentAge: age,
      graduatesAt: new Date(
        new Date(miniUser.dateOfBirth).getFullYear() + 21,
        new Date(miniUser.dateOfBirth).getMonth(),
        new Date(miniUser.dateOfBirth).getDate()
      )
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GRADUATE from WRLD Mini to main WRLD
router.post('/graduate', miniAuth, async (req, res) => {
  try {
    const miniUser = await MiniUser.findById(req.miniUser.id)
    if (!miniUser) return res.status(404).json({ error: 'Account not found' })

    if (miniUser.hasGraduated) {
      return res.status(400).json({ error: 'Already graduated to main WRLD' })
    }

    const age = calculateAge(miniUser.dateOfBirth)
    if (age < 21) {
      return res.status(400).json({
        error: `You need to be 21 to graduate. You are ${age} right now.`
      })
    }

    const friendId = await generateFriendId()

    // Create main WRLD account — carry over everything
    const newUser = new User({
      username: miniUser.username,
      email: miniUser.email,
      password: miniUser.password, // already hashed
      displayName: miniUser.displayName,
      avatar: miniUser.avatar,
      banner: miniUser.banner,
      bio: miniUser.bio || `Graduated from WRLD Mini 🎓`,
      friendId,
      worlds: miniUser.worlds,
      interests: miniUser.interests,
      purpose: miniUser.purpose,
      appearance: miniUser.appearance
    })

    await newUser.save()

    // Mark Mini account as graduated
    miniUser.hasGraduated = true
    miniUser.graduatedAt = new Date()
    miniUser.mainWRLDAccount = newUser._id
    await miniUser.save()

    // Generate full WRLD token
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: `Welcome to the full WRLD experience, ${newUser.displayName}! 🌍🎉 Every feature. No limits.`,
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        displayName: newUser.displayName,
        friendId: newUser.friendId,
        worlds: newUser.worlds
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router