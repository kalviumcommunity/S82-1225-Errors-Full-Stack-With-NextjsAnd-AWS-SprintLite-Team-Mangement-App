/**
 * Redis Connection Utility
 *
 * Provides a singleton Redis client for caching throughout the application.
 * Supports both local Redis and cloud Redis instances.
 *
 * DISABLED: Redis caching is currently disabled for development
 */

// DISABLE REDIS - Set to null to skip connection attempts
const redis = null;

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Parsed cached data or null
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getCache(_key) {
  // Redis disabled - always return null (cache miss)
  return null;
}

/**
 * Set cache data with TTL
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in seconds (default: 60)
 * @returns {Promise<void>}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function setCache(_key, _data, _ttl = 60) {
  // Redis disabled - do nothing
  return;
}

/**
 * Delete cache keys
 * @param {string|string[]} keys - Single key or array of keys to delete
 * @returns {Promise<void>}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteCache(_keys) {
  // Redis disabled - do nothing
  return;
}

/**
 * Delete all keys matching a pattern
 * @param {string} pattern - Pattern to match (e.g., "users:*")
 * @returns {Promise<void>}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteCachePattern(_pattern) {
  // Redis disabled - do nothing
  return;
}

/**
 * Check if Redis is connected
 * @returns {boolean}
 */
export function isRedisConnected() {
  return false;
}

export default redis;
