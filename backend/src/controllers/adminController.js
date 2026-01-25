import Post from '../models/Post.js';
import User from '../models/User.js';
import Report from '../models/Report.js';
import Feedback from '../models/Feedback.js';
import Comment from '../models/Comment.js';
import { postCache } from '../config/cache.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    const { college } = req.query;
    
    // Build filter for posts - exclude blocked users
    const postFilter = { isActive: true };
    if (college) {
      postFilter.college = college;
    }

    // Get posts count excluding blocked users
    const postsWithAuthors = await Post.find(postFilter).populate('author', 'isBlocked');
    const activePosts = postsWithAuthors.filter(p => p.author && !p.author.isBlocked);
    const postCount = activePosts.length;

    const userFilter = {};
    if (college) {
      userFilter.college = college;
    }

    const [userCount, reportCount, pendingPosts] = await Promise.all([
      User.countDocuments(userFilter),
      Report.countDocuments({ status: 'pending' }),
      Post.countDocuments({ ...postFilter, moderationStatus: 'pending' })
    ]);

    res.json({
      totalPosts: postCount,
      totalUsers: userCount,
      pendingReports: reportCount,
      pendingModeration: pendingPosts,
      filteredCollege: college || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all posts for moderation
// @route   GET /api/admin/posts
// @access  Private/Admin
export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (req.query.status) {
      filter.moderationStatus = req.query.status;
    }
    if (req.query.college) {
      filter.college = req.query.college;
    }

    // Exclude posts from blocked users using aggregation
    const result = await Post.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      { $match: { 'author.isBlocked': false } },
      {
        $project: {
          'author.password': 0,
          'author.isActive': 0,
          'author.isBlocked': 0,
          'author.blockReason': 0,
          'author.blockedAt': 0
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: skip }, { $limit: limit }]
        }
      }
    ]);

    const posts = result[0].data;
    const total = result[0].metadata[0]?.total || 0;

    res.json({
      posts,
      page,
      pages: Math.ceil(total / limit),
      total,
      hasMore: page < Math.ceil(total / limit),
      filteredCollege: req.query.college || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Moderate a post
// @route   PUT /api/admin/posts/:id/moderate
// @access  Private/Admin
export const moderatePost = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const post = await Post.findById(req.params.id).populate('author', 'email anonId');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.moderationStatus = status;
    post.moderationReason = reason || '';
    await post.save();

    res.json({ message: `Post ${status}`, post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get reports submitted by the current user
// @route   GET /api/admin/reports/my-reports
// @access  Private
export const getMyReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      Report.find({ reporter: req.user._id })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('post', 'title content moderationStatus')
        .populate('reviewedBy', 'anonId displayName'),
      Report.countDocuments({ reporter: req.user._id })
    ]);

    res.json({
      reports,
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

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get all reports (not just pending) so admin can see all reports
    const { status } = req.query;
    // Filter to only show post reports, not competition reports
    const filter = { post: { $exists: true, $ne: null } };

    if (status) {
      filter.status = status;
    }

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('reporter', 'anonId displayName')
        .populate('post'),
      Report.countDocuments(filter)
    ]);

    res.json({
      reports,
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

// @desc    Resolve report
// @route   PUT /api/admin/reports/:id/resolve
// @access  Private/Admin
export const resolveReport = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;
    report.adminNotes = adminNotes || '';
    report.reviewedBy = req.user._id;
    report.reviewedAt = Date.now();
    await report.save();

    res.json({ message: 'Report resolved', report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { college } = req.query;
    const filter = {};

    if (college) {
      filter.college = college;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({
      users,
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

// @desc    Toggle admin status
// @route   PUT /api/admin/users/:id/toggle-admin
// @access  Private/Admin
export const toggleAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent removing own admin status
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own admin status' });
    }

    user.isAdmin = !user.isAdmin;
    await user.save();

    res.json({ message: `User is now ${user.isAdmin ? 'an admin' : 'a regular user'}`, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Pin/unpin post
// @route   PUT /api/admin/posts/:id/pin
// @access  Private/Admin
export const togglePin = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({ message: `Post ${post.isPinned ? 'pinned' : 'unpinned'}`, post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete any post
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Block user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
export const blockUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent blocking other admins
    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot block an admin user' });
    }

    // Prevent self-blocking
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    user.isBlocked = true;
    user.blockedAt = new Date();
    user.blockReason = reason || 'Violation of community guidelines';
    user.isActive = false;
    await user.save();

    res.json({ message: 'User blocked successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Unblock user
// @route   PUT /api/admin/users/:id/unblock
// @access  Private/Admin
export const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = false;
    user.blockedAt = null;
    user.blockReason = '';
    user.isActive = true;
    await user.save();

    res.json({ message: 'User unblocked successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Grant premium to user
// @route   POST /api/admin/users/:id/grant-premium
// @access  Private/Admin
export const grantPremium = async (req, res) => {
  try {
    const { imageUploads, competitions, durationDays } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate expiry date
    const duration = parseInt(durationDays) || 30; // Default 30 days
    const expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);

    user.isPremium = true;
    user.premiumGrantedAt = new Date();
    user.premiumExpiresAt = expiresAt;
    
    // Set custom quotas if provided, otherwise use defaults
    user.premiumLimits = {
      imageUploads: imageUploads || 10,
      competitions: competitions || 5
    };

    // Reset usage when granting premium
    user.premiumUsage = {
      imageUploads: 0,
      competitions: 0
    };

    await user.save();

    res.json({ 
      message: 'Premium granted successfully', 
      user,
      grantedUntil: expiresAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Revoke premium from user
// @route   PUT /api/admin/users/:id/revoke-premium
// @access  Private/Admin
export const revokePremium = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isPremium = false;
    user.premiumExpiresAt = new Date();
    await user.save();

    res.json({ message: 'Premium revoked successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update premium quotas
// @route   PUT /api/admin/users/:id/update-quotas
// @access  Private/Admin
export const updatePremiumQuotas = async (req, res) => {
  try {
    const { imageUploads, competitions } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isPremium) {
      return res.status(400).json({ message: 'User is not a premium member' });
    }

    // Update quotas (only provided fields)
    if (imageUploads !== undefined) {
      user.premiumLimits.imageUploads = parseInt(imageUploads);
    }
    if (competitions !== undefined) {
      user.premiumLimits.competitions = parseInt(competitions);
    }

    await user.save();

    res.json({ message: 'Quotas updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all premium users
// @route   GET /api/admin/premium-users
// @access  Private/Admin
export const getPremiumUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { college, status } = req.query;

    const filter = { isPremium: true };

    if (college) {
      filter.college = college;
    }

    if (status === 'active') {
      filter.premiumExpiresAt = { $gt: new Date() };
    } else if (status === 'expired') {
      filter.premiumExpiresAt = { $lte: new Date() };
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort('-premiumGrantedAt')
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({
      users,
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

// @desc    Reset premium usage
// @route   PUT /api/admin/users/:id/reset-usage
// @access  Private/Admin
export const resetPremiumUsage = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isPremium) {
      return res.status(400).json({ message: 'User is not a premium member' });
    }

    user.premiumUsage = {
      imageUploads: 0,
      competitions: 0
    };

    await user.save();

    res.json({ message: 'Usage reset successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit feedback
// @route   POST /api/admin/feedback
// @access  Private
export const submitFeedback = async (req, res) => {
  try {
    const { type, message } = req.body;

    const feedback = new Feedback({
      user: req.user._id,
      type,
      message
    });

    await feedback.save();

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get feedbacks submitted by the current user
// @route   GET /api/admin/feedback/my-feedbacks
// @access  Private
export const getMyFeedbacks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [feedbacks, total] = await Promise.all([
      Feedback.find({ user: req.user._id })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('reviewedBy', 'anonId displayName'),
      Feedback.countDocuments({ user: req.user._id })
    ]);

    res.json({
      feedbacks,
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

// @desc    Get all feedbacks
// @route   GET /api/admin/feedback
// @access  Private/Admin
export const getAllFeedbacks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { status, type } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (type) {
      filter.type = type;
    }

    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('user', 'anonId displayName email college'),
      Feedback.countDocuments(filter)
    ]);

    res.json({
      feedbacks,
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

// @desc    Resolve feedback
// @route   PUT /api/admin/feedback/:id/resolve
// @access  Private/Admin
export const resolveFeedback = async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.status = 'resolved';
    feedback.adminNotes = adminNotes || '';
    feedback.reviewedBy = req.user._id;
    feedback.reviewedAt = Date.now();
    await feedback.save();

    res.json({ message: 'Feedback resolved', feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/admin/feedback/:id
// @access  Private/Admin
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all comments
// @route   GET /api/admin/comments
// @access  Private/Admin
export const getAllComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { college } = req.query;

    // Build match stage for comments
    const matchStage = { isActive: true };
    if (college) {
      matchStage.college = college;
    }

    // Use aggregation to filter out comments from deleted posts
    const result = await Comment.aggregate([
      {
        $match: matchStage
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
    ]);

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

// @desc    Delete comment
// @route   DELETE /api/admin/comments/:id
// @access  Private/Admin
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Get the post ID before deleting the comment
    const postId = comment.post;

    await Comment.findByIdAndDelete(req.params.id);

    // Update post comment count
    const post = await Post.findById(postId);
    if (post) {
      post.commentCount = Math.max(0, post.commentCount - 1);
      await post.save();

      // Invalidate post cache so the updated comment count is reflected
      await postCache.invalidatePost(postId.toString());
      await postCache.invalidatePostsList(post.college);
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all competition reports
// @route   GET /api/admin/competition-reports
// @access  Private/Admin
export const getAllCompetitionReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { status } = req.query;
    const filter = { competition: { $exists: true, $ne: null } };

    if (status) {
      filter.status = status;
    }

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('reporter', 'anonId displayName')
        .populate('competition'),
      Report.countDocuments(filter)
    ]);

    res.json({
      reports,
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

// @desc    Resolve competition report
// @route   PUT /api/admin/competition-reports/:id/resolve
// @access  Private/Admin
export const resolveCompetitionReport = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Verify this is a competition report
    if (!report.competition) {
      return res.status(400).json({ message: 'This is not a competition report' });
    }

    report.status = status;
    report.adminNotes = adminNotes || '';
    report.reviewedBy = req.user._id;
    report.reviewedAt = Date.now();
    await report.save();

    res.json({ message: 'Report resolved', report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

