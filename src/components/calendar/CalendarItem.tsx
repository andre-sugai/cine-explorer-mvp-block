import React from 'react';
import { Link } from 'react-router-dom';
import { TMDBContent, buildImageUrl } from '@/utils/tmdb';
import { useStreamingProvider } from '@/hooks/useStreamingProvider';
import { Clapperboard } from 'lucide-react';

interface CalendarItemProps {
  item: TMDBContent;
}

export const CalendarItem: React.FC<CalendarItemProps> = ({ item }) => {
  const type = item.media_type === 'tv' ? 'tv' : 'movie';
  const provider = useStreamingProvider(item.id, type);

  return (
    <Link
      to={`/${type === 'tv' ? 'serie' : 'filme'}/${item.id}`}
      className="block"
    >
      <div className="flex items-center gap-2 p-1 rounded hover:bg-white/10 transition-colors tooltip-trigger" title={item.title || item.name}>
        {/* Poster */}
        <div className="w-8 h-10 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
          <img
            src={buildImageUrl(item.poster_path, 'w92')}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-200 truncate">
            {item.title || item.name}
          </p>
          <p className="text-[10px] text-gray-500 uppercase">
            {item.media_type === 'tv' ? 'Série' : 'Filme'}
          </p>
        </div>

        {/* Streaming Logo or Fallback */}
        <div className="flex-shrink-0">
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
    </Link>
  );
};
