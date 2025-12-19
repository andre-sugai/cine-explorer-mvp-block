import { useState, useEffect } from 'react';
import { getApiCache, setApiCache } from '../utils/apiCache';

interface UseCacheOptions {
  ttl?: number; // Time to live in milliseconds
  enabled?: boolean; // Whether to use cache (default: true)
}

/**
 * React hook for caching data with automatic fetching
 * @param key - Cache key
 * @param fetcher - Function to fetch data if not in cache
 * @param options - Cache options (ttl, enabled)
 * @returns Object with data, isLoading, error, and refetch function
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions = {}
) {
  const { ttl = 60 * 60 * 1000, enabled = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (useCache = true) => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get from cache first if enabled
      if (useCache && enabled) {
        const cached = await getApiCache<T>(key);
        if (cached !== null) {
          setData(cached);
          setIsLoading(false);
          return;
        }
      }

      // Fetch fresh data
      const freshData = await fetcher();
      setData(freshData);

      // Save to cache if enabled
      if (enabled) {
        await setApiCache(key, freshData, { ttl });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [key]);

  // Refetch function that bypasses cache
  const refetch = () => fetchData(false);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
