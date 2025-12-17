import React from 'react';

interface CalendarFiltersProps {
  providers: { provider_id: number; provider_name: string }[];
  selectedProvider: string;
  onProviderChange: (id: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  loadingProviders?: boolean;
}

export const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  providers,
  selectedProvider,
  onProviderChange,
  selectedType,
  onTypeChange,
  loadingProviders
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Streaming Filter */}
      <div className="w-full sm:w-auto min-w-[200px]">
        <label className="block text-sm mb-1 font-medium text-primary">
          Streaming
        </label>
        <select
          value={selectedProvider}
          onChange={(e) => onProviderChange(e.target.value)}
          className="w-full rounded px-3 py-2 bg-secondary/50 border border-primary/20 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          disabled={loadingProviders}
        >
          {loadingProviders ? (
            <option>Carregando...</option>
          ) : (
            <>
              <option value="0">Todos os Streamings</option>
              <option value="my-streamings">Meus Streamings</option>
              <optgroup label="Provedores">
                {providers.filter(p => p.provider_id !== 0).map((provider) => (
                  <option
                    key={provider.provider_id}
                    value={provider.provider_id}
                  >
                    {provider.provider_name}
                  </option>
                ))}
              </optgroup>
            </>
          )}
        </select>
      </div>

      {/* Type Filter */}
      <div className="w-full sm:w-auto min-w-[200px]">
        <label className="block text-sm mb-1 font-medium text-primary">
          Tipo
        </label>
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="w-full rounded px-3 py-2 bg-secondary/50 border border-primary/20 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="all">Todos</option>
          <option value="movie">Filmes</option>
          <option value="tv">Séries</option>
        </select>
      </div>
    </div>
  );
};
