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
  selectedStreamings: number[];
  onStreamingChange: (streamingIds: number[]) => void;
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
  selectedStreamings,
  onStreamingChange,
}) => {
  // Lista de streamings com IDs reais da TMDB API para região BR
  const customStreamings = [
    { id: '', name: 'Todos' },
    { id: '337', name: 'Disney Plus' },
    { id: '8', name: 'Netflix' },
    { id: '119', name: 'Amazon Prime Video' },
    { id: '167', name: 'Claro video' },
    { id: '47', name: 'Looke' },
    { id: '531', name: 'Paramount Plus' },
    { id: '384', name: 'HBO Max' },
    { id: '350', name: 'Apple TV+' },
    { id: '307', name: 'Globoplay' },
    { id: '283', name: 'Crunchyroll' },
    { id: '11', name: 'MUBI' },
    { id: '10', name: 'Amazon Video' },
    { id: '3', name: 'Google Play Movies' },
    { id: '62', name: 'NetMovies' },
    { id: '190', name: 'Curiosity Stream' },
    { id: '251', name: 'Belas Artes à La Carte' },
    { id: '444', name: 'Oldflix' },
    { id: '473', name: 'Revry' },
    { id: '475', name: 'DOCSVILLE' },
    { id: '564', name: 'GOSPEL PLAY' },
    { id: '167', name: 'Claro tv+' },
    { id: '492', name: 'Libreflix' },
    { id: '546', name: 'WOW Presents Plus' },
    { id: '551', name: 'Magellan TV' },
    { id: '677', name: 'Filmzie' },
    { id: '559', name: 'MovieSaints' },
    { id: '424', name: 'Dekkoo' },
    { id: '595', name: 'True Story' },
    { id: '569', name: 'DocAlliance Films' },
    { id: '315', name: 'Hoichoi' },
    { id: '300', name: 'Pluto TV' },
    { id: '677', name: 'Eventive' },
    { id: '692', name: 'Cultpix' },
    { id: '701', name: 'FilmBox+' },
    { id: '709', name: 'Takflix' },
    { id: '309', name: 'Sun Nxt' },
    { id: '561', name: 'Univer Video' },
    { id: '343', name: 'Runtime' },
    { id: '559', name: 'Filmow' },
    { id: '251', name: 'Reserva Imovision' },
    { id: '503', name: 'Shahid VIP' },
    { id: '644', name: 'Filmicca' },
    { id: '538', name: 'Plex' },
    { id: '677', name: 'JustWatchTV' },
    { id: '722', name: 'Jolt Film' },
    { id: '725', name: 'FOUND TV' },
    { id: '309', name: 'Kocowa' },
    { id: '167', name: 'Mercado Play' },
    { id: '751', name: 'Darkflix' },
    { id: '269', name: 'Funimation' },
    { id: '755', name: 'Lionsgate+' },
    { id: '758', name: 'Spcine Play' },
    { id: '344', name: 'Viki' },
    { id: '531', name: 'Argo Starzplay' },
  ];

  return (
    <div className="flex flex-wrap gap-4 items-center justify-center my-6">
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
          {customStreamings.map((streaming) => (
            <option
              key={streaming.id || 'all'}
              value={streaming.id}
            >
              {streaming.name}
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
