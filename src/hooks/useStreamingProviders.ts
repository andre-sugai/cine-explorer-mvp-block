import { useState, useEffect } from 'react';
import { getMovieWatchProviders } from '@/utils/tmdb';

export interface StreamingProvider {
  provider_id: number;
  provider_name: string;
  logo_path?: string;
}

export const useStreamingProviders = (movieIds: number[]) => {
  const [availableProviders, setAvailableProviders] = useState<StreamingProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [movieProviders, setMovieProviders] = useState<Record<number, StreamingProvider[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (movieIds.length === 0) {
      setAvailableProviders([]);
      setMovieProviders({});
      return;
    }

    const fetchProviders = async () => {
      setLoading(true);
      try {
        const providersMap: Record<number, StreamingProvider[]> = {};
        const allProvidersSet = new Set<string>();

        // Buscar provedores para cada filme
        for (const movieId of movieIds) {
          try {
            const response = await getMovieWatchProviders(movieId);
            const brProviders = response?.results?.BR;
            
            if (brProviders) {
              const providers: StreamingProvider[] = [];
              
              // Flatrate (streaming normal)
              if (brProviders.flatrate) {
                providers.push(...brProviders.flatrate.map((p: any) => ({
                  provider_id: p.provider_id,
                  provider_name: p.provider_name,
                  logo_path: p.logo_path
                })));
              }
              
              // Rent (aluguel)
              if (brProviders.rent) {
                providers.push(...brProviders.rent.map((p: any) => ({
                  provider_id: p.provider_id,
                  provider_name: p.provider_name,
                  logo_path: p.logo_path
                })));
              }
              
              // Buy (compra)
              if (brProviders.buy) {
                providers.push(...brProviders.buy.map((p: any) => ({
                  provider_id: p.provider_id,
                  provider_name: p.provider_name,
                  logo_path: p.logo_path
                })));
              }

              // Remover duplicatas por provider_id
              const uniqueProviders = providers.filter((provider, index, self) => 
                index === self.findIndex(p => p.provider_id === provider.provider_id)
              );

              providersMap[movieId] = uniqueProviders;
              
              // Adicionar ao set de todos os provedores
              uniqueProviders.forEach(provider => {
                allProvidersSet.add(JSON.stringify(provider));
              });
            }
          } catch (error) {
            console.error(`Error fetching providers for movie ${movieId}:`, error);
          }
        }

        setMovieProviders(providersMap);
        
        // Converter set para array e ordenar
        const allProviders = Array.from(allProvidersSet)
          .map(str => JSON.parse(str))
          .sort((a, b) => a.provider_name.localeCompare(b.provider_name));

        setAvailableProviders(allProviders);
      } catch (error) {
        console.error('Error fetching streaming providers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [movieIds]);

  const filterMoviesByProvider = (movieIds: number[]) => {
    if (selectedProvider === 'all') return movieIds;
    
    return movieIds.filter(movieId => {
      const providers = movieProviders[movieId] || [];
      return providers.some(provider => provider.provider_id.toString() === selectedProvider);
    });
  };

  return {
    availableProviders,
    selectedProvider,
    setSelectedProvider,
    filterMoviesByProvider,
    movieProviders,
    loading
  };
};