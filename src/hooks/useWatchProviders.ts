import { useState, useEffect, useCallback } from 'react';
import { getMovieWatchProviders, getTVWatchProviders, getWatchProviders } from '@/utils/tmdb';

interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface WatchProviderData {
  flatrate: WatchProvider[];
  rent: WatchProvider[];
  buy: WatchProvider[];
  cacheTime?: number;
}

interface UseWatchProvidersReturn {
  availableStreamings: WatchProvider[];
  loadingProviders: boolean;
  loadingFilter: boolean;
  getItemWatchProviders: (id: number, type: 'movie' | 'tv') => Promise<WatchProviderData>;
  filterItemsByStreaming: (items: any[], streamingId: string) => Promise<any[]>;
}

// Cache para evitar múltiplas chamadas da API
const providerCache = new Map<string, WatchProviderData>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useWatchProviders = (): UseWatchProvidersReturn => {
  const [availableStreamings, setAvailableStreamings] = useState<WatchProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [loadingFilter, setLoadingFilter] = useState(false);

  // Carregar provedores disponíveis
  useEffect(() => {
    loadAvailableStreamings();
  }, []);

  const loadAvailableStreamings = async () => {
    setLoadingProviders(true);
    try {
      const providers = await getWatchProviders('BR');
      setAvailableStreamings([
        { provider_id: 0, provider_name: 'Todos os Streamings', logo_path: '' },
        ...providers.slice(0, 15) // Limitar a 15 principais
      ]);
    } catch (error) {
      console.error('Error loading streamings:', error);
      setAvailableStreamings([]);
    } finally {
      setLoadingProviders(false);
    }
  };

  const getItemWatchProviders = useCallback(async (id: number, type: 'movie' | 'tv'): Promise<WatchProviderData> => {
    const cacheKey = `${type}-${id}`;
    const cached = providerCache.get(cacheKey);
    
    // Verificar se existe cache válido
    if (cached?.cacheTime && Date.now() - cached.cacheTime < CACHE_DURATION) {
      return cached;
    }

    try {
      let providers: WatchProviderData;
      if (type === 'movie') {
        providers = await getMovieWatchProviders(id);
      } else {
        providers = await getTVWatchProviders(id);
      }
      
      // Adicionar timestamp ao cache
      const cachedData = { ...providers, cacheTime: Date.now() };
      providerCache.set(cacheKey, cachedData);
      
      return providers;
    } catch (error) {
      console.error(`Error getting ${type} watch providers:`, error);
      return { flatrate: [], rent: [], buy: [] };
    }
  }, []);

  const filterItemsByStreaming = useCallback(async (items: any[], streamingId: string): Promise<any[]> => {
    if (!streamingId || streamingId === '0') {
      return items;
    }

    setLoadingFilter(true);
    try {
      const filtered = [];
      
      // Processar em lotes para melhor performance
      const batchSize = 5;
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchPromises = batch.map(async (item) => {
          try {
            const providers = await getItemWatchProviders(item.id, item.type);
            
            // Verificar se está disponível em qualquer tipo de acesso (flatrate, rent, buy)
            const hasProvider = [
              ...(providers.flatrate || []),
              ...(providers.rent || []),
              ...(providers.buy || [])
            ].some((p: WatchProvider) => p.provider_id.toString() === streamingId);
            
            return hasProvider ? item : null;
          } catch (error) {
            console.error(`Error checking providers for ${item.title}:`, error);
            return null;
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        filtered.push(...batchResults.filter(Boolean));
      }
      
      return filtered;
    } catch (error) {
      console.error('Error filtering by streaming:', error);
      return items;
    } finally {
      setLoadingFilter(false);
    }
  }, [getItemWatchProviders]);

  return {
    availableStreamings,
    loadingProviders,
    loadingFilter,
    getItemWatchProviders,
    filterItemsByStreaming
  };
};