import express from 'express';
import {
  getStats,
  getAllPosts,
  moderatePost,
  getMyReports,
  getReports,
  resolveReport,
  getUsers,
  toggleAdmin,
  deleteUser,
  togglePin,
  deletePost,
  blockUser,
  unblockUser,
  grantPremium,
  revokePremium,
  updatePremiumQuotas,
  getPremiumUsers,
  resetPremiumUsage,
  submitFeedback,
  getMyFeedbacks,
  getAllFeedbacks,
  resolveFeedback,
  deleteFeedback,
  getAllComments,
  deleteComment
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// User's own reports (authentication required, no admin middleware) - MUST be defined BEFORE admin middleware
router.get('/reports/my-reports', protect, getMyReports);

// User's own feedbacks (authentication required, no admin middleware) - MUST be defined BEFORE admin middleware
router.get('/feedback/my-feedbacks', protect, getMyFeedbacks);

// User can submit feedback (authentication required, no admin middleware)
router.post('/feedback', protect, submitFeedback);

// All other admin routes require authentication and admin status
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

// Premium management
router.get('/premium-users', getPremiumUsers);
router.post('/users/:id/grant-premium', grantPremium);
router.put('/users/:id/revoke-premium', revokePremium);
router.put('/users/:id/update-quotas', updatePremiumQuotas);
router.put('/users/:id/reset-usage', resetPremiumUsage);

// Admin feedback routes (require authentication and admin status)
router.get('/feedback', getAllFeedbacks);
router.put('/feedback/:id/resolve', resolveFeedback);
router.delete('/feedback/:id', deleteFeedback);

// Comments management
router.get('/comments', getAllComments);
router.delete('/comments/:id', deleteComment);

export default router;

