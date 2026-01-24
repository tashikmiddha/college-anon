import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import competitionRoutes from './routes/competitionRoutes.js';

const app = express();

// Trust proxy for accurate IP detection behind reverse proxies (Render, Heroku, etc.)
app.set('trust proxy', 1);

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if(!origin) return callback(null, true);
    
    // Allow your EC2 frontend domain/IP
    // if(origin.includes('13.60.167.157') || origin.includes('amazonaws.com')) {
    //   return callback(null, true);
    // }
    
    // For development
    if(origin === 'http://localhost:5173') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Increase timeout for large uploads (5 minutes)
app.use((req, res, next) => {
  res.setTimeout(300000, () => {
    console.log('Request has timed out.');
    res.status(408).json({ message: 'Request timeout - please try with smaller images' });
  });
  next();
});

// Apply rate limiter to all routes
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.path 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Multer file too large error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB.'
    });
  }

  // Multer error
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

export default app;

