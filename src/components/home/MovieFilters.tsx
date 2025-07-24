import React from 'react';
// Exemplo de importação dos componentes MVPBlocks, ajuste conforme a doc real
// import { Select, SelectItem } from 'mvpblocks';

interface Provider {
  provider_id: string;
  provider_name: string;
  logo_path: string | null;
}

interface Genre {
  id: number;
  name: string;
}

interface MovieFiltersProps {
  providers: Provider[];
  selectedProvider: string;
  onProviderChange: (id: string) => void;
  genres: Genre[];
  selectedGenre: string;
  onGenreChange: (id: string) => void;
  orderOptions: { value: string; label: string }[];
  selectedOrder: string;
  onOrderChange: (value: string) => void;
  yearOptions: { value: string; label: string }[];
  selectedYear: string;
  onYearChange: (value: string) => void;
  languageOptions: { value: string; label: string }[];
  selectedLanguage: string;
  onLanguageChange: (value: string) => void;
}

export const MovieFilters: React.FC<MovieFiltersProps> = ({
  providers,
  selectedProvider,
  onProviderChange,
  genres,
  selectedGenre,
  onGenreChange,
  orderOptions,
  selectedOrder,
  onOrderChange,
  yearOptions,
  selectedYear,
  onYearChange,
  languageOptions,
  selectedLanguage,
  onLanguageChange,
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center py-6">
      {/* Dropdown de Streaming */}
      <div className="min-w-[200px]">
        <label className="block text-sm mb-1 font-medium text-primary">
          Streaming
        </label>
        <select
          value={selectedProvider}
          onChange={(e) => onProviderChange(e.target.value)}
          className="w-full rounded px-3 py-2 bg-secondary/50 border border-primary/20"
        >
          {providers.map((provider) => (
            <option
              key={provider.provider_id || 'all'}
              value={provider.provider_id}
            >
              {provider.provider_name}
            </option>
          ))}
        </select>
      </div>
      {/* Dropdown de Gêneros */}
      <div className="min-w-[180px]">
        <label className="block text-sm mb-1 font-medium text-primary">
          Gêneros
        </label>
        <select
          value={selectedGenre}
          onChange={(e) => onGenreChange(e.target.value)}
          className="w-full rounded px-3 py-2 bg-secondary/50 border border-primary/20"
        >
          <option value="">Todos os gêneros</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id.toString()}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>
      {/* Dropdown de Ordenação */}
      <div className="min-w-[180px]">
        <label className="block text-sm mb-1 font-medium text-primary">
          Ordenação
        </label>
        <select
          value={selectedOrder}
          onChange={(e) => onOrderChange(e.target.value)}
          className="w-full rounded px-3 py-2 bg-secondary/50 border border-primary/20"
        >
          {orderOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {/* Dropdown de Ano/Década */}
      <div className="min-w-[140px]">
        <label className="block text-sm mb-1 font-medium text-primary">
          Ano/Década
        </label>
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className="w-full rounded px-3 py-2 bg-secondary/50 border border-primary/20"
        >
          {yearOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {/* Dropdown de Idioma */}
      <div className="min-w-[140px]">
        <label className="block text-sm mb-1 font-medium text-primary">
          Idioma
        </label>
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="w-full rounded px-3 py-2 bg-secondary/50 border border-primary/20"
        >
          {languageOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
