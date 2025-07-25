import { useState, useEffect } from 'react';
import { 
  getWatchProviders, 
  StreamingData, 
  isProviderCacheValid,
  STREAMING_PROVIDERS,
  StreamingProviderId
} from '@/utils/streamingProviders';

interface ItemWithStreaming {
  id: number;
  type: 'movie' | 'tv';
  streamingData?: StreamingData;
}

export const useStreamingProviders = <T extends ItemWithStreaming>(items: T[]) => {
  const [loadingProviders, setLoadingProviders] = useState<Set<string>>(new Set());
  const [streamingData, setStreamingData] = useState<Map<string, StreamingData>>(new Map());

  // Carregar dados de streaming para itens que não têm ou estão desatualizados
  useEffect(() => {
    const loadStreamingData = async () => {
      const itemsToUpdate: T[] = [];
      
      items.forEach(item => {
        const key = `${item.type}-${item.id}`;
        
        // Verificar se precisa atualizar dados de streaming
        if (!item.streamingData) {
          itemsToUpdate.push(item);
        } else if (!isProviderCacheValid(item.streamingData.lastUpdated)) {
          itemsToUpdate.push(item);
        } else {
          // Adicionar ao estado local se já existe
          setStreamingData(prev => new Map(prev).set(key, item.streamingData!));
        }
      });

      // Carregar dados em batches para evitar muitas requisições simultâneas
      const batchSize = 5;
      for (let i = 0; i < itemsToUpdate.length; i += batchSize) {
        const batch = itemsToUpdate.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (item) => {
            const key = `${item.type}-${item.id}`;
            
            setLoadingProviders(prev => new Set(prev).add(key));
            
            try {
              const data = await getWatchProviders(item.id, item.type);
              setStreamingData(prev => new Map(prev).set(key, data));
            } catch (error) {
              console.error(`Error loading streaming data for ${key}:`, error);
            } finally {
              setLoadingProviders(prev => {
                const newSet = new Set(prev);
                newSet.delete(key);
                return newSet;
              });
            }
          })
        );

        // Pequena pausa entre batches
        if (i + batchSize < itemsToUpdate.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    };

    if (items.length > 0) {
      loadStreamingData();
    }
  }, [items]);

  // Função para obter dados de streaming de um item específico
  const getItemStreamingData = (id: number, type: 'movie' | 'tv'): StreamingData | undefined => {
    const key = `${type}-${id}`;
    return streamingData.get(key);
  };

  // Função para verificar se um item está disponível em determinado provedor
  const isAvailableOn = (id: number, type: 'movie' | 'tv', providerId: number): boolean => {
    const data = getItemStreamingData(id, type);
    return data ? data.providers.includes(providerId) : false;
  };

  // Função para filtrar itens por provedor de streaming
  const filterByProvider = (providerId: number | null): T[] => {
    if (providerId === null) return items; // "Todos"
    
    return items.filter(item => {
      const data = getItemStreamingData(item.id, item.type);
      return data && data.providers.includes(providerId);
    });
  };

  // Função para obter estatísticas de streaming
  const getStreamingStats = () => {
    const stats: { [key: number]: number } = {};
    
    items.forEach(item => {
      const data = getItemStreamingData(item.id, item.type);
      if (data) {
        data.providers.forEach(providerId => {
          stats[providerId] = (stats[providerId] || 0) + 1;
        });
      }
    });

    return Object.entries(STREAMING_PROVIDERS).map(([id, provider]) => ({
      id: Number(id),
      name: provider.name,
      count: stats[Number(id)] || 0,
    }));
  };

  // Função para verificar se ainda está carregando dados
  const isLoading = loadingProviders.size > 0;

  return {
    streamingData,
    loadingProviders,
    isLoading,
    getItemStreamingData,
    isAvailableOn,
    filterByProvider,
    getStreamingStats,
  };
};