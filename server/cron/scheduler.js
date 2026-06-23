const cron = require('node-cron')
const Post = require('../models/Post')
const Article = require('../models/Article')
const Child = require('../models/LittleWRLD/Child')
const { getIO } = require('../socket')

const startScheduler = () => {

  // Every minute — publish scheduled posts and articles
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date()

      const postsToPublish = await Post.find({
        status: 'scheduled',
        publishAt: { $lte: now }
      })

      if (postsToPublish.length > 0) {
        const postIds = postsToPublish.map(p => p._id)
        await Post.updateMany(
          { _id: { $in: postIds } },
          { status: 'published', publishAt: null }
        )
        console.log(`✅ Published ${postsToPublish.length} scheduled post(s)`)
      }

      const articlesToPublish = await Article.find({
        status: 'scheduled',
        publishAt: { $lte: now }
      })

      if (articlesToPublish.length > 0) {
        const articleIds = articlesToPublish.map(a => a._id)
        await Article.updateMany(
          { _id: { $in: articleIds } },
          { status: 'published', publishAt: null }
        )
        console.log(`✅ Published ${articlesToPublish.length} scheduled article(s)`)
      }

    } catch (err) {
      console.error('Scheduler error:', err.message)
    }
  })

  // Daily at midnight — check for graduation eligible children
  cron.schedule('0 0 * * *', async () => {
    try {
      const today = new Date()
      const children = await Child.find({ hasGraduated: false })

      for (const child of children) {
        const birth = new Date(child.dateOfBirth)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--
        }

        if (age >= 21) {
          // Notify parent that child is ready to graduate
          const io = getIO()
          io.to(child.parentAccount.toString()).emit('graduationReady', {
            child: {
              id: child._id,
              displayName: child.displayName,
              age
            },
            message: `${child.displayName} is now 21 and ready to graduate to main WRLD!`
          })

          console.log(`🎓 ${child.displayName} is eligible for graduation`)
        }
      }
    } catch (err) {
      console.error('Graduation check error:', err.message)
    }
  })

  // Reset daily screen time at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      await Child.updateMany(
        {},
        {
          'screenTime.todayUsageMinutes': 0,
          'screenTime.lastUsageReset': new Date()
        }
      )
      console.log('⏱️ Screen time reset for all Little WRLD accounts')
    } catch (err) {
      console.error('Screen time reset error:', err.message)
    }
  })

  console.log('📅 WRLD Scheduler is running')
}

// Check WRLD Mini users for age bracket updates and graduation
const MiniUser = require('../models/MiniWRLD/MiniUser')

cron.schedule('0 0 * * *', async () => {
  try {
    const today = new Date()
    const miniUsers = await MiniUser.find({ hasGraduated: false })

    for (const miniUser of miniUsers) {
      const birth = new Date(miniUser.dateOfBirth)
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      if (monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }

      // Auto update age bracket and content access
      let newBracket = 'teen_13_15'
      if (age >= 18) newBracket = 'young_adult_18_20'
      else if (age >= 16) newBracket = 'teen_16_17'

      if (newBracket !== miniUser.ageBracket) {
        miniUser.ageBracket = newBracket
        miniUser.age = age
        miniUser.contentAccess = {
          canPostVideos: true,
          canGoLive: age >= 16,
          canJoinForums: true,
          canJoinCommunities: true,
          canWriteArticles: age >= 16,
          canSendSnaps: true,
          canViewExplore: true,
          maxDailyScreenMinutes: age >= 18 ? 0 : 180
        }
        await miniUser.save()
        console.log(`📈 ${miniUser.displayName} upgraded to ${newBracket}`)
      }

      // Notify if eligible for graduation
      if (age >= 21) {
        const io = getIO()
        io.to(miniUser._id.toString()).emit('graduationReady', {
          message: 'You are now 21! Graduate to the full WRLD experience. 🎓'
        })
        console.log(`🎓 ${miniUser.displayName} is eligible to graduate from WRLD Mini`)
      }
    }
  } catch (err) {
    console.error('Mini graduation check error:', err.message)
  }
})

module.exports = { startScheduler }