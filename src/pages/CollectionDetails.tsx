import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getCollectionDetails, buildImageUrl, TMDBMovie } from '@/utils/tmdb';
import { Layout } from '@/components/Layout';
import { ChevronLeft } from 'lucide-react';
import { ContentCard } from '@/components/home/ContentCard';
import { useDetailNameContext } from '@/context/DetailNameContext';

const CollectionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setDetailName } = useDetailNameContext();

  const {
    data: collection,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['collection-details', id],
    queryFn: () => getCollectionDetails(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (collection && collection.name) {
      setDetailName(collection.name);
      document.title = `${collection.name} - Cine Explorer`;
    }
  }, [collection, setDetailName]);

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !collection) {
    return (
      <Layout>
        <Card className="bg-gradient-cinema border-destructive/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Erro ao carregar coleção
            </h3>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar os detalhes da coleção.
            </p>
            <Button onClick={() => navigate('/')}>Voltar ao início</Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  // Ordenar filmes por data de lançamento
  const sortedParts = collection.parts
    ? [...collection.parts].sort((a: any, b: any) => {
        if (!a.release_date) return 1;
        if (!b.release_date) return -1;
        return (
          new Date(a.release_date).getTime() -
          new Date(b.release_date).getTime()
        );
      })
    : [];

  return (
    <Layout>
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Hero Section */}
        <div
          className="relative rounded-lg overflow-hidden mb-8 min-h-[300px] flex items-end"
          style={{
            backgroundImage: collection.backdrop_path
              ? `linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.3)), url(${buildImageUrl(
                  collection.backdrop_path,
                  'w1280'
                )})`
              : 'linear-gradient(135deg, hsl(var(--cinema-dark)), hsl(var(--cinema-accent)))',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="p-8 w-full">
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <img
                src={buildImageUrl(collection.poster_path, 'w342')}
                alt={collection.name}
                className="w-32 md:w-48 rounded-lg shadow-cinema hidden md:block"
              />
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                  {collection.name}
                </h1>
                {collection.overview && (
                  <p className="text-lg text-foreground/90 max-w-3xl leading-relaxed">
                    {collection.overview}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-4">
                  {collection.parts.length} filmes na coleção
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        <div>
          <h2 className="text-2xl font-bold text-primary mb-6">Filmes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedParts.map((movie: any) => (
              <ContentCard
                key={movie.id}
                item={movie as TMDBMovie}
                category="movies"
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CollectionDetails;
