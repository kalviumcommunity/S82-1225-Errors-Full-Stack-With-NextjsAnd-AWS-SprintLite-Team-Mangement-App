/**
 * Redis Connection Utility
 *
 * Provides a singleton Redis client for caching throughout the application.
 * Supports both local Redis and cloud Redis instances.
 */

import Redis from "ioredis";

// Create Redis client
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

// Event handlers
redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

redis.on("close", () => {
  console.log("⚠️  Redis connection closed");
});

/**
 * Cache helper functions
 */

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Parsed cached data or null
 */
export async function getCache(key) {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    console.error(`Redis GET error for key "${key}":`, error);
    return null; // Fail gracefully
  }
}

/**
 * Set cache data with TTL
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in seconds (default: 60)
 * @returns {Promise<void>}
 */
export async function setCache(key, data, ttl = 60) {
  try {
    await redis.set(key, JSON.stringify(data), "EX", ttl);
  } catch (error) {
    console.error(`Redis SET error for key "${key}":`, error);
  }
}

/**
 * Delete cache key(s)
 * @param {string|string[]} keys - Single key or array of keys to delete
 * @returns {Promise<void>}
 */
export async function deleteCache(keys) {
  try {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    if (keysArray.length > 0) {
      await redis.del(...keysArray);
    }
  } catch (error) {
    console.error(`Redis DEL error for keys "${keys}":`, error);
  }
}

/**
 * Delete all keys matching a pattern
 * @param {string} pattern - Pattern to match (e.g., "users:*")
 * @returns {Promise<void>}
 */
export async function deleteCachePattern(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`Redis pattern DELETE error for "${pattern}":`, error);
  }
}

/**
 * Check if Redis is connected
 * @returns {boolean}
 */
export function isRedisConnected() {
  return redis.status === "ready";
}

export default redis;
