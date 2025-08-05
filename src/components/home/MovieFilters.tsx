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
  // Lista personalizada de streamings
  const customStreamings = [
    { id: '', name: 'Todos' },
    { id: 'disney-plus', name: 'Disney Plus' },
    { id: 'netflix', name: 'Netflix' },
    { id: 'amazon-prime', name: 'Amazon Prime Video' },
    { id: 'claro-video', name: 'Claro video' },
    { id: 'looke', name: 'Looke' },
    { id: 'paramount-plus', name: 'Paramount Plus' },
    { id: 'hbo-max', name: 'HBO Max' },
    { id: 'apple-tv', name: 'Apple TV+' },
    { id: 'globoplay', name: 'Globoplay' },
    { id: 'crunchyroll', name: 'Crunchyroll' },
    { id: 'mubi', name: 'MUBI' },
    { id: 'amazon-video', name: 'Amazon Video' },
    { id: 'google-play', name: 'Google Play Movies' },
    { id: 'netmovies', name: 'NetMovies' },
    { id: 'curiosity-stream', name: 'Curiosity Stream' },
    { id: 'belas-artes', name: 'Belas Artes à La Carte' },
    { id: 'oldflix', name: 'Oldflix' },
    { id: 'revry', name: 'Revry' },
    { id: 'docsville', name: 'DOCSVILLE' },
    { id: 'gospel-play', name: 'GOSPEL PLAY' },
    { id: 'claro-tv', name: 'Claro tv+' },
    { id: 'libreflix', name: 'Libreflix' },
    { id: 'wow-presents', name: 'WOW Presents Plus' },
    { id: 'magellan-tv', name: 'Magellan TV' },
    { id: 'filmzie', name: 'ilmzie' },
    { id: 'moviesaints', name: 'MovieSaints' },
    { id: 'dekkoo', name: 'Dekkoo' },
    { id: 'true-story', name: 'True Story' },
    { id: 'docalliance', name: 'DocAlliance Films' },
    { id: 'hoichoi', name: 'Hoichoi' },
    { id: 'pluto-tv', name: 'Pluto TV' },
    { id: 'eventive', name: 'Eventive' },
    { id: 'cultpix', name: 'Cultpix' },
    { id: 'filmbox', name: 'FilmBox+' },
    { id: 'takflix', name: 'Takflix' },
    { id: 'sun-nxt', name: 'Sun Nxt' },
    { id: 'univer-video', name: 'Univer Video' },
    { id: 'runtime', name: 'Runtime' },
    { id: 'filmow', name: 'Filmow' },
    { id: 'reserva-imovision', name: 'Reserva Imovision' },
    { id: 'shahid-vip', name: 'Shahid VIP' },
    { id: 'filmicca', name: 'Filmicca' },
    { id: 'plex', name: 'Plex' },
    { id: 'justwatch-tv', name: 'JustWatchTV' },
    { id: 'jolt-film', name: 'Jolt Film' },
    { id: 'found-tv', name: 'FOUND TV' },
    { id: 'kocowa', name: 'Kocowa' },
    { id: 'mercado-play', name: 'Mercado Play' },
    { id: 'darkflix', name: 'Darkflix' },
    { id: 'funimation', name: 'Funimation' },
    { id: 'lionsgate', name: 'Lionsgate+' },
    { id: 'spcine-play', name: 'Spcine Play' },
    { id: 'viki', name: 'Viki' },
    { id: 'argo-starzplay', name: 'Argo Starzplay' },
  ];

  return (
    <div className="flex flex-wrap gap-4 items-center justify-center my-6">
      {/* Dropdown de Streaming */}
      <div className="min-w-[200px]">
        <label className="block text-sm mb-1 font-medium text-primary">
          Streaming (Antigo)
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
