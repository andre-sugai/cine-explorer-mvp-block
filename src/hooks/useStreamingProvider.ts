import { useState, useEffect, useRef } from 'react';
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
): StreamingProvider & { ref: React.RefObject<HTMLDivElement> } => {
  const [provider, setProvider] = useState<StreamingProvider>({
    logoPath: null,
    providerName: null,
    isLoading: false,
  });
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver para detectar quando o elemento está visível
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // Para de observar após primeira visualização
          }
        });
      },
      {
        rootMargin: '50px', // Começa a carregar 50px antes de aparecer
        threshold: 0.01, // Dispara quando 1% do elemento está visível
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Fetch provider apenas quando visível
  useEffect(() => {
    if (!isVisible) return; // Não faz nada se não estiver visível
    
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
  }, [id, type, isVisible]); // Adiciona isVisible como dependência

  return { ...provider, ref: elementRef };
};

