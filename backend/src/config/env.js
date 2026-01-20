import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
  mongoUri: process.env.MONGODB_URI ||"mongodb://localhost:27017/college-anon",
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  }
};

