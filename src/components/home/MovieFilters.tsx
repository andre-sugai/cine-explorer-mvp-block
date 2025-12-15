import React from 'react';

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
  studios: { value: string; label: string }[];
  selectedStudio: string;
  onStudioChange: (id: string) => void;
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
  selectedRuntime: string;
  onRuntimeChange: (value: string) => void;
  selectedVoteCount: string;
  onVoteCountChange: (value: string) => void;
  selectedKeyword: string;
  onKeywordChange: (value: string) => void;
  selectedRating: string;
  onRatingChange: (value: string) => void;
}

export const MovieFilters: React.FC<MovieFiltersProps> = ({
  providers,
  selectedProvider,
  onProviderChange,
  studios,
  selectedStudio,
  onStudioChange,
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
  selectedRuntime,
  onRuntimeChange,
  selectedVoteCount,
  onVoteCountChange,
  selectedKeyword,
  onKeywordChange,
  selectedRating,
  onRatingChange,
}) => {
  return (
    <div className="px-4 my-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* Dropdown de Streaming */}
          <div className="w-full">
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

          {/* Dropdown de Estúdios */}
          <div className="w-full">
            <label className="block text-sm mb-1 font-medium text-primary">
              Estúdios
            </label>
            <select
              value={selectedStudio}
              onChange={(e) => onStudioChange(e.target.value)}
              className="w-full rounded px-3 py-2 bg-secondary/50 border border-primary/20"
            >
              {studios.map((studio) => (
                <option key={studio.value} value={studio.value}>
                  {studio.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown de Gêneros */}
          <div className="w-full">
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
          <div className="w-full">
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
          <div className="w-full">
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
          <div className="w-full">
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

          {/* Dropdown de Duração */}
          <div className="w-full">
            <label className="block text-sm mb-1 font-medium text-primary">
              Duração
            </label>
            <select
              value={selectedRuntime}
              onChange={(e) => onRuntimeChange(e.target.value)}
              className="w-full rounded px-3 py-2 bg-secondary/50 border border-primary/20"
            >
              <option value="">Qualquer</option>
              <option value="90">Menos de 90 min</option>
              <option value="120">Menos de 2h</option>
              <option value="180">Menos de 3h</option>
            </select>
          </div>

          {/* Dropdown de Votos */}
          <div className="w-full">
            <label className="block text-sm mb-1 font-medium text-primary">
              Avaliações
            </label>
            <select
              value={selectedVoteCount}
              onChange={(e) => onVoteCountChange(e.target.value)}
              className="w-full rounded px-3 py-2 bg-secondary/50 border border-primary/20"
            >
              <option value="">Qualquer</option>
              <option value="100">Mais de 100</option>
              <option value="500">Mais de 500</option>
              <option value="1000">Mais de 1000</option>
            </select>
          </div>

          {/* Dropdown de Notas */}
          <div className="w-full">
            <label className="block text-sm mb-1 font-medium text-primary">
              Nota Mínima
            </label>
            <select
              value={selectedRating}
              onChange={(e) => onRatingChange(e.target.value)}
              className="w-full rounded px-3 py-2 bg-secondary/50 border border-primary/20"
            >
              <option value="">Qualquer nota</option>
              <option value="9">Acima de 9.0</option>
              <option value="8">Acima de 8.0</option>
              <option value="7">Acima de 7.0</option>
              <option value="6">Acima de 6.0</option>
              <option value="5">Acima de 5.0</option>
              <option value="4">Acima de 4.0</option>
              <option value="3">Acima de 3.0</option>
              <option value="2">Acima de 2.0</option>
              <option value="1">Acima de 1.0</option>
            </select>
          </div>

          {/* Input de Palavras-chave (Tema) */}
          <div className="w-full">
            <label className="block text-sm mb-1 font-medium text-primary">
              Tema (Palavra-chave)
            </label>
            <input
              type="text"
              value={selectedKeyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              placeholder="Ex: viagem no tempo..."
              className="w-full rounded px-3 py-2 bg-secondary/50 border border-primary/20 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
