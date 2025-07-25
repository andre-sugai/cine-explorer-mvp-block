import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { STREAMING_PROVIDERS, getAllProviderOptions } from '@/utils/streamingProviders';
import { X, Tv } from 'lucide-react';

interface StreamingFilterProps {
  selectedProvider: number | null;
  onProviderChange: (providerId: number | null) => void;
  streamingStats?: Array<{ id: number; name: string; count: number }>;
  isLoading?: boolean;
}

export const StreamingFilter: React.FC<StreamingFilterProps> = ({
  selectedProvider,
  onProviderChange,
  streamingStats = [],
  isLoading = false,
}) => {
  const providers = getAllProviderOptions();

  const getProviderName = (id: number) => {
    return STREAMING_PROVIDERS[id as keyof typeof STREAMING_PROVIDERS]?.name || 'Desconhecido';
  };

  const getProviderCount = (id: number) => {
    const stat = streamingStats.find(s => s.id === id);
    return stat ? stat.count : 0;
  };

  return (
    <div className="space-y-4">
      {/* Filtro principal */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Tv className="w-4 h-4" />
          <span>Filtrar por streaming:</span>
        </div>
        
        <div className="flex-1 max-w-xs">
          <Select 
            value={selectedProvider?.toString() || ''} 
            onValueChange={(value) => onProviderChange(value ? Number(value) : null)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full bg-secondary/50 border-primary/20">
              <SelectValue placeholder="Todos os serviços" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os serviços</SelectItem>
              {providers.map(provider => {
                const count = getProviderCount(provider.id);
                return (
                  <SelectItem 
                    key={provider.id} 
                    value={provider.id.toString()}
                    disabled={count === 0}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{provider.name}</span>
                      {count > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {count}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Botão para limpar filtro */}
        {selectedProvider && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onProviderChange(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Badge do filtro ativo */}
      {selectedProvider && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtro ativo:</span>
          <Badge variant="default" className="flex items-center gap-1">
            <Tv className="w-3 h-3" />
            {getProviderName(selectedProvider)}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-1 text-current hover:bg-transparent"
              onClick={() => onProviderChange(null)}
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
          Carregando dados de streaming...
        </div>
      )}

      {/* Estatísticas de streaming */}
      {streamingStats.length > 0 && !isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {streamingStats
            .filter(stat => stat.count > 0)
            .sort((a, b) => b.count - a.count)
            .map(stat => (
              <button
                key={stat.id}
                onClick={() => onProviderChange(stat.id)}
                className={`
                  text-left p-2 rounded-lg border transition-colors
                  ${selectedProvider === stat.id 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-secondary/50 border-secondary hover:bg-secondary/80'
                  }
                `}
              >
                <div className="text-sm font-medium truncate">{stat.name}</div>
                <div className="text-xs opacity-70">{stat.count} itens</div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};