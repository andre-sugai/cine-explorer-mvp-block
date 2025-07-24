import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Star } from 'lucide-react';
import { getCollectionDetails, buildImageUrl, TMDBCollection } from '@/utils/tmdb';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const CollectionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<TMDBCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const collectionTitle = searchParams.get('title') || 'Coleção';

  useEffect(() => {
    const fetchCollection = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCollectionDetails(parseInt(id));
        setCollection(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar coleção');
        console.error('Error fetching collection:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollection();
  }, [id]);

  const handleMovieClick = (movieId: number, movieTitle: string) => {
    navigate(`/filme/${movieId}?title=${encodeURIComponent(movieTitle)}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data não informada';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatYear = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).getFullYear().toString();
  };

  // Ordenar filmes por data de lançamento (cronológica)
  const sortedMovies = collection?.parts?.sort((a, b) => {
    const dateA = new Date(a.release_date || '1900-01-01');
    const dateB = new Date(b.release_date || '1900-01-01');
    return dateA.getTime() - dateB.getTime();
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Loading do Header */}
        <div className="relative h-80 bg-muted">
          <Skeleton className="w-full h-full" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="w-full aspect-[2/3] rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {error || 'Coleção não encontrada'}
          </h1>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header com Backdrop */}
      <div 
        className="relative h-80 bg-cover bg-center"
        style={{
          backgroundImage: collection.backdrop_path 
            ? `url(${buildImageUrl(collection.backdrop_path, 'w1280')})`
            : 'linear-gradient(135deg, hsl(var(--muted)), hsl(var(--muted-foreground)))'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Conteúdo do Header */}
        <div className="relative h-full flex items-end">
          <div className="max-w-7xl mx-auto px-4 pb-8 w-full">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => navigate('/')}
                className="bg-black/20 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <Breadcrumbs 
                items={[
                  { label: 'Início', href: '/' },
                  { label: 'Coleções', href: '/' },
                  { label: collection.name, href: '' }
                ]}
                className="text-white"
              />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {collection.name}
            </h1>
            
            {collection.overview && (
              <p className="text-lg text-white/90 max-w-3xl leading-relaxed">
                {collection.overview}
              </p>
            )}
            
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                {sortedMovies.length} {sortedMovies.length === 1 ? 'filme' : 'filmes'}
              </Badge>
              
              {sortedMovies.length > 0 && sortedMovies[0]?.release_date && sortedMovies[sortedMovies.length - 1]?.release_date && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                  <Calendar className="mr-1 h-3 w-3" />
                  {formatYear(sortedMovies[0].release_date)} - {formatYear(sortedMovies[sortedMovies.length - 1].release_date)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Filmes */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Filmes da Coleção (Ordem Cronológica)
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedMovies.map((movie) => (
            <Card
              key={movie.id}
              className="group cursor-pointer overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105"
              onClick={() => handleMovieClick(movie.id, movie.title)}
            >
              <CardContent className="p-0">
                {/* Poster */}
                <div className="aspect-[2/3] relative overflow-hidden">
                  <img
                    src={buildImageUrl(movie.poster_path, 'w500')}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  
                  {/* Overlay com Rating */}
                  {movie.vote_average > 0 && (
                    <div className="absolute top-2 right-2 bg-black/80 rounded-full px-2 py-1 flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-white font-medium">
                        {movie.vote_average.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Informações */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {movie.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatYear(movie.release_date)}</span>
                    {movie.vote_count > 0 && (
                      <span>{movie.vote_count} avaliações</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {sortedMovies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum filme encontrado nesta coleção.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};