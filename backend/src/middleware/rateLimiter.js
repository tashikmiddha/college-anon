import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';
import { redisClient } from '../config/redis.js';

// Helper function to get client IP from X-Forwarded-For header or req.socket
const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // X-Forwarded-For format: client, proxy1, proxy2
    const clientIp = forwarded.split(',')[0].trim();
    if (clientIp) return clientIp;
  }
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
};

// Redis-based rate limiter (for distributed systems)
const createRedisRateLimiter = (options) => {
  return async (req, res, next) => {
    const key = options.keyGenerator(req) || getClientIp(req);
    const fullKey = `${options.windowMs}:${key}`;
    
    try {
      const result = await redisClient.checkRateLimit(
        fullKey, 
        options.max, 
        Math.floor(options.windowMs / 1000)
      );
      
      if (result.allowed) {
        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', options.max);
        res.setHeader('X-RateLimit-Remaining', result.remaining);
        res.setHeader('X-RateLimit-Reset', result.resetTime);
        return next();
      }
      
      // Rate limited
      res.setHeader('Retry-After', result.resetTime);
      return res.status(429).json({
        message: options.message.message || 'Too many requests, please try again later',
        retryAfter: result.resetTime
      });
    } catch (error) {
      console.error('Redis rate limiter error:', error);
      // Fallback to in-memory if Redis fails
      return next();
    }
  };
};

// Fallback in-memory rate limiter (for development without Redis)
const createMemoryRateLimiter = (options) => {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const max = options.max || 100;
  
  // Simple in-memory store (note: this won't work properly across multiple instances)
  const requests = new Map();
    
  return (req, res, next) => {
    const key = options.keyGenerator(req) || getClientIp(req);
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [k, timestamps] of requests) {
      const filtered = timestamps.filter(t => t > windowStart);
      if (filtered.length === 0) {
        requests.delete(k);
      } else {
        requests.set(k, filtered);
      }
    }
    
    const userRequests = requests.get(key) || [];
    const recentRequests = userRequests.filter(t => t > windowStart);
    
    if (recentRequests.length >= max) {
      const oldestRequest = Math.min(...recentRequests);
      const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);
      
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        message: options.message.message || 'Too many requests, please try again later',
        retryAfter
      });
    }
    
    // Add current request
    recentRequests.push(now);
    requests.set(key, recentRequests);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', max - recentRequests.length);
    res.setHeader('X-RateLimit-Reset', Math.ceil(windowMs / 1000));
    
    next();
  };
};

// Choose rate limiter based on Redis availability
const createRateLimiter = (options) => {
  return async (req, res, next) => {
    // Check if Redis is available
    if (redisClient.isConnected && config.redisUrl) {
      return createRedisRateLimiter(options)(req, res, next);
    }
    // Fallback to memory-based limiter
    return createMemoryRateLimiter(options)(req, res, next);
  };
};

// General API rate limiter - increased for development
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes (increased from 100)
  message: { message: 'Too many requests, please try again later' },
  keyGenerator: (req) => getClientIp(req)
});

// Stricter limiter for auth endpoints
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 attempts per 15 minutes (increased for testing)
  message: { message: 'Too many login attempts, please try again after 15 minutes' },
  keyGenerator: (req) => getClientIp(req)
});

// Limiter for creating posts
export const postLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 posts per hour
  message: { message: 'Too many posts, please try again later' },
  keyGenerator: (req) => req.user?._id || getClientIp(req)
});

// Custom rate limiter factory for more control
export const createCustomLimiter = (options) => {
  return createRateLimiter(options);
};

export default {
  apiLimiter,
  authLimiter,
  postLimiter,
  createCustomLimiter
};

