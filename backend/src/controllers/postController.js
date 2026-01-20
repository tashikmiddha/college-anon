import Post from '../models/Post.js';
import { moderateContent } from '../ai/moderationFlow.js';
import { sanitizeContent } from '../utils/generateAnonId.js';
import { uploadImage as uploadImageToCloudinary } from '../config/cloudinary.js';

// @desc    Upload image
// @route   POST /api/posts/upload
// @access  Private
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const result = await uploadImageToCloudinary(req.file.buffer);

    res.status(201).json({
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload image', 
      error: error.message 
    });
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { title, content, category, tags, image } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({ message: 'Please provide title and content' });
    }

    // Sanitize content
    const sanitizedTitle = sanitizeContent(title);
    const sanitizedContent = sanitizeContent(content);

    // AI moderation
    const moderation = await moderateContent(sanitizedTitle, sanitizedContent);

    // Auto-approve if no OpenAI API key (moderation.flagged will be undefined)
    const isModerationEnabled = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0;

    // Parse image data if it's a string
    let imageData = { url: '', publicId: '' };
    if (image) {
      try {
        if (typeof image === 'string') {
          imageData = JSON.parse(image);
        } else {
          imageData = image;
        }
      } catch (e) {
        console.error('Error parsing image data:', e);
      }
    }

    const post = await Post.create({
      author: req.user._id,
      anonId: req.user.anonId,
      displayName: req.user.displayName,
      title: sanitizedTitle,
      content: sanitizedContent,
      category: category || 'general',
      tags: tags || [],
      image: imageData,
      // Auto-approve if moderation is disabled, or if content passes moderation check
      moderationStatus: isModerationEnabled ? (moderation.flagged ? 'flagged' : 'approved') : 'approved',
      // moderationStatus: 'approved',
      moderationReason: moderation.flagged ? moderation.reason : ''
      // moderationReason:''

    });

    const createdPost = await Post.findById(post._id).populate('author', 'anonId displayName');

    res.status(201).json(createdPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { isActive: true };
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Only show approved posts for public
    if (req.query.moderation !== 'true') {
      filter.moderationStatus = 'approved';
    }

    const sortOption = req.query.sort || '-createdAt';
    const posts = await Post.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('author', 'anonId displayName')
      .select('-content'); // Don't send full content in list

    const total = await Post.countDocuments(filter);

    res.json({
      posts,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts. Please try again later.' });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'anonId displayName');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.views = (post.views || 0) + 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const { title, content, category, tags } = req.body;

    // Update fields
    if (title) post.title = sanitizeContent(title);
    if (content) post.content = sanitizeContent(content);
    if (category) post.category = category;
    if (tags) post.tags = tags;

    // Re-moderate if content changed
    if (title || content) {
      const moderation = await moderateContent(post.title, post.content);
      post.moderationStatus = moderation.flagged ? 'flagged' : 'pending';
      post.moderationReason = moderation.reason;
    }

    const updatedPost = await post.save();

    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership or admin
    if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.isActive = false;
    await post.save();

    res.json({ message: 'Post removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
      post.likeCount = Math.max(0, post.likeCount - 1);
    } else {
      // Like
      post.likes.push(req.user._id);
      post.likeCount += 1;
    }

    await post.save();

    res.json({ likeCount: post.likeCount, isLiked: likeIndex === -1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's posts
// @route   GET /api/posts/my-posts
// @access  Private
export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id, isActive: true })
      .sort('-createdAt');

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Report post
// @route   POST /api/posts/:id/report
// @access  Private
export const reportPost = async (req, res) => {
  try {
    const { reason, description } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already reported
    const alreadyReported = post.reports.some(r => r.reporter.toString() === req.user._id.toString());
    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this post' });
    }

    // Create report
    const Report = (await import('../models/Report.js')).default;
    await Report.create({
      reporter: req.user._id,
      post: post._id,
      reason,
      description
    });

    post.reportCount += 1;
    
    // Auto-flag if too many reports
    if (post.reportCount >= 5) {
      post.moderationStatus = 'flagged';
    }

    await post.save();

    res.json({ message: 'Post reported successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

