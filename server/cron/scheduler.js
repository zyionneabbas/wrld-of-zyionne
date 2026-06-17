const cron = require('node-cron')
const Post = require('../models/Post')
const Article = require('../models/Article')

const startScheduler = () => {

  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date()

      // Publish scheduled posts
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

      // Publish scheduled articles
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

  console.log('📅 Scheduler is running')
}

module.exports = { startScheduler }