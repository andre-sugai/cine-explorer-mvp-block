import React from 'react';
import { Link } from 'react-router-dom';
import { TMDBContent, buildImageUrl } from '@/utils/tmdb';
import { useStreamingProvider } from '@/hooks/useStreamingProvider';
import { Clapperboard } from 'lucide-react';
import { MovieCardActions } from '@/components/MovieCardActions';

interface CalendarItemProps {
  item: TMDBContent;
}

export const CalendarItem: React.FC<CalendarItemProps> = ({ item }) => {
  const type = item.media_type === 'tv' ? 'tv' : 'movie';
  const provider = useStreamingProvider(item.id, type);

  return (
    <div className="flex items-start gap-2 p-1 rounded hover:bg-white/10 transition-colors tooltip-trigger group">
      {/* Poster */}
      <Link
        to={`/${type === 'tv' ? 'serie' : 'filme'}/${item.id}`}
        className="flex-shrink-0"
        title={item.title || item.name}
      >
        <div className="w-8 h-10 bg-gray-800 rounded overflow-hidden">
          <img
            src={buildImageUrl(item.poster_path, 'w92')}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      {/* Info & Actions */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <Link
           to={`/${type === 'tv' ? 'serie' : 'filme'}/${item.id}`}
           className="block min-w-0 hover:text-primary transition-colors"
           title={item.title || item.name}
        >
          <p className="text-xs font-medium text-gray-200 leading-tight group-hover:text-primary transition-colors">
            {item.title || item.name}
          </p>
        </Link>
        <p className="text-[10px] text-gray-500 uppercase">
          {item.media_type === 'tv' ? 'Série' : 'Filme'}
        </p>

        {/* Actions - always rendered but maybe with minimal height to prevent layout shift */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity -ml-1">
          <MovieCardActions
            id={item.id}
            title={item.title || item.name || ''}
            poster_path={item.poster_path}
            release_date={item.release_date || item.first_air_date}
            vote_average={item.vote_average}
            genre_ids={item.genre_ids}
            type={type}
            showFavorites={false}
            showWatched={false}
            showBlacklist={false}
            showWantToWatch={true}
            showTrailer={true}
            showGallery={true}
            className="flex items-center gap-1"
            size="compact"
          />
        </div>
      </div>

      {/* Streaming Logo or Fallback */}
      <div className="flex-shrink-0 pt-0.5">
        {provider.logoPath ? (
          <img
            src={provider.logoPath}
            alt={provider.providerName || 'Streaming'}
            title={`Disponível em ${provider.providerName}`}
            className="w-5 h-5 rounded-sm object-cover"
          />
        ) : (
          <div className="w-5 h-5 flex items-center justify-center bg-white/5 rounded-sm" title="Disponível nos cinemas / Não disponível em streaming">
             <Clapperboard className="w-3 h-3 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
};
