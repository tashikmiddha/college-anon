import express from 'express';
import multer from 'multer';
import {
  createCompetition,
  getCompetitions,
  getCompetition,
  voteOnCompetition,
  getCompetitionResults,
  deleteCompetition
} from '../controllers/competitionController.js';
import { protect } from '../middleware/authMiddleware.js';

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

// Delete competition
router.delete('/:id', deleteCompetition);

export default router;

