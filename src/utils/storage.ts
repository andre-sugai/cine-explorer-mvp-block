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

      try {
        const keys = Object.keys(localStorage);
        
        // 1. Clear ALL legacy TMDB cache to free space for critical data
        keys.filter(k => k.startsWith(CACHE_PREFIX)).forEach(k => {
          localStorage.removeItem(k);
        });

        // 2. Final attempt to save
        localStorage.setItem(key, value);
        console.log(`✅ Successfully saved "${key}" after removing legacy cache.`);
        return true;
      } catch (retryError) {
        console.error(`❌ Still failed to save "${key}" after cleanup:`, retryError);
        
        // Final fallback: keep only recent items if it's an array
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
