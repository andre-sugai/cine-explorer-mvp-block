import React, { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { buildImageUrl } from '@/utils/tmdb';
import { useNavigate } from 'react-router-dom';

interface CollectionsGridProps {
  collections: any[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const CollectionsGrid: React.FC<CollectionsGridProps> = ({
  collections,
  isLoading,
  hasMore,
  onLoadMore,
}) => {
  const navigate = useNavigate();
  const observerRef = useRef<IntersectionObserver>();

  // Infinite scroll observer - dispara um pouco antes do final
  const lastElementRefCallback = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            onLoadMore();
          }
        },
        {
          // Carregar quando o elemento estiver 500px antes de aparecer
          rootMargin: '500px',
        }
      );

      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasMore, onLoadMore]
  );

  // Mostrar skeleton apenas no carregamento inicial (quando não há coleções)
  if (isLoading && collections.length === 0) {
    return (
      <div className="px-4 space-y-6 animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-32 w-full rounded-lg bg-secondary/30 mb-6"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
        <div className="text-6xl mb-6">📚</div>
        <h3 className="text-2xl font-bold text-primary mb-2">
          Nenhuma coleção encontrada
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Não conseguimos encontrar coleções populares no momento. Tente
          novamente mais tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {collections.map((collection, index) => {
          // Colocar o observer no penúltimo item para carregar antes
          const isObserverTarget = index === collections.length - 3;
          return (
            <div
              key={collection.id}
              ref={isObserverTarget ? lastElementRefCallback : null}
              className="relative rounded-lg overflow-hidden cursor-pointer group border border-primary/20 hover:border-primary/40 transition-all duration-300"
              style={{
                minHeight: '140px',
              }}
              onClick={() => navigate(`/colecao/${collection.id}`)}
            >
              {/* Background com backdrop da coleção */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: collection.backdrop_path
                    ? `linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.95) 100%), url(${buildImageUrl(
                        collection.backdrop_path,
                        'w1280'
                      )})`
                    : 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(20,20,20,0.9))',
                }}
              />

              {/* Conteúdo */}
              <div className="relative z-10 p-6 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    Faz parte da coleção
                  </p>
                  <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">
                    {collection.name}
                  </h3>
                  {collection.overview && (
                    <p className="text-sm text-foreground/70 mt-2 line-clamp-2 max-w-3xl">
                      {collection.overview}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {collection.parts?.length || 0}{' '}
                    {collection.parts?.length === 1 ? 'filme' : 'filmes'}
                  </p>
                </div>
                <Button className="bg-gradient-gold text-cinema-dark hover:opacity-90 shrink-0 ml-4">
                  Ver Coleção
                </Button>
              </div>
            </div>
          );
        })}

        {/* Loading State - Inline para não causar scroll jump */}
        {isLoading && collections.length > 0 && (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={`loading-${index}`}
                className="h-32 w-full rounded-lg bg-secondary/30"
              />
            ))}
          </div>
        )}

        {/* End Message */}
        {!hasMore && !isLoading && collections.length > 0 && (
          <div className="text-center mt-12 py-8">
            <p className="text-muted-foreground">
              Você chegou ao fim da lista de coleções! 🎬
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
