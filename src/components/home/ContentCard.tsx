import React, { forwardRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Calendar, Users, Heart } from 'lucide-react';
import { TMDBMovie, TMDBTVShow, TMDBPerson, buildImageUrl } from '@/utils/tmdb';
import { useNavigate } from 'react-router-dom';
import { MovieCardActions } from '@/components/MovieCardActions';
import { useFavoritesContext } from '@/context/FavoritesContext';
import { BlacklistButton } from '@/components/BlacklistButton';
import { AddToListButton } from '@/components/AddToListButton';
import { useStreamingProvider } from '@/hooks/useStreamingProvider';

type ContentCategory = 'movies' | 'tv' | 'actors' | 'directors' | 'cinema';

interface ContentCardProps {
  item: TMDBMovie | TMDBTVShow | TMDBPerson;
  category: ContentCategory;
  onItemClick?: (item: TMDBMovie | TMDBTVShow | TMDBPerson) => void;
}

export const ContentCard = forwardRef<HTMLDivElement, ContentCardProps>(
  ({ item, category, onItemClick }, ref) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const navigate = useNavigate();
    const { addToFavorites, removeFromFavorites, isFavorite } =
      useFavoritesContext();

    React.useEffect(() => {
      // Trigger animation after component mounts
      const timer = setTimeout(() => setIsLoaded(true), 50);
      return () => clearTimeout(timer);
    }, []);

    // Fetch streaming provider
    const streamingProvider = useStreamingProvider(
      item.id,
      'title' in item
        ? 'movie'
        : 'name' in item && 'first_air_date' in item
        ? 'tv'
        : undefined
    );

    const handleItemClick = () => {
      if (onItemClick) {
        onItemClick(item);
      }

      if ('title' in item) {
        // Movie
        navigate(`/filme/${item.id}`);
      } else if ('name' in item && 'first_air_date' in item) {
        // TV Show
        navigate(`/serie/${item.id}`);
      } else if ('name' in item) {
        // Person
        navigate(`/pessoa/${item.id}`);
      }
    };

    // Verifica se é um diretor
    const isDirector =
      category === 'directors' &&
      'known_for_department' in item &&
      (item.known_for_department === 'Directing' ||
        item.known_for_department === 'Direção');

    // Verifica se é um ator
    const isActor =
      category === 'actors' &&
      'known_for_department' in item &&
      (item.known_for_department === 'Acting' ||
        item.known_for_department === 'Atuação');

    // Favorito para diretores
    const directorIsFavorite = isDirector && isFavorite(item.id, 'person');
    // Favorito para atores
    const actorIsFavorite = isActor && isFavorite(item.id, 'person');

    const handleFavoriteDirector = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isDirector) return;
      if (directorIsFavorite) {
        removeFromFavorites(item.id, 'person');
      } else {
        addToFavorites({
          id: item.id,
          type: 'person',
          title: item.name,
          poster_path: 'profile_path' in item ? item.profile_path : undefined,
        });
      }
    };

    const handleFavoriteActor = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isActor) return;
      if (actorIsFavorite) {
        removeFromFavorites(item.id, 'person');
      } else {
        addToFavorites({
          id: item.id,
          type: 'person',
          title: item.name,
          poster_path: 'profile_path' in item ? item.profile_path : undefined,
        });
      }
    };

    return (
      <Card
        ref={ref}
        className={`
          group cursor-pointer transition-all duration-500
          hover:scale-105 hover:shadow-glow border-primary/20
          bg-gradient-cinema overflow-hidden
          ${isLoaded ? 'animate-flip-in' : 'opacity-0'}
        `}
        onClick={handleItemClick}
      >
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={buildImageUrl(
                'poster_path' in item
                  ? item.poster_path
                  : 'profile_path' in item
                  ? item.profile_path
                  : '',
                'w500'
              )}
              alt={'title' in item ? item.title : item.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Rating for movies/tv shows */}
            {'vote_average' in item && item.vote_average > 0 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {item.vote_average.toFixed(1)}
              </div>
            )}
            {/* Botão de favorito para diretores */}
            {isDirector && (
              <button
                onClick={handleFavoriteDirector}
                className={`absolute top-2 left-2 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors ${
                  directorIsFavorite
                    ? 'text-red-500'
                    : 'text-muted-foreground hover:text-red-500'
                }`}
                title={
                  directorIsFavorite
                    ? 'Remover dos favoritos'
                    : 'Adicionar aos favoritos'
                }
              >
                <Heart
                  className={`w-5 h-5 ${
                    directorIsFavorite ? 'fill-current' : ''
                  }`}
                />
              </button>
            )}
            {/* Botão de favorito para atores */}
            {isActor && (
              <button
                onClick={handleFavoriteActor}
                className={`absolute top-2 left-2 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors ${
                  actorIsFavorite
                    ? 'text-red-500'
                    : 'text-muted-foreground hover:text-red-500'
                }`}
                title={
                  actorIsFavorite
                    ? 'Remover dos favoritos'
                    : 'Adicionar aos favoritos'
                }
              >
                <Heart
                  className={`w-5 h-5 ${actorIsFavorite ? 'fill-current' : ''}`}
                />
              </button>
            )}

            {/* Botões AddToList e Blacklist no topo esquerdo */}
            {'title' in item && (
              <div className="absolute top-2 left-2 z-10 flex flex-row gap-2">
                <AddToListButton
                  id={item.id}
                  title={item.title}
                  poster_path={item.poster_path}
                  type="movie"
                />
                <BlacklistButton title={item.title} type="movie" />
              </div>
            )}
            {'name' in item && 'first_air_date' in item && (
              <div className="absolute top-2 left-2 z-10 flex flex-row gap-2">
                <AddToListButton
                  id={item.id}
                  title={item.name}
                  poster_path={
                    'poster_path' in item ? item.poster_path : undefined
                  }
                  type="tv"
                />
                <BlacklistButton title={item.name} type="tv" />
              </div>
            )}
          </div>

          {/* Content Info */}
          <div className="p-4 relative">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="font-semibold text-foreground text-sm leading-tight mb-2 line-clamp-2">
                  {'title' in item ? item.title : item.name}
                </h3>

                <div className="space-y-1 text-xs text-muted-foreground">
                  {/* Release Date / Air Date */}
                  {'release_date' in item && item.release_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.release_date).getFullYear()}
                    </div>
                  )}
                  {'first_air_date' in item && item.first_air_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.first_air_date).getFullYear()}
                    </div>
                  )}

                  {/* Department para pessoas - só exibe se não for diretor nem ator */}
                  {'known_for_department' in item &&
                    !isDirector &&
                    !isActor && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {item.known_for_department}
                      </div>
                    )}
                </div>
              </div>

              {/* Streaming Logo */}
              {streamingProvider.logoPath && (
                <div
                  className="flex-shrink-0 mb-2"
                  title={`Disponível em ${streamingProvider.providerName}`}
                >
                  <img
                    src={streamingProvider.logoPath}
                    alt={streamingProvider.providerName || 'Streaming Service'}
                    className="w-8 h-8 rounded-md object-cover shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Action Icons - Só para filmes e séries */}
            {('title' in item ||
              ('name' in item && 'first_air_date' in item)) && (
              <div className="mt-2">
                <MovieCardActions
                  id={item.id}
                  title={'title' in item ? item.title : item.name}
                  poster_path={
                    'poster_path' in item ? item.poster_path : undefined
                  }
                  release_date={
                    'release_date' in item
                      ? item.release_date
                      : 'first_air_date' in item
                      ? item.first_air_date
                      : undefined
                  }
                  vote_average={
                    'vote_average' in item ? item.vote_average : undefined
                  }
                  genre_ids={'genre_ids' in item ? item.genre_ids : undefined}
                  type={'title' in item ? 'movie' : 'tv'}
                  showBlacklist={false}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

ContentCard.displayName = 'ContentCard';
