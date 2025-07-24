import { useState, useEffect } from 'react';
import { getPopularCollections, TMDBCollection } from '@/utils/tmdb';

interface UseCollectionsResult {
  collections: TMDBCollection[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useCollections = (maxCollections: number = 12): UseCollectionsResult => {
  const [collections, setCollections] = useState<TMDBCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar cache primeiro (cache por 1 hora)
      const cacheKey = 'popular_collections';
      const cacheTimeKey = 'popular_collections_time';
      const cached = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(cacheTimeKey);
      
      const now = Date.now();
      const oneHour = 60 * 60 * 1000; // 1 hora em milissegundos
      
      if (cached && cacheTime && (now - parseInt(cacheTime)) < oneHour) {
        setCollections(JSON.parse(cached));
        setIsLoading(false);
        return;
      }
      
      // Buscar dados frescos da API
      const data = await getPopularCollections(maxCollections);
      setCollections(data);
      
      // Salvar no cache
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(cacheTimeKey, now.toString());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar coleções');
      console.error('Error fetching collections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    // Limpar cache e buscar novamente
    localStorage.removeItem('popular_collections');
    localStorage.removeItem('popular_collections_time');
    fetchCollections();
  };

  useEffect(() => {
    fetchCollections();
  }, [maxCollections]);

  return {
    collections,
    isLoading,
    error,
    refetch
  };
};