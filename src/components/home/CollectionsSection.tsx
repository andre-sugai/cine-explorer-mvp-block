import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCollections } from '@/hooks/useCollections';
import { buildImageUrl } from '@/utils/tmdb';

export const CollectionsSection: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { collections, isLoading, error } = useCollections(12);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Largura do card + gap
      const newScrollLeft = scrollRef.current.scrollLeft + 
        (direction === 'right' ? scrollAmount : -scrollAmount);
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleCollectionClick = (collectionId: number, collectionName: string) => {
    navigate(`/colecao/${collectionId}?title=${encodeURIComponent(collectionName)}`);
  };

  if (error) {
    return null; // Não exibir seção se houver erro
  }

  return (
    <section className="px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header da Seção */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Coleções Populares
            </h2>
          </div>
          
          {/* Botões de Navegação */}
          <div className="hidden md:flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              className="h-10 w-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              className="h-10 w-10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Carrossel de Coleções */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {isLoading ? (
            // Loading Skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex-none w-80" style={{ scrollSnapAlign: 'start' }}>
                <Skeleton className="w-full h-48 rounded-lg" />
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))
          ) : (
            // Cards das Coleções
            collections.map((collection) => (
              <Card
                key={collection.id}
                className="flex-none w-80 overflow-hidden group cursor-pointer border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02]"
                style={{ scrollSnapAlign: 'start' }}
                onClick={() => handleCollectionClick(collection.id, collection.name)}
              >
                <CardContent className="p-0 relative">
                  {/* Imagem de Fundo */}
                  <div 
                    className="h-48 bg-cover bg-center relative overflow-hidden"
                    style={{
                      backgroundImage: collection.backdrop_path 
                        ? `url(${buildImageUrl(collection.backdrop_path, 'w780')})`
                        : 'linear-gradient(135deg, hsl(var(--muted)), hsl(var(--muted-foreground)))'
                    }}
                  >
                    {/* Overlay Gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Conteúdo Sobreposto */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-lg font-bold mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                        {collection.name}
                      </h3>
                      <p className="text-sm text-white/80">
                        {collection.parts?.length || 0} {collection.parts?.length === 1 ? 'filme' : 'filmes'}
                      </p>
                    </div>

                    {/* Indicator de Hover */}
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Indicador de que há mais conteúdo (mobile) */}
        {!isLoading && collections.length > 0 && (
          <div className="md:hidden text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Arraste para ver mais coleções →
            </p>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};