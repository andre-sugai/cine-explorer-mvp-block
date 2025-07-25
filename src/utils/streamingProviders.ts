import { buildApiUrl } from './tmdb';

export interface StreamingProvider {
  id: number;
  name: string;
  logo_path: string;
}

export interface WatchProvidersResponse {
  id: number;
  results: {
    BR?: {
      flatrate?: StreamingProvider[];
      buy?: StreamingProvider[];
      rent?: StreamingProvider[];
    };
  };
}

export interface StreamingData {
  providers: number[];
  lastUpdated: string;
}

// Mapping dos IDs dos providers para nomes locais
export const STREAMING_PROVIDERS = {
  8: { name: 'Netflix', id: 8 },
  119: { name: 'Amazon Prime Video', id: 119 },
  337: { name: 'Disney Plus', id: 337 },
  1899: { name: 'HBO Max', id: 1899 },
  307: { name: 'Globoplay', id: 307 },
  531: { name: 'Paramount Plus', id: 531 },
  350: { name: 'Apple TV+', id: 350 },
  283: { name: 'Crunchyroll', id: 283 },
  300: { name: 'Pluto TV', id: 300 },
} as const;

export type StreamingProviderId = keyof typeof STREAMING_PROVIDERS;

// Cache para armazenar dados de streaming
const streamingCache = new Map<string, StreamingData>();

export const getWatchProviders = async (
  id: number,
  type: 'movie' | 'tv'
): Promise<StreamingData> => {
  const cacheKey = `${type}-${id}`;
  
  // Verificar cache primeiro
  const cached = streamingCache.get(cacheKey);
  if (cached) {
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(cached.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Se os dados são mais recentes que 30 dias, usar cache
    if (daysSinceUpdate < 30) {
      return cached;
    }
  }

  try {
    const endpoint = type === 'movie' 
      ? `/movie/${id}/watch/providers`
      : `/tv/${id}/watch/providers`;
    
    const url = buildApiUrl(endpoint, { watch_region: 'BR' });
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data: WatchProvidersResponse = await response.json();
    
    const providers: number[] = [];
    
    if (data.results.BR?.flatrate) {
      data.results.BR.flatrate.forEach(provider => {
        if (provider.id in STREAMING_PROVIDERS) {
          providers.push(provider.id);
        }
      });
    }

    const streamingData: StreamingData = {
      providers,
      lastUpdated: new Date().toISOString(),
    };

    // Salvar no cache
    streamingCache.set(cacheKey, streamingData);
    
    return streamingData;
  } catch (error) {
    console.error('Error fetching watch providers:', error);
    return {
      providers: [],
      lastUpdated: new Date().toISOString(),
    };
  }
};

export const getProviderName = (id: number): string => {
  return STREAMING_PROVIDERS[id as StreamingProviderId]?.name || 'Desconhecido';
};

export const getAllProviderOptions = () => {
  return Object.entries(STREAMING_PROVIDERS).map(([id, provider]) => ({
    id: Number(id),
    name: provider.name,
  }));
};

export const isProviderCacheValid = (lastUpdated: string): boolean => {
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysSinceUpdate < 30;
};