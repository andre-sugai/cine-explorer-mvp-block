import { safeLocalStorageSetItem } from './storage';

/**
 * Cache utility for storing and retrieving data with expiration (TTL)
 * Uses localStorage for persistence across sessions
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const CACHE_PREFIX = 'cine_cache_';

/**
 * Remove specific cache entry
 * @param key - Cache key to remove
 */
export function clearCacheItem(key: string): void {
  try {
    const cacheKey = CACHE_PREFIX + key;
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.error('Error clearing cache item:', error);
  }
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('✅ All cache cleared');
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
}

/**
 * Clear only expired cache entries
 */
export function clearExpiredCache(): void {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    let clearedCount = 0;

    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry: CacheEntry<any> = JSON.parse(cached);
            if (now - entry.timestamp > entry.ttl) {
              localStorage.removeItem(key);
              clearedCount++;
            }
          }
        } catch (error) {
          // If parsing fails, remove the corrupted entry
          localStorage.removeItem(key);
          clearedCount++;
        }
      }
    });

    if (clearedCount > 0) {
      console.log(`🧹 Cleared ${clearedCount} expired cache entries`);
    }
  } catch (error) {
    console.error('Error clearing expired cache:', error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalEntries: number;
  totalSize: number;
  expiredEntries: number;
} {
  const keys = Object.keys(localStorage);
  const now = Date.now();
  let totalEntries = 0;
  let totalSize = 0;
  let expiredEntries = 0;

  keys.forEach((key) => {
    if (key.startsWith(CACHE_PREFIX)) {
      totalEntries++;
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += value.length;
        try {
          const entry: CacheEntry<any> = JSON.parse(value);
          if (now - entry.timestamp > entry.ttl) {
            expiredEntries++;
          }
        } catch (error) {
          expiredEntries++;
        }
      }
    }
  });

  return {
    totalEntries,
    totalSize,
    expiredEntries,
  };
}

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  MOVIE_DETAILS: 24 * 60 * 60 * 1000, // 24 hours
  TV_DETAILS: 24 * 60 * 60 * 1000, // 24 hours
  PERSON_DETAILS: 7 * 24 * 60 * 60 * 1000, // 7 days
  COLLECTION_DETAILS: 7 * 24 * 60 * 60 * 1000, // 7 days
  TRENDING: 60 * 60 * 1000, // 1 hour
  POPULAR: 60 * 60 * 1000, // 1 hour
  SEARCH: 30 * 60 * 1000, // 30 minutes
  DISCOVER: 60 * 60 * 1000, // 1 hour
  PROVIDERS: 7 * 24 * 60 * 60 * 1000, // 7 days (rarely change)
  GENRES: 30 * 24 * 60 * 60 * 1000, // 30 days (very static)
};

// Auto-cleanup expired cache on module load
clearExpiredCache();
