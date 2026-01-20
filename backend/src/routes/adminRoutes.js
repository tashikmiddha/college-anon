import express from 'express';
import {
  getStats,
  getAllPosts,
  moderatePost,
  getReports,
  resolveReport,
  getUsers,
  toggleAdmin,
  deleteUser,
  togglePin,
  deletePost,
  blockUser,
  unblockUser
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin status
router.use(protect, admin);

// Dashboard
router.get('/stats', getStats);

// Posts management
router.get('/posts', getAllPosts);
router.put('/posts/:id/moderate', moderatePost);
router.put('/posts/:id/pin', togglePin);
router.delete('/posts/:id', deletePost);

// Reports management
router.get('/reports', getReports);
router.put('/reports/:id/resolve', resolveReport);

// Users management
router.get('/users', getUsers);
router.put('/users/:id/toggle-admin', toggleAdmin);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);
router.delete('/users/:id', deleteUser);

export default router;

