import Post from '../models/Post.js';
import User from '../models/User.js';
import Report from '../models/Report.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    const [postCount, userCount, reportCount, pendingPosts] = await Promise.all([
      Post.countDocuments({ isActive: true }),
      User.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Post.countDocuments({ moderationStatus: 'pending' })
    ]);

    res.json({
      totalPosts: postCount,
      totalUsers: userCount,
      pendingReports: reportCount,
      pendingModeration: pendingPosts
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

    const filter = {};
    if (req.query.status) {
      filter.moderationStatus = req.query.status;
    }

    const posts = await Post.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('author', 'email collegeEmail anonId displayName');

    const total = await Post.countDocuments(filter);

    res.json({
      posts,
      page,
      pages: Math.ceil(total / limit),
      total
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

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ status: 'pending' })
      .sort('-createdAt')
      .populate('reporter', 'anonId displayName')
      .populate('post');

    res.json(reports);
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
    const users = await User.find()
      .select('-password')
      .sort('-createdAt');

    res.json(users);
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

