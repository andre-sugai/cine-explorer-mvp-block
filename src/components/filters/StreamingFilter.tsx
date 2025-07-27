import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface StreamingProvider {
  provider_id: number;
  provider_name: string;
  logo_path?: string;
}

interface StreamingFilterProps {
  selectedProviders: string[];
  onProvidersChange: (providers: string[]) => void;
  availableProviders: StreamingProvider[];
  itemCounts?: Record<string, number>;
}

const POPULAR_PROVIDERS_BR = [
  'Netflix',
  'Amazon Prime Video',
  'Disney Plus',
  'HBO Max',
  'Paramount Plus',
  'Apple TV Plus',
  'Globoplay',
  'Pluto TV'
];

export const StreamingFilter: React.FC<StreamingFilterProps> = ({
  selectedProviders,
  onProvidersChange,
  availableProviders,
  itemCounts = {}
}) => {
  const handleProviderToggle = (providerName: string) => {
    const isSelected = selectedProviders.includes(providerName);
    
    if (isSelected) {
      onProvidersChange(selectedProviders.filter(p => p !== providerName));
    } else {
      onProvidersChange([...selectedProviders, providerName]);
    }
  };

  const handleClearAll = () => {
    onProvidersChange([]);
  };

  // Get unique providers and prioritize popular ones
  const uniqueProviders = Array.from(
    new Set(availableProviders.map(p => p.provider_name))
  ).map(name => availableProviders.find(p => p.provider_name === name)!);

  const sortedProviders = uniqueProviders.sort((a, b) => {
    const aIsPopular = POPULAR_PROVIDERS_BR.includes(a.provider_name);
    const bIsPopular = POPULAR_PROVIDERS_BR.includes(b.provider_name);
    
    if (aIsPopular && !bIsPopular) return -1;
    if (!aIsPopular && bIsPopular) return 1;
    
    return a.provider_name.localeCompare(b.provider_name, 'pt-BR');
  });

  if (sortedProviders.length === 0) {
    return null;
  }

  return (
    <Card className="bg-secondary/50 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Streamings Disponíveis</CardTitle>
          {selectedProviders.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-muted-foreground hover:text-primary"
            >
              <X className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedProviders.map((provider) => {
            const count = itemCounts[provider.provider_name] || 0;
            const isSelected = selectedProviders.includes(provider.provider_name);
            
            return (
              <div
                key={provider.provider_id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-background/50 border-border hover:bg-primary/5'
                }`}
                onClick={() => handleProviderToggle(provider.provider_name)}
              >
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleProviderToggle(provider.provider_name)}
                />
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {provider.logo_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                      alt={provider.provider_name}
                      className="w-6 h-6 rounded flex-shrink-0"
                    />
                  )}
                  <span className="text-sm font-medium truncate">
                    {provider.provider_name}
                  </span>
                  {count > 0 && (
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                      {count}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {selectedProviders.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Filtrando por: <span className="font-medium">{selectedProviders.join(', ')}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};