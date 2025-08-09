import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getMovieDetails, buildImageUrl, getMovieImages } from '@/utils/tmdb';
import { translateJob } from '@/utils/translations';
import ActionButtons from '@/components/ActionButtons';
import TrailerPlayer from '@/components/TrailerPlayer';
import RecommendedContent from '@/components/RecommendedContent';
import { Layout } from '@/components/Layout';
import {
  ChevronLeft,
  Calendar,
  Clock,
  Star,
  Users,
  Globe,
  DollarSign,
  PlayCircle,
} from 'lucide-react';
import { useDetailNameContext } from '@/context/DetailNameContext';
import { ImageGallery } from '@/components/ImageGallery';
import WatchProvidersSection from '@/components/WatchProvidersSection';

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setDetailName } = useDetailNameContext();

  const {
    data: movie,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['movie-details', id],
    queryFn: () => getMovieDetails(Number(id)),
    enabled: !!id,
  });

  // Busca imagens extras do filme
  const { data: images, isLoading: isLoadingImages } = useQuery({
    queryKey: ['movie-images', id],
    queryFn: () => getMovieImages(Number(id)),
    enabled: !!id,
  });

  // Update URL with movie title for breadcrumbs and document title
  useEffect(() => {
    if (movie && movie.title) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('title', movie.title);
      window.history.replaceState({}, '', currentUrl.toString());
      document.title = `${movie.title} - Cine Explorer`;
      setDetailName(movie.title);
    }
  }, [movie, setDetailName]);

  // Onde Assistir é carregado por um componente dedicado

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const handleDirectorClick = (directorId: number, directorName: string) => {
    navigate(`/pessoa/${directorId}?name=${encodeURIComponent(directorName)}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-24" />
          <div className="grid md:grid-cols-3 gap-8">
            <Skeleton className="h-96 rounded-lg" />
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !movie) {
    return (
      <Layout>
        <Card className="bg-gradient-cinema border-destructive/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Erro ao carregar filme
            </h3>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar os detalhes do filme.
            </p>
            <Button onClick={() => navigate('/')}>Voltar ao início</Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Hero Section */}
        <div
          className="relative rounded-lg overflow-hidden mb-8"
          style={{
            backgroundImage: movie.backdrop_path
              ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${buildImageUrl(
                  movie.backdrop_path,
                  'w1280'
                )})`
              : 'linear-gradient(135deg, hsl(var(--cinema-dark)), hsl(var(--cinema-accent)))',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="p-8">
            <div className="grid md:grid-cols-4 gap-8 items-start">
              <div className="md:col-span-1">
                <img
                  src={buildImageUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  className="w-full rounded-lg shadow-cinema"
                />
              </div>

              <div className="md:col-span-3 space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-primary mb-2">
                    {movie.title}
                  </h1>
                  {movie.original_title !== movie.title && (
                    <p className="text-lg text-muted-foreground mb-4">
                      Título Original: {movie.original_title}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {movie.genres?.map((genre: any) => (
                      <Badge key={genre.id} variant="secondary">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(movie.release_date).getFullYear()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatRuntime(movie.runtime)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      {movie.vote_average.toFixed(1)} ({movie.vote_count}{' '}
                      avaliações)
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {movie.original_language.toUpperCase()}
                    </div>
                  </div>

                  {movie.overview && (
                    <p className="text-foreground leading-relaxed mb-6">
                      {movie.overview}
                    </p>
                  )}

                  <ActionButtons
                    id={movie.id}
                    type="movie"
                    title={movie.title}
                    poster_path={movie.poster_path}
                    movie={movie}
                  />

                  {/* Onde Assistir - seção completa de provedores (abaixo dos botões) */}
                  <div className="mt-6">
                    <WatchProvidersSection movieId={movie.id} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Galeria de Imagens Extras */}
        {images &&
          (images.backdrops.length > 0 || images.posters.length > 0) && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary mb-4">
                Galeria de Imagens
              </h2>
              <ImageGallery
                images={[...images.backdrops, ...images.posters]}
                maxThumbs={15}
              />
            </div>
          )}

        {/* Galeria de Vídeos (todos os vídeos disponíveis) */}
        {movie.videos?.results?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-primary mb-4">Vídeos</h2>
            <div className="flex flex-wrap gap-4 overflow-x-auto pb-2">
              {movie.videos.results.map((video: any) => (
                <iframe
                  key={video.key}
                  width="320"
                  height="180"
                  src={`https://www.youtube.com/embed/${video.key}`}
                  title={video.name}
                  className="rounded-lg shadow-cinema"
                  allowFullScreen
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Informações Técnicas */}
          <div className="space-y-6">
            <Card className="bg-gradient-cinema border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {movie.budget > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Orçamento
                    </h4>
                    <p className="text-muted-foreground">
                      {formatCurrency(movie.budget)}
                    </p>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Receita
                    </h4>
                    <p className="text-muted-foreground">
                      {formatCurrency(movie.revenue)}
                    </p>
                  </div>
                )}
                {movie.production_companies?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Produção
                    </h4>
                    <div className="space-y-1">
                      {movie.production_companies
                        .slice(0, 3)
                        .map((company: any) => (
                          <p
                            key={company.id}
                            className="text-muted-foreground text-sm"
                          >
                            {company.name}
                          </p>
                        ))}
                    </div>
                  </div>
                )}
                {movie.production_countries?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Países
                    </h4>
                    <p className="text-muted-foreground">
                      {movie.production_countries
                        .map((country: any) => country.name)
                        .join(', ')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Elenco e Equipe */}
          <div className="md:col-span-2 space-y-6">
            {movie.credits?.cast?.length > 0 && (
              <Card className="bg-gradient-cinema border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Elenco Principal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {movie.credits.cast.slice(0, 12).map((person: any) => (
                      <div
                        key={person.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer"
                        onClick={() =>
                          navigate(
                            `/pessoa/${person.id}?name=${encodeURIComponent(
                              person.name
                            )}`
                          )
                        }
                      >
                        <img
                          src={buildImageUrl(person.profile_path, 'w185')}
                          alt={person.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">
                            {person.name}
                          </p>
                          <p className="text-muted-foreground text-xs truncate">
                            {person.character}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {movie.credits?.crew?.length > 0 && (
              <Card className="bg-gradient-cinema border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary">Equipe Técnica</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {movie.credits.crew
                      .filter((person: any) =>
                        [
                          'Director',
                          'Producer',
                          'Writer',
                          'Screenplay',
                        ].includes(person.job)
                      )
                      .slice(0, 12)
                      .map((person: any, index: number) => (
                        <div
                          key={`${person.id}-${index}`}
                          className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer"
                          onClick={() =>
                            navigate(
                              `/pessoa/${person.id}?name=${encodeURIComponent(
                                person.name
                              )}`
                            )
                          }
                        >
                          <img
                            src={buildImageUrl(person.profile_path, 'w185')}
                            alt={person.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground text-sm truncate">
                              {person.name}
                            </p>
                            <p className="text-muted-foreground text-xs truncate">
                              {translateJob(person.job)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <TrailerPlayer videos={movie.videos} />

            <RecommendedContent
              recommendations={movie.recommendations}
              type="movie"
              title="Filmes Similares"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MovieDetails;
