import Redis from 'ioredis';
import { config } from './env.js';

// Redis client for caching and distributed rate limiting
class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.client && this.isConnected) {
      return this.client;
    }

    // Check if Redis is configured
    if (!config.redisUrl) {
      console.warn('Redis URL not configured - caching and distributed rate limiting will be disabled');
      return null;
    }

    try {
      this.client = new Redis(config.redisUrl, {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        lazyConnect: true,
        // Performance optimizations
        enableOfflineQueue: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
      });

      this.client.on('connect', () => {
        console.log('Redis connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('Redis error:', err.message);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('Redis connection closed');
        this.isConnected = false;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error('Failed to connect to Redis:', error.message);
      return null;
    }
  }

  async get(key) {
    if (!this.client) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error.message);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 300) {
    if (!this.client) return false;
    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis SET error:', error.message);
      return false;
    }
  }

  async del(key) {
    if (!this.client) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error.message);
      return false;
    }
  }

  // Increment with expiry for rate limiting
  async incrWithExpire(key, ttlSeconds = 60) {
    if (!this.client) return null;
    try {
      const multi = this.client.multi();
      multi.incr(key);
      multi.expire(key, ttlSeconds);
      const results = await multi.exec();
      return results[0][1]; // Return the incremented value
    } catch (error) {
      console.error('Redis INCR error:', error.message);
      return null;
    }
  }

  // Check rate limit
  async checkRateLimit(key, maxRequests, windowSeconds) {
    if (!this.client) {
      // Fallback to in-memory for development
      return { allowed: true, remaining: maxRequests, resetTime: windowSeconds };
    }

    try {
      const current = await this.incrWithExpire(key, windowSeconds);
      if (current === null) {
        return { allowed: true, remaining: maxRequests, resetTime: windowSeconds };
      }
      
      const remaining = Math.max(0, maxRequests - current);
      const ttl = await this.client.ttl(key);
      
      return {
        allowed: current <= maxRequests,
        remaining,
        resetTime: ttl > 0 ? ttl : windowSeconds,
        current
      };
    } catch (error) {
      console.error('Rate limit check error:', error.message);
      return { allowed: true, remaining: maxRequests, resetTime: windowSeconds };
    }
  }

  // Cache posts with invalidation
  async cachePosts(key, data, ttl = 300) {
    return this.set(`posts:${key}`, data, ttl);
  }

  async getCachedPosts(key) {
    return this.get(`posts:${key}`);
  }

  async invalidatePostsCache(pattern = '*') {
    if (!this.client) return false;
    try {
      const keys = await this.client.keys(`posts:${pattern}`);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache invalidation error:', error.message);
      return false;
    }
  }

  // Close connection
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.isConnected = false;
    }
  }
}

export const redisClient = new RedisClient();
export default redisClient;

