import express from 'express';
import multer from 'multer';
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  refreshAnonId,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  checkUserExists,
  submitPayment
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const router = express.Router();

// Public routes
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', authLimiter, resendVerificationEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);
router.post('/check-user', authLimiter, checkUserExists);

// Private routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/refresh-anon-id', protect, refreshAnonId);
router.post('/submit-payment', protect, upload.single('screenshot'), submitPayment);

export default router;

