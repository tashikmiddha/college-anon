import User from '../models/User.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { generateUniqueAnonId } from '../utils/generateAnonId.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { email, password, collegeEmail, displayName } = req.body;

    // Validation
    if (!email || !password || !collegeEmail) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { collegeEmail }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      collegeEmail,
      displayName: displayName || 'Anonymous',
      anonId: generateUniqueAnonId()
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        collegeEmail: user.collegeEmail,
        displayName: user.displayName,
        anonId: user.anonId,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: !email && !password ? 'Please provide email and password' 
          : !email ? 'Please provide your email' 
          : 'Please provide your password' 
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found for:', email);
      return res.status(401).json({ message: 'Wrong email or password' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    console.log('Password match result:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong email or password' });
    }

    const token = generateToken(user._id);
    console.log('Login successful for:', email);

    res.json({
      _id: user._id,
      email: user.email,
      collegeEmail: user.collegeEmail,
      displayName: user.displayName,
      anonId: user.anonId,
      isAdmin: user.isAdmin,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      email: user.email,
      collegeEmail: user.collegeEmail,
      displayName: user.displayName,
      anonId: user.anonId,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.displayName = req.body.displayName || user.displayName;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        email: updatedUser.email,
        collegeEmail: updatedUser.collegeEmail,
        displayName: updatedUser.displayName,
        anonId: updatedUser.anonId,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Refresh anon ID
// @route   POST /api/auth/refresh-anon-id
// @access  Private
export const refreshAnonId = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.anonId = generateUniqueAnonId();
      await user.save();

      res.json({ anonId: user.anonId });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

