import { useState, useEffect } from 'react';
import {
  getMovieWatchProviders,
  getTVWatchProviders,
  buildImageUrl,
} from '@/utils/tmdb';

interface StreamingProvider {
  logoPath: string | null;
  providerName: string | null;
  isLoading: boolean;
}

export const useStreamingProvider = (
  id: number | undefined,
  type: 'movie' | 'tv' | 'person' | undefined
): StreamingProvider => {
  const [provider, setProvider] = useState<StreamingProvider>({
    logoPath: null,
    providerName: null,
    isLoading: false,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchProvider = async () => {
      if (!id || !type || type === 'person') {
        setProvider({ logoPath: null, providerName: null, isLoading: false });
        return;
      }

      setProvider((prev) => ({ ...prev, isLoading: true }));

      try {
        const providers =
          type === 'movie'
            ? await getMovieWatchProviders(id)
            : await getTVWatchProviders(id);

        if (!isMounted) return;

        // Prioritize flatrate (streaming subscription), then rent, then buy
        const bestProvider =
          providers.flatrate?.[0] ||
          providers.rent?.[0] ||
          providers.buy?.[0];

        if (bestProvider) {
          setProvider({
            logoPath: buildImageUrl(bestProvider.logo_path, 'original'),
            providerName: bestProvider.provider_name,
            isLoading: false,
          });
        } else {
          setProvider({
            logoPath: null,
            providerName: null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error fetching streaming provider:', error);
        if (isMounted) {
          setProvider({
            logoPath: null,
            providerName: null,
            isLoading: false,
          });
        }
      }
    };

    fetchProvider();

    return () => {
      isMounted = false;
    };
  }, [id, type]);

  return provider;
};
