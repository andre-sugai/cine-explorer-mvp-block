
import React, { useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Calendar, Users } from 'lucide-react';
import { TMDBMovie, TMDBTVShow, TMDBPerson, buildImageUrl } from '@/utils/tmdb';
import { useNavigate } from 'react-router-dom';

type ContentCategory = 'movies' | 'tv' | 'actors' | 'directors';

interface ContentGridProps {
  content: (TMDBMovie | TMDBTVShow | TMDBPerson)[];
  category: ContentCategory;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const ContentGrid: React.FC<ContentGridProps> = ({
  content,
  category,
  isLoading,
  hasMore,
  onLoadMore
}) => {
  const navigate = useNavigate();
  const observerRef = useRef<IntersectionObserver>();
  const lastElementRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  const lastElementRefCallback = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isLoading, hasMore, onLoadMore]);

  const handleItemClick = (item: TMDBMovie | TMDBTVShow | TMDBPerson) => {
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

  const renderContentCard = (item: TMDBMovie | TMDBTVShow | TMDBPerson, index: number) => {
    const isLastItem = index === content.length - 1;
    
    return (
      <Card 
        key={`${item.id}-${index}`}
        ref={isLastItem ? lastElementRefCallback : null}
        className="
          group cursor-pointer transition-all duration-300 
          hover:scale-105 hover:shadow-glow border-primary/20
          bg-gradient-cinema overflow-hidden
        "
        onClick={() => handleItemClick(item)}
      >
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={buildImageUrl(
                'poster_path' in item ? item.poster_path : 
                'profile_path' in item ? item.profile_path : '', 
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
          </div>

          {/* Content Info */}
          <div className="p-4">
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
              
              {/* Department for people */}
              {'known_for_department' in item && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {item.known_for_department}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <Card key={`skeleton-${index}`} className="overflow-hidden">
          <CardContent className="p-0">
            <Skeleton className="aspect-[2/3] w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (content.length === 0 && !isLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">
          Nenhum conteúdo encontrado para esta categoria.
        </p>
      </div>
    );
  }

  return (
    <section className="px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Content Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {content.map((item, index) => renderContentCard(item, index))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-12">
            {renderLoadingSkeleton()}
          </div>
        )}

        {/* End Message */}
        {!hasMore && content.length > 0 && (
          <div className="text-center mt-12 py-8">
            <p className="text-muted-foreground">
              Você chegou ao fim da lista! 🎬
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
