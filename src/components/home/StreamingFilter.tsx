import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface StreamingProvider {
  id: number;
  name: string;
  tier: number;
}

interface StreamingFilterProps {
  selectedStreamings: number[];
  onStreamingChange: (streamingIds: number[]) => void;
}

// Lista completa de streamings organizados por tiers
const streamingProviders: StreamingProvider[] = [
  // TIER 1 - STREAMINGS PRINCIPAIS
  { id: 8, name: "Netflix", tier: 1 },
  { id: 119, name: "Amazon Prime Video", tier: 1 },
  { id: 337, name: "Disney Plus", tier: 1 },
  { id: 307, name: "Globoplay", tier: 1 },
  { id: 384, name: "HBO Max", tier: 1 },
  { id: 350, name: "Apple TV+", tier: 1 },
  { id: 531, name: "Paramount Plus", tier: 1 },
  
  // TIER 2 - STREAMINGS POPULARES
  { id: 283, name: "Crunchyroll", tier: 2 },
  { id: 9, name: "Amazon Video", tier: 2 },
  { id: 3, name: "Google Play Movies", tier: 2 },
  { id: 300, name: "Pluto TV", tier: 2 },
  { id: 167, name: "Claro video", tier: 2 },
  { id: 538, name: "Plex", tier: 2 },
  { id: 269, name: "Funimation", tier: 2 },
  
  // TIER 3 - STREAMINGS ESPECIALIZADOS
  { id: 11, name: "MUBI", tier: 3 },
  { id: 47, name: "Looke", tier: 3 },
  { id: 453, name: "Lionsgate+", tier: 3 },
  { id: 567, name: "Spcine Play", tier: 3 },
  { id: 167, name: "Claro tv+", tier: 3 },
  { id: 563, name: "NetMovies", tier: 3 },
  { id: 567, name: "Filmow", tier: 3 },
  
  // TIER 4 - STREAMINGS NICHO
  { id: 344, name: "Viki", tier: 4 },
  { id: 567, name: "Libreflix", tier: 4 },
  { id: 633, name: "Curiosity Stream", tier: 4 },
  { id: 551, name: "Magellan TV", tier: 4 },
  { id: 567, name: "Belas Artes à La Carte", tier: 4 },
  { id: 567, name: "JustWatchTV", tier: 4 },
  { id: 567, name: "Eventive", tier: 4 },
  
  // TIER 5 - STREAMINGS ESPECIALIZADOS
  { id: 567, name: "Oldflix", tier: 5 },
  { id: 546, name: "WOW Presents Plus", tier: 5 },
  { id: 692, name: "Cultpix", tier: 5 },
  { id: 567, name: "Revry", tier: 5 },
  { id: 567, name: "DOCSVILLE", tier: 5 },
  { id: 567, name: "GOSPEL PLAY", tier: 5 },
  { id: 567, name: "Hoichoi", tier: 5 },
  { id: 567, name: "FilmBox+", tier: 5 },
  { id: 567, name: "Runtime", tier: 5 },
  
  // TIER 6 - STREAMINGS MENORES
  { id: 567, name: "Filmzie", tier: 6 },
  { id: 567, name: "MovieSaints", tier: 6 },
  { id: 567, name: "Dekkoo", tier: 6 },
  { id: 567, name: "True Story", tier: 6 },
  { id: 567, name: "DocAlliance Films", tier: 6 },
  { id: 567, name: "Takflix", tier: 6 },
  { id: 567, name: "Sun Nxt", tier: 6 },
  { id: 567, name: "Univer Video", tier: 6 },
  { id: 567, name: "Reserva Imovision", tier: 6 },
  { id: 567, name: "Shahid VIP", tier: 6 },
  { id: 567, name: "Filmicca", tier: 6 },
  { id: 567, name: "Jolt Film", tier: 6 },
  { id: 567, name: "FOUND TV", tier: 6 },
  { id: 567, name: "Kocowa", tier: 6 },
  { id: 567, name: "Mercado Play", tier: 6 },
  { id: 567, name: "Darkflix", tier: 6 },
  { id: 567, name: "Argo Starzplay", tier: 6 },
];

const tierNames = {
  1: "Principais",
  2: "Populares", 
  3: "Especializados",
  4: "Nicho",
  5: "Especializados",
  6: "Menores"
};

export const StreamingFilter: React.FC<StreamingFilterProps> = ({
  selectedStreamings,
  onStreamingChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar streamings por busca
  const filteredProviders = streamingProviders.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar por tier
  const providersByTier = filteredProviders.reduce((acc, provider) => {
    if (!acc[provider.tier]) {
      acc[provider.tier] = [];
    }
    acc[provider.tier].push(provider);
    return acc;
  }, {} as Record<number, StreamingProvider[]>);

  const handleToggleStreaming = (streamingId: number) => {
    const newSelected = selectedStreamings.includes(streamingId)
      ? selectedStreamings.filter(id => id !== streamingId)
      : [...selectedStreamings, streamingId];
    
    onStreamingChange(newSelected);
  };

  const handleClearAll = () => {
    onStreamingChange([]);
  };

  const getSelectedNames = () => {
    return streamingProviders
      .filter(provider => selectedStreamings.includes(provider.id))
      .map(provider => provider.name);
  };

  const selectedNames = getSelectedNames();
  const displayText = selectedNames.length === 0 
    ? "Selecionar streamings" 
    : selectedNames.length <= 2 
      ? selectedNames.join(", ")
      : `${selectedNames.slice(0, 2).join(", ")} +${selectedNames.length - 2}`;

  return (
    <div className="min-w-[240px]" ref={dropdownRef}>
      <label className="block text-sm mb-1 font-medium text-primary">
        Streamings
      </label>
      
      {/* Dropdown trigger */}
      <Button
        variant="outline"
        className="w-full justify-between text-left bg-secondary/50 border-primary/20 hover:bg-secondary/70"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Selected badges */}
      {selectedNames.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedNames.slice(0, 3).map((name) => (
            <Badge key={name} variant="secondary" className="text-xs">
              {name}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  const provider = streamingProviders.find(p => p.name === name);
                  if (provider) handleToggleStreaming(provider.id);
                }}
              />
            </Badge>
          ))}
          {selectedNames.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{selectedNames.length - 3} mais
            </Badge>
          )}
        </div>
      )}

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-w-sm bg-background border border-border rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Search header */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar streaming..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            {selectedStreamings.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="w-full mt-2 text-xs"
              >
                Limpar todos ({selectedStreamings.length})
              </Button>
            )}
          </div>

          {/* Streamings list */}
          <div className="overflow-y-auto max-h-80">
            {Object.keys(providersByTier)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map(tier => (
                <div key={tier}>
                  {/* Tier header */}
                  <div className="px-3 py-2 bg-muted/50 border-b border-border">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Tier {tier} - {tierNames[parseInt(tier) as keyof typeof tierNames]}
                    </span>
                  </div>
                  
                  {/* Providers in tier */}
                  {providersByTier[parseInt(tier)].map(provider => (
                    <label
                      key={provider.id}
                      className="flex items-center px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectedStreamings.includes(provider.id)}
                            onChange={() => handleToggleStreaming(provider.id)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 border border-border rounded flex items-center justify-center ${
                            selectedStreamings.includes(provider.id) 
                              ? 'bg-primary border-primary' 
                              : 'bg-background'
                          }`}>
                            {selectedStreamings.includes(provider.id) && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                        </div>
                        <span className="text-sm">{provider.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              ))}
            
            {filteredProviders.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Nenhum streaming encontrado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};