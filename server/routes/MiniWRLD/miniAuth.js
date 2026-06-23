const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const MiniUser = require('../../models/MiniWRLD/MiniUser')
const Child = require('../../models/LittleWRLD/Child')
const User = require('../../models/User')

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

const getAgeBracket = (age) => {
  if (age >= 18) return 'young_adult_18_20'
  if (age >= 16) return 'teen_16_17'
  return 'teen_13_15'
}

const getContentAccess = (age) => {
  return {
    canPostVideos: true,
    canGoLive: age >= 16,
    canJoinForums: true,
    canJoinCommunities: true,
    canWriteArticles: age >= 16,
    canSendSnaps: true,
    canViewExplore: true,
    maxDailyScreenMinutes: age >= 18 ? 0 : 180 // 0 = no limit
  }
}

const generateFriendId = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let isUnique = false
  let friendId

  while (!isUnique) {
    let id = 'MINI#'
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    friendId = id
    const existing = await MiniUser.findOne({ friendId })
    if (!existing) isUnique = true
  }

  return friendId
}

// REGISTER for WRLD Mini (self registration for 13+)
router.post('/register', async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      displayName,
      dateOfBirth,
      worlds,
      interests,
      purpose,
      parentEmail
    } = req.body

    const age = calculateAge(dateOfBirth)

    if (age < 13) {
      return res.status(400).json({
        error: 'You must be at least 13 to join WRLD Mini. Check out Little WRLD instead!'
      })
    }

    if (age >= 21) {
      return res.status(400).json({
        error: 'You are old enough for the full WRLD experience!'
      })
    }

    const existingUser = await MiniUser.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email
          ? 'Email already in use'
          : 'Username already taken'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const friendId = await generateFriendId()
    const ageBracket = getAgeBracket(age)
    const contentAccess = getContentAccess(age)

    // Find parent account if email provided (encouraged for under 18)
    let parentAccount = null
    if (parentEmail) {
      const parent = await User.findOne({ email: parentEmail })
      if (parent) parentAccount = parent._id
    }

    const miniUser = new MiniUser({
      username,
      email,
      password: hashedPassword,
      displayName: displayName || username,
      dateOfBirth,
      age,
      friendId,
      ageBracket,
      contentAccess,
      worlds: worlds || [],
      interests: interests || [],
      purpose: purpose || ['just_having_fun'],
      parentAccount,
      parentMonitoring: {
        isEnabled: age < 18,
        canSeeMessages: age < 16,
        canSeePosts: true,
        canSeeFollowers: true
      }
    })

    await miniUser.save()

    const token = jwt.sign(
      {
        id: miniUser._id,
        username: miniUser.username,
        isMini: true,
        age: miniUser.age,
        ageBracket: miniUser.ageBracket
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: `Welcome to WRLD Mini, ${miniUser.displayName}! 🌍`,
      token,
      user: {
        id: miniUser._id,
        username: miniUser.username,
        email: miniUser.email,
        displayName: miniUser.displayName,
        age: miniUser.age,
        ageBracket: miniUser.ageBracket,
        friendId: miniUser.friendId,
        contentAccess: miniUser.contentAccess
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// LOGIN to WRLD Mini
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body

    const miniUser = await MiniUser.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    })

    if (!miniUser) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, miniUser.password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Recalculate age in case birthday passed
    const age = calculateAge(miniUser.dateOfBirth)

    // Auto graduate if now 21
    if (age >= 21 && !miniUser.hasGraduated) {
      return res.status(200).json({
        graduated: true,
        message: 'You are now 21! Time to graduate to the full WRLD experience. 🎓',
        miniUserId: miniUser._id
      })
    }

    // Update content access if age bracket changed
    const newBracket = getAgeBracket(age)
    if (newBracket !== miniUser.ageBracket) {
      miniUser.ageBracket = newBracket
      miniUser.age = age
      miniUser.contentAccess = getContentAccess(age)
      await miniUser.save()
    }

    const token = jwt.sign(
      {
        id: miniUser._id,
        username: miniUser.username,
        isMini: true,
        age,
        ageBracket: miniUser.ageBracket
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: miniUser._id,
        username: miniUser.username,
        displayName: miniUser.displayName,
        age,
        ageBracket: miniUser.ageBracket,
        friendId: miniUser.friendId,
        contentAccess: miniUser.contentAccess,
        appearance: miniUser.appearance
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GRADUATE from Little WRLD to WRLD Mini
// Called when a Little WRLD user turns 13
router.post('/graduate-from-little', async (req, res) => {
  try {
    const { childId, email, password } = req.body

    const child = await Child.findById(childId)
    if (!child) return res.status(404).json({ error: 'Little WRLD account not found' })

    const age = calculateAge(child.dateOfBirth)
    if (age < 13) {
      return res.status(400).json({
        error: 'Must be 13 to join WRLD Mini'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const friendId = await generateFriendId()
    const ageBracket = getAgeBracket(age)
    const contentAccess = getContentAccess(age)

    const miniUser = new MiniUser({
      parentAccount: child.parentAccount,
      username: child.username,
      email,
      password: hashedPassword,
      displayName: child.displayName,
      dateOfBirth: child.dateOfBirth,
      age,
      friendId,
      ageBracket,
      contentAccess,
      fromLittleWRLD: true,
      littleWRLDAccount: child._id
    })

    await miniUser.save()

    // Mark Little WRLD account as graduated
    child.hasGraduated = true
    child.graduatedAt = new Date()
    await child.save()

    const token = jwt.sign(
      {
        id: miniUser._id,
        username: miniUser.username,
        isMini: true,
        age,
        ageBracket
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: `Welcome to WRLD Mini, ${miniUser.displayName}! You have graduated from Little WRLD. 🎉`,
      token,
      user: {
        id: miniUser._id,
        username: miniUser.username,
        displayName: miniUser.displayName,
        age,
        ageBracket,
        friendId,
        contentAccess
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router