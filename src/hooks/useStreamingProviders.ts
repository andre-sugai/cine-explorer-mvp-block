import { useState, useMemo } from 'react';

interface StreamingProvider {
  provider_id: number;
  provider_name: string;
  logo_path?: string;
}

interface StreamingData {
  flatrate?: StreamingProvider[];
  rent?: StreamingProvider[];
  buy?: StreamingProvider[];
}

interface ItemWithStreaming {
  id: number;
  streamingData?: {
    BR?: StreamingData;
  };
  [key: string]: any;
}

export const useStreamingProviders = (items: ItemWithStreaming[]) => {
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);

  // Extract all available streaming providers from items
  const availableProviders = useMemo(() => {
    const providers = new Map<string, StreamingProvider>();
    
    items.forEach(item => {
      const streamingData = item.streamingData?.BR;
      if (streamingData) {
        // Include flatrate (subscription) providers
        streamingData.flatrate?.forEach(provider => {
          providers.set(provider.provider_name, provider);
        });
      }
    });

    return Array.from(providers.values());
  }, [items]);

  // Count items per provider
  const providerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    items.forEach(item => {
      const streamingData = item.streamingData?.BR;
      if (streamingData?.flatrate) {
        streamingData.flatrate.forEach(provider => {
          counts[provider.provider_name] = (counts[provider.provider_name] || 0) + 1;
        });
      }
    });

    return counts;
  }, [items]);

  // Filter items based on selected providers
  const filteredItems = useMemo(() => {
    if (selectedProviders.length === 0) {
      return items;
    }

    return items.filter(item => {
      const streamingData = item.streamingData?.BR;
      if (!streamingData?.flatrate) {
        return false;
      }

      // Check if item is available on any of the selected providers (OR logic)
      return streamingData.flatrate.some(provider =>
        selectedProviders.includes(provider.provider_name)
      );
    });
  }, [items, selectedProviders]);

  return {
    selectedProviders,
    setSelectedProviders,
    availableProviders,
    providerCounts,
    filteredItems
  };
};