import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  refreshAnonId,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', authLimiter, resendVerificationEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

// Private routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/refresh-anon-id', protect, refreshAnonId);

export default router;

