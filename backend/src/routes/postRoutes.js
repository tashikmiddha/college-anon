import express from 'express';
import multer from 'multer';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  getMyPosts,
  reportPost,
  uploadImage
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import { postLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
  }
});

// Protected routes - authentication required for getting posts (to filter by college)
router.get('/', protect, getPosts);
router.get('/:id', protect, getPost);

// Image upload endpoint
router.post('/upload', protect, upload.single('image'), uploadImage);

// Protected routes - authentication required
router.post('/', protect, postLimiter, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.get('/user/my-posts', protect, getMyPosts);
router.post('/:id/report', protect, reportPost);

export default router;

