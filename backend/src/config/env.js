import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/college-anon",
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  // Redis configuration for caching and rate limiting
  redisUrl: process.env.REDIS_URL || '',
  // Cluster configuration
  enableClustering: process.env.ENABLE_CLUSTERING === 'true',
  maxWorkers: parseInt(process.env.MAX_WORKERS) || 0, // 0 = auto-detect CPU cores
  // Email configuration
  email: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@gmail.com'
  },
  // Cloudinary configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  },
  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  }
};

