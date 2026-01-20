import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

// General API rate limiter - increased for development
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes (increased from 100)
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 attempts per 15 minutes (increased for testing)
  message: { message: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false
});

// Limiter for creating posts
export const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 posts per hour
  message: { message: 'Too many posts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

