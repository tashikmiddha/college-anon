import express from 'express';
import multer from 'multer';
import {
  createCompetition,
  getCompetitions,
  getCompetition,
  voteOnCompetition,
  getCompetitionResults,
  deleteCompetition,
  updateCompetition,
  getAllCompetitionsAdmin,
  reportCompetition
} from '../controllers/competitionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';
import Competition from '../models/Competition.js';
import Report from '../models/Report.js';

const router = express.Router();

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

// All routes require authentication
router.use(protect);

// Create competition with optional image uploads
router.post('/', upload.array('optionImages', 10), createCompetition);

// Get all competitions
router.get('/', getCompetitions);

// Get single competition
router.get('/:id', getCompetition);

// Get competition results
router.get('/:id/results', getCompetitionResults);

// Vote on competition
router.post('/:id/vote', voteOnCompetition);

// Delete competition (owner or admin)
router.delete('/:id', deleteCompetition);

// Report competition (protect already applied globally)
router.post('/:id/report', reportCompetition);

// Hard delete competition (admin only - permanently removes from database)
router.delete('/:id/hard-delete', admin, async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    
    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    // Delete associated reports first
    await Report.deleteMany({ competition: competition._id });

    // Delete the competition
    await Competition.findByIdAndDelete(req.params.id);

    res.json({ message: 'Competition permanently deleted' });
  } catch (error) {
    console.error('Error hard deleting competition:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes - must be after regular routes
// Update competition (admin only)
router.put('/:id', admin, updateCompetition);

// Get all competitions for admin (includes all colleges, inactive)
router.get('/admin/all', admin, getAllCompetitionsAdmin);

export default router;

