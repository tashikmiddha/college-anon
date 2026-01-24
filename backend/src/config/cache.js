import { redisClient } from '../config/redis.js';

// Cache configuration
const CACHE_TTL = {
  posts: 300,      // 5 minutes for posts list
  singlePost: 180, // 3 minutes for single post
  userProfile: 600, // 10 minutes for user profiles
  adminStats: 60   // 1 minute for admin statistics
};

// Generate cache key for posts list
const getPostsCacheKey = (params) => {
  const { page = 1, limit = 20, category, search, college } = params;
  return `posts:list:${college}:${category || 'all'}:${search || 'none'}:${page}:${limit}`;
};

// Generate cache key for single post
const getPostCacheKey = (postId) => {
  return `posts:single:${postId}`;
};

// Generate cache key for user posts
const getUserPostsCacheKey = (userId, page = 1) => {
  return `posts:user:${userId}:${page}`;
};

// Cache service for posts
export const postCache = {
  // Get cached posts list
  async getPosts(params) {
    if (!redisClient.isConnected) return null;
    try {
      const key = getPostsCacheKey(params);
      return await redisClient.get(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Cache posts list
  async setPosts(params, data) {
    if (!redisClient.isConnected) return false;
    try {
      const key = getPostsCacheKey(params);
      return await redisClient.set(key, data, CACHE_TTL.posts);
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  // Get cached single post
  async getSinglePost(postId) {
    if (!redisClient.isConnected) return null;
    try {
      const key = getPostCacheKey(postId);
      return await redisClient.get(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Cache single post
  async setSinglePost(postId, data) {
    if (!redisClient.isConnected) return false;
    try {
      const key = getPostCacheKey(postId);
      return await redisClient.set(key, data, CACHE_TTL.singlePost);
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  // Invalidate single post cache
  async invalidatePost(postId) {
    if (!redisClient.isConnected) return false;
    try {
      const key = getPostCacheKey(postId);
      return await redisClient.del(key);
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return false;
    }
  },

  // Invalidate posts list cache (when new post is created)
  async invalidatePostsList(college) {
    if (!redisClient.isConnected) return false;
    try {
      // Invalidate all posts list caches for this college
      const pattern = `posts:list:${college}:*`;
      const keys = await redisClient.client?.keys(pattern);
      if (keys && keys.length > 0) {
        await redisClient.client?.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return false;
    }
  },

  // Invalidate user's posts cache
  async invalidateUserPosts(userId) {
    if (!redisClient.isConnected) return false;
    try {
      const pattern = `posts:user:${userId}:*`;
      const keys = await redisClient.client?.keys(pattern);
      if (keys && keys.length > 0) {
        await redisClient.client?.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return false;
    }
  },

  // Invalidate all post caches
  async invalidateAll() {
    if (!redisClient.isConnected) return false;
    try {
      const patterns = ['posts:list:*', 'posts:single:*', 'posts:user:*'];
      for (const pattern of patterns) {
        const keys = await redisClient.client?.keys(pattern);
        if (keys && keys.length > 0) {
          await redisClient.client?.del(keys);
        }
      }
      return true;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return false;
    }
  }
};

// Cache middleware for GET requests
export const cacheMiddleware = (cacheKeyGenerator, ttl = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache for authenticated requests with no-cache header
    if (req.headers['cache-control'] === 'no-cache') {
      return next();
    }

    try {
      const key = cacheKeyGenerator(req);
      const cached = await redisClient.get(key);

      if (cached) {
        return res.json(cached);
      }

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = (data) => {
        // Cache the response
        redisClient.set(key, data, ttl);
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

export default {
  postCache,
  cacheMiddleware,
  CACHE_TTL
};

