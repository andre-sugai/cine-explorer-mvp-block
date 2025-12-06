import React, { useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TMDBMovie, TMDBTVShow, TMDBPerson } from '@/utils/tmdb';
import { ContentCard } from './ContentCard';

type ContentCategory = 'movies' | 'tv' | 'actors' | 'directors' | 'cinema';

interface ContentGridProps {
  content: (TMDBMovie | TMDBTVShow | TMDBPerson)[];
  category: ContentCategory;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onItemClick?: () => void; // Callback para salvar estado antes de navegar
}

export const ContentGrid: React.FC<ContentGridProps> = ({
  content,
  category,
  isLoading,
  hasMore,
  onLoadMore,
  onItemClick,
}) => {
  const observerRef = useRef<IntersectionObserver>();

  // Filtra apenas diretores quando a categoria for 'directors'
  const filteredContent = React.useMemo(() => {
    console.log('🔍 ContentGrid - Categoria:', category);
    console.log('🔍 ContentGrid - Conteúdo recebido:', content.length, 'itens');

    if (category === 'directors') {
      const filtered = content.filter(
        (item) =>
          'known_for_department' in item &&
          (item.known_for_department === 'Directing' ||
            item.known_for_department === 'Direção')
      );
      console.log(
        '🔍 ContentGrid - Diretores filtrados:',
        filtered.length,
        'itens'
      );
      if (filtered.length > 0) {
        console.log('🔍 ContentGrid - Primeiro diretor filtrado:', filtered[0]);
      }
      return filtered;
    }
    return content;
  }, [content, category]);

  // Infinite scroll observer
  const lastElementRefCallback = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasMore, onLoadMore]
  );

  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: 10 }).map((_, index) => (
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredContent.map((item, index) => {
            const isLastItem = index === filteredContent.length - 1;
            return (
              <div
                key={`${item.id}-${index}`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <ContentCard
                  ref={isLastItem ? lastElementRefCallback : null}
                  item={item}
                  category={category}
                  onItemClick={onItemClick}
                />
              </div>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading && <div className="mt-12">{renderLoadingSkeleton()}</div>}

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
