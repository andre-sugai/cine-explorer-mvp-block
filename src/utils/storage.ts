/**
 * Safe localStorage utilities with quota management and cleanup
 */

const CACHE_PREFIX = 'cine_cache_';

/**
 * Safely sets an item in localStorage, handling QuotaExceededError by clearing cache
 */
export const safeLocalStorageSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn(`⚠️ LocalStorage quota exceeded while saving "${key}". Attempting cleanup...`);

      // Stage 1: Clear expired TMDB cache
      // We'll import these from cache.ts indirectly by using the prefix
      let clearedAny = false;
      try {
        const keys = Object.keys(localStorage);
        const now = Date.now();
        
        // 1. Clear clearly expired entries
        keys.filter(k => k.startsWith(CACHE_PREFIX)).forEach(k => {
          try {
            const cached = localStorage.getItem(k);
            if (cached) {
              const entry = JSON.parse(cached);
              if (entry.timestamp && entry.ttl && (now - entry.timestamp > entry.ttl)) {
                localStorage.removeItem(k);
                clearedAny = true;
              }
            }
          } catch (e) {
            localStorage.removeItem(k); // Remove corrupted
            clearedAny = true;
          }
        });

        // 2. If still full, clear 30% of oldest cache entries regardless of TTL
        if (!clearedAny || isStillFull(key, value)) {
          const cacheEntries = keys
            .filter(k => k.startsWith(CACHE_PREFIX))
            .map(k => {
              try {
                const item = localStorage.getItem(k);
                return { key: k, timestamp: item ? JSON.parse(item).timestamp : 0 };
              } catch (e) {
                return { key: k, timestamp: 0 };
              }
            })
            .sort((a, b) => a.timestamp - b.timestamp);

          const toClear = Math.ceil(cacheEntries.length * 0.3);
          cacheEntries.slice(0, toClear).forEach(entry => {
            localStorage.removeItem(entry.key);
          });
          console.log(`🧹 Cleared ${toClear} oldest cache entries to free space.`);
        }

        // 3. Final attempt to save
        localStorage.setItem(key, value);
        console.log(`✅ Successfully saved "${key}" after cleanup.`);
        return true;
      } catch (retryError) {
        console.error(`❌ Still failed to save "${key}" after cleanup:`, retryError);
        
        // Special case for arrays (favorites, watched): keep only recent if it's too big
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed) && parsed.length > 50) {
            const reduced = parsed.slice(-50);
            localStorage.setItem(key, JSON.stringify(reduced));
            console.warn(`⚠️ Saved only the most recent 50 items for "${key}" due to persistent quota limits.`);
            return true;
          }
        } catch (e) {
          // not an array or other error
        }
      }
    }
    
    console.error(`❌ Error saving to localStorage:`, error);
    return false;
  }
};

/**
 * Simple check if we can write without actually writing
 */
function isStillFull(key: string, value: string): boolean {
  try {
    const testKey = '__quota_test__';
    localStorage.setItem(testKey, value);
    localStorage.removeItem(testKey);
    return false;
  } catch (e) {
    return true;
  }
}
