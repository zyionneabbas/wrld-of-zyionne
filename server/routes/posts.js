const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// CREATE POST
router.post('/', auth, upload.array('media', 10), async (req, res) => {
  try {
    const { content, postType, hashtags } = req.body;

    const media = req.files?.map(file => ({
      url: file.path,
      type: file.mimetype.startsWith('video/') ? 'video' : 'image'
    })) || [];

    const extractedHashtags = content
      ? [...content.matchAll(/#(\w+)/g)].map(m => m[1].toLowerCase())
      : [];

    const post = new Post({
      author: req.user.id,
      content,
      media,
      postType: postType || 'post',
      hashtags: hashtags || extractedHashtags
    });

    await post.save();
    await post.populate('author', 'username displayName avatar verified');

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET FEED (posts from people you follow + your own)
router.get('/feed', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const following = [...user.following, req.user.id];

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      author: { $in: following },
      isArchived: false
    })
      .populate('author', 'username displayName avatar verified')
      .populate('comments.author', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET EXPLORE (all posts, not just following)
router.get('/explore', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ isArchived: false })
      .populate('author', 'username displayName avatar verified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SINGLE POST
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username displayName avatar verified')
      .populate('comments.author', 'username displayName avatar');

    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.views += 1;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LIKE / UNLIKE POST
router.patch('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const alreadyLiked = post.likes.includes(req.user.id);

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json({ likes: post.likes.length, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD COMMENT
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = {
      author: req.user.id,
      content: req.body.content
    };

    post.comments.push(comment);
    await post.save();
    await post.populate('comments.author', 'username displayName avatar');

    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE POST
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;