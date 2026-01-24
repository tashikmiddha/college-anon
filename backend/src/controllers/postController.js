import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { moderateContent } from '../ai/moderationFlow.js';
import { sanitizeContent } from '../utils/generateAnonId.js';
import { uploadImage as uploadImageToCloudinary } from '../config/cloudinary.js';
import { postCache } from '../config/cache.js';

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
    if (image && image.url) {
      // Check if user is premium for image uploads
      const isPremium = req.user.isPremium && 
        (!req.user.premiumExpiresAt || new Date() < req.user.premiumExpiresAt);
      
      if (!isPremium) {
        return res.status(403).json({ 
          message: 'Image uploads are a premium feature. Upgrade to premium to upload images.',
          requiresPremium: true
        });
      }

      // Check image upload quota
      const imageLimit = req.user.premiumLimits?.imageUploads || 10;
      const imageUsed = req.user.premiumUsage?.imageUploads || 0;
      
      if (imageUsed >= imageLimit) {
        return res.status(403).json({ 
          message: 'You have reached your image upload limit',
          current: imageUsed,
          limit: imageLimit,
          requiresPremium: true
        });
      }

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
      college: req.user.college,
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

    // Increment image usage if image was uploaded
    if (imageData.url) {
      const User = (await import('../models/User.js')).default;
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'premiumUsage.imageUploads': 1 }
      });
    }

    const createdPost = await Post.findById(post._id).populate('author', 'anonId displayName isPremium');

    // Invalidate posts cache when new post is created
    if (createdPost) {
      await postCache.invalidatePostsList(req.user.college);
      // Also invalidate the single post cache if it exists
      await postCache.invalidatePost(post._id.toString());
    }

    // Check if post needs moderation
    const needsModeration = post.moderationStatus === 'pending' || post.moderationStatus === 'flagged';
    const message = needsModeration 
      ? 'Your post is gone for admin approval. It will be visible again once an admin reviews and approves it.'
      : 'Post created successfully!';

    res.status(201).json({
      ...createdPost.toObject(),
      needsModeration,
      message
    });
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

    // Build cache params
    const cacheParams = {
      page,
      limit,
      category: req.query.category,
      search: req.query.search,
      college: req.user?.college || req.query.college
    };

    // Try to get from cache first (only for page 1 and no search)
    if (page === 1 && !req.query.search && req.user && !req.user.isAdmin) {
      const cached = await postCache.getPosts(cacheParams);
      if (cached) {
        console.log('Returning cached posts');
        return res.json(cached);
      }
    }

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

    // College filtering: non-admin users can only see posts from their college
    // Admins see all posts
    if (req.user && !req.user.isAdmin) {
      filter.college = req.user.college;
    } else if (req.query.college) {
      // Allow filtering by college if specified
      filter.college = req.query.college;
    }

    // Only show approved posts for public (non-owners, non-admins)
    // Owners can see their own pending/flagged/rejected posts
    if (req.query.moderation !== 'true') {
      if (req.user.isAdmin) {
        // Admins see all posts
        filter.moderationStatus = { $in: ['pending', 'approved', 'flagged', 'rejected'] };
      } else {
        // Check if we already have an $or from search
        if (filter.$or) {
          // Combine search and moderation conditions
          const searchConditions = filter.$or;
          filter.$or = [
            ...searchConditions,
            { 
              author: req.user._id,
              moderationStatus: { $in: ['pending', 'flagged', 'rejected'] }
            }
          ];
          // Add approved posts condition to search results
          filter.$or.push(
            ...searchConditions.map(condition => ({
              ...condition,
              moderationStatus: 'approved'
            }))
          );
        } else {
          // Regular users see approved posts + their own pending/flagged/rejected posts
          filter.$or = [
            { moderationStatus: 'approved' },
            { 
              author: req.user._id,
              moderationStatus: { $in: ['pending', 'flagged', 'rejected'] }
            }
          ];
        }
      }
    }

    const sortOption = req.query.sort || '-createdAt';
    
    // Use aggregation to filter out posts from blocked users (only for non-admins)
    const isAdmin = req.user && req.user.isAdmin;
    
    const aggregationPipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorDetails'
        }
      },
      {
        $unwind: {
          path: '$authorDetails',
          preserveNullAndEmptyArrays: false
        }
      },
    ];

    // Only filter blocked users for non-admins
    if (!isAdmin) {
      aggregationPipeline.push({
        $match: {
          'authorDetails.isBlocked': false
        }
      });
    }

    aggregationPipeline.push(
      {
        $sort: { [sortOption === '-createdAt' ? 'createdAt' : sortOption]: sortOption.startsWith('-') ? -1 : 1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $project: {
          authorDetails: {
            password: 0,
            isActive: 0,
            isBlocked: 0,
            blockReason: 0,
            blockedAt: 0,
            isVerified: 0,
            verificationToken: 0,
            verificationTokenExpires: 0,
            resetPasswordToken: 0,
            resetPasswordExpires: 0
          }
        }
      }
    );

    // Get total count (with same filter but without pagination)
    const totalFilter = { ...filter };
    const totalCountPipeline = [
      { $match: totalFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorDetails'
        }
      },
      {
        $unwind: {
          path: '$authorDetails',
          preserveNullAndEmptyArrays: false
        }
      },
    ];

    // Only filter blocked users for non-admins
    if (!isAdmin) {
      totalCountPipeline.push({
        $match: {
          'authorDetails.isBlocked': false
        }
      });
    }

    totalCountPipeline.push({ $count: 'total' });

    const totalCountResult = await Post.aggregate(totalCountPipeline);

    const total = totalCountResult.length > 0 ? totalCountResult[0].total : 0;

    const posts = await Post.aggregate(aggregationPipeline);

    const result = {
      posts,
      page,
      pages: Math.ceil(total / limit),
      total
    };

    // Cache the result (only for page 1 and no search)
    if (page === 1 && !req.query.search && req.user && !req.user.isAdmin) {
      await postCache.setPosts(cacheParams, result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts. Please try again later.' });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Private (college-restricted)
export const getPost = async (req, res) => {
  try {
    // Try to get from cache first
    const cached = await postCache.getSinglePost(req.params.id);
    if (cached) {
      console.log('Returning cached single post');
      return res.json(cached);
    }

    const post = await Post.findById(req.params.id)
      .populate('author', 'anonId displayName isPremium');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the post author is blocked - hide post if so (only for non-admins)
    const User = (await import('../models/User.js')).default;
    const author = await User.findById(post.author._id);
    if (author && author.isBlocked && !req.user.isAdmin) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user has access to this post (college-wise division)
    // Admins can view all posts, regular users can only view their college's posts
    if (!req.user.isAdmin && post.college !== req.user.college) {
      return res.status(403).json({ 
        message: 'You do not have permission to view this post',
        college: post.college
      });
    }

    // Check if the post is under moderation and if user is the owner
    const isOwner = post.author._id.toString() === req.user._id.toString();
    const isUnderReview = post.moderationStatus === 'pending' || post.moderationStatus === 'flagged';
    const isRejected = post.moderationStatus === 'rejected';
    
    // If post is under review and user is not the owner and not admin, don't show the post
    if (isUnderReview && !isOwner && !req.user.isAdmin) {
      return res.status(403).json({ 
        message: 'This post is currently under review',
        isUnderReview: true
      });
    }

    // If post is rejected, only owner and admin can see it
    if (isRejected && !isOwner && !req.user.isAdmin) {
      return res.status(403).json({ 
        message: 'This post has been rejected',
        isRejected: true
      });
    }

    // Increment view count
    post.views = (post.views || 0) + 1;
    await post.save();

    const result = {
      ...post.toObject(),
      isUnderReview,
      isRejected,
      isOwner
    };

    // Cache the result
    await postCache.setSinglePost(req.params.id, result);

    res.json(result);
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
    let needsModeration = false;
    let previousStatus = post.moderationStatus;

    // Update fields
    if (title) post.title = sanitizeContent(title);
    if (content) post.content = sanitizeContent(content);
    if (category) post.category = category;
    if (tags) post.tags = tags;

    // Re-moderate if content changed
    if (title || content) {
      const moderation = await moderateContent(post.title, post.content);
      
      if (moderation.flagged) {
        // Content failed moderation - keep previous status, show reason to owner
        // Post stays visible with its previous status
        post.moderationReason = moderation.reason;
        // Don't change moderationStatus - keep the post as it was
        // needsModeration stays false so post remains visible
      } else {
        // Content passed moderation - auto-approve immediately
        post.moderationStatus = 'approved';
        post.moderationReason = '';
        // needsModeration stays false, post is approved and visible
      }
    }

    const updatedPost = await post.save();

    // Invalidate caches
    await postCache.invalidatePost(req.params.id);
    await postCache.invalidatePostsList(req.user.college);

    // Determine if content was moderated and the result
    const wasContentChanged = !!(title || content);
    const contentPassedModeration = wasContentChanged && !post.moderationReason;

    // Build response with appropriate message
    let message;
    let moderationRejected = false;

    if (wasContentChanged && post.moderationReason) {
      // Content was changed but failed moderation - post kept with previous status
      message = 'Your post was not updated because it failed the moderation check.';
      moderationRejected = true;
    } else if (wasContentChanged && !post.moderationReason) {
      // Content was changed and passed moderation - auto-approved
      message = 'Post updated successfully! Your changes have been approved.';
    } else {
      // No content change - just regular update
      message = 'Post updated successfully!';
    }

    const response = {
      ...updatedPost.toObject(),
      message,
      moderationRejected,
      moderationReason: post.moderationReason || undefined
    };

    res.json(response);
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

    // Invalidate caches
    await postCache.invalidatePost(req.params.id);
    await postCache.invalidatePostsList(post.college);
    await postCache.invalidateUserPosts(req.user._id.toString());

    res.json({ message: 'Post removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private (college-restricted)
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user has access to this post (college-wise division)
    // Admins can like any post, regular users can only like their college's posts
    if (!req.user.isAdmin && post.college !== req.user.college) {
      return res.status(403).json({ 
        message: 'You can only like posts from your college',
        college: post.college
      });
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { author: req.user._id, isActive: true };

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Post.countDocuments(filter)
    ]);

    res.json({
      posts,
      page,
      pages: Math.ceil(total / limit),
      total,
      hasMore: page < Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Report post
// @route   POST /api/posts/:id/report
// @access  Private (college-restricted)
export const reportPost = async (req, res) => {
  try {
    const { reason, description } = req.body;

    // Validate reason field - must be provided and must be a valid enum value
    const validReasons = ['spam', 'harassment', 'hate-speech', 'violence', 'misinformation', 'inappropriate', 'other'];
    if (!reason) {
      return res.status(400).json({ message: 'Report reason is required' });
    }
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ 
        message: 'Invalid report reason',
        validReasons 
      });
    }

    // Validate description if provided
    if (description && description.length > 500) {
      return res.status(400).json({ message: 'Description cannot exceed 500 characters' });
    }

    // Find the post
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user has access to this post (college-wise division)
    // Admins can report any post, regular users can only report their college's posts
    if (!req.user.isAdmin && post.college !== req.user.college) {
      return res.status(403).json({ 
        message: 'You can only report posts from your college',
        college: post.college
      });
    }

    // Check if already reported using Report collection
    const Report = (await import('../models/Report.js')).default;
    const existingReport = await Report.findOne({
      reporter: req.user._id,
      post: post._id
    });
    
    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this post' });
    }

    // Create report
    await Report.create({
      reporter: req.user._id,
      post: post._id,
      reason,
      description: description || ''
    });

    post.reportCount += 1;
    
    // Auto-flag if too many reports
    if (post.reportCount >= 5) {
      post.moderationStatus = 'flagged';
    }

    await post.save();

    res.json({ message: 'Post reported successfully. You can track the status in your Profile > My Reports.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create comment
// @route   POST /api/posts/:id/comments
// @access  Private (college-restricted)
export const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user has access to this post (college-wise division)
    if (!req.user.isAdmin && post.college !== req.user.college) {
      return res.status(403).json({ 
        message: 'You can only comment on posts from your college',
        college: post.college
      });
    }

    // Validation
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Please provide comment content' });
    }

    // Sanitize content
    const sanitizedContent = sanitizeContent(content);

    // AI moderation for comment
    const moderation = await moderateContent('', sanitizedContent);
    if (moderation.flagged) {
      return res.status(400).json({ 
        message: 'Your comment was flagged for review',
        reason: moderation.reason
      });
    }

    // Create comment
    const comment = await Comment.create({
      post: post._id,
      author: req.user._id,
      college: req.user.college,
      anonId: req.user.anonId,
      displayName: req.user.displayName,
      content: sanitizedContent
    });

    // Update post comment count
    post.commentCount += 1;
    await post.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'anonId displayName isPremium');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
// @access  Private (college-restricted)
export const getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user has access to this post (college-wise division)
    if (!req.user.isAdmin && post.college !== req.user.college) {
      return res.status(403).json({ 
        message: 'You can only view comments on posts from your college',
        college: post.college
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { post: post._id, isActive: true };

    const comments = await Comment.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('author', 'anonId displayName isPremium');

    const total = await Comment.countDocuments(filter);

    // Add user like status to each comment
    const commentsWithLikeStatus = comments.map(comment => {
      const commentObj = comment.toObject();
      commentObj.isLiked = comment.likes.some(
        like => like.toString() === req.user._id.toString()
      );
      return commentObj;
    });

    res.json({
      comments: commentsWithLikeStatus,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like/Unlike comment
// @route   POST /api/comments/:id/like
// @access  Private (college-restricted)
export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check college access
    if (!req.user.isAdmin && comment.college !== req.user.college) {
      return res.status(403).json({ 
        message: 'You can only like comments from your college'
      });
    }

    const likeIndex = comment.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Unlike
      comment.likes.splice(likeIndex, 1);
      comment.likeCount = Math.max(0, comment.likeCount - 1);
    } else {
      // Like
      comment.likes.push(req.user._id);
      comment.likeCount += 1;
    }

    await comment.save();

    res.json({ 
      likeCount: comment.likeCount, 
      isLiked: likeIndex === -1 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check ownership or admin
    if (comment.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Soft delete the comment
    comment.isActive = false;
    await comment.save();

    // Update post comment count
    const post = await Post.findById(comment.post);
    if (post) {
      post.commentCount = Math.max(0, post.commentCount - 1);
      await post.save();
      
      // Invalidate post cache so the updated comment count is reflected
      await postCache.invalidatePost(comment.post.toString());
      await postCache.invalidatePostsList(post.college);
    }

    res.json({ message: 'Comment removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's comments
// @route   GET /api/posts/user/my-comments
// @access  Private
export const getMyComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Use aggregation to filter out comments from deleted posts
    const aggregationPipeline = [
      {
        $match: {
          author: req.user._id,
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'post',
          foreignField: '_id',
          as: 'post'
        }
      },
      {
        $unwind: {
          path: '$post',
          preserveNullAndEmptyArrays: false // Only keep comments where post exists and isActive
        }
      },
      {
        $match: {
          'post.isActive': true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $unwind: {
          path: '$author',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $project: {
          'author.password': 0,
          'author.isActive': 0,
          'author.isBlocked': 0,
          'author.blockReason': 0,
          'author.blockedAt': 0
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: skip }, { $limit: limit }]
        }
      }
    ];

    const result = await Comment.aggregate(aggregationPipeline);

    const comments = result[0].data;
    const total = result[0].metadata[0]?.total || 0;

    res.json({
      comments,
      page,
      pages: Math.ceil(total / limit),
      total,
      hasMore: page < Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

