const cron = require('node-cron')
const Post = require('../models/Post')

const startScheduler = () => {

  // Runs every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date()

      // Find all scheduled posts whose publish time has passed
      const postsToPublish = await Post.find({
        status: 'scheduled',
        publishAt: { $lte: now }
      })

      if (postsToPublish.length === 0) return

      // Publish each one
      const ids = postsToPublish.map(p => p._id)

      await Post.updateMany(
        { _id: { $in: ids } },
        {
          status: 'published',
          publishAt: null
        }
      )

      console.log(`✅ Published ${postsToPublish.length} scheduled post(s) at ${now.toISOString()}`)
    } catch (err) {
      console.error('Scheduler error:', err.message)
    }
  })

  console.log('📅 Post scheduler is running')
}

module.exports = { startScheduler }