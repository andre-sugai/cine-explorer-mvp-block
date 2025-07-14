
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getTVShowDetails, buildImageUrl } from '@/utils/tmdb';
import ActionButtons from '@/components/ActionButtons';
import TrailerPlayer from '@/components/TrailerPlayer';
import RecommendedContent from '@/components/RecommendedContent';
import { 
  ChevronLeft, 
  Calendar, 
  Tv, 
  Star, 
  Users,
  Globe 
} from 'lucide-react';

const TVShowDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: show, isLoading, error } = useQuery({
    queryKey: ['tv-details', id],
    queryFn: () => getTVShowDetails(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-24 mb-4" />
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
    );
  }

  if (error || !show) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gradient-cinema border-destructive/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">Erro ao carregar série</h3>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar os detalhes da série.
            </p>
            <Button onClick={() => navigate('/')}>
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      {/* Hero Section */}
      <div 
        className="relative rounded-lg overflow-hidden mb-8"
        style={{
          backgroundImage: show.backdrop_path 
            ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${buildImageUrl(show.backdrop_path, 'w1280')})` 
            : 'linear-gradient(135deg, hsl(var(--cinema-dark)), hsl(var(--cinema-accent)))',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="p-8">
          <div className="grid md:grid-cols-4 gap-8 items-start">
            <div className="md:col-span-1">
              <img
                src={buildImageUrl(show.poster_path, 'w500')}
                alt={show.name}
                className="w-full rounded-lg shadow-cinema"
              />
            </div>
            
            <div className="md:col-span-3 space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-primary mb-2">{show.name}</h1>
                {show.original_name !== show.name && (
                  <p className="text-lg text-muted-foreground mb-4">
                    Título Original: {show.original_name}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {show.genres?.map((genre: any) => (
                    <Badge key={genre.id} variant="secondary">
                      {genre.name}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'}
                    {show.last_air_date && show.status !== 'Returning Series' && 
                      ` - ${new Date(show.last_air_date).getFullYear()}`
                    }
                  </div>
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4" />
                    {show.number_of_seasons} temporada{show.number_of_seasons !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    {show.vote_average.toFixed(1)} ({show.vote_count} avaliações)
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {show.original_language.toUpperCase()}
                  </div>
                </div>

                {show.overview && (
                  <p className="text-foreground leading-relaxed mb-6">
                    {show.overview}
                  </p>
                )}

                <ActionButtons 
                  id={show.id}
                  type="tv"
                  title={show.name}
                  poster_path={show.poster_path}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Informações da Série */}
        <div className="space-y-6">
          <Card className="bg-gradient-cinema border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Status</h4>
                <p className="text-muted-foreground">{show.status}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Temporadas</h4>
                <p className="text-muted-foreground">{show.number_of_seasons}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Episódios</h4>
                <p className="text-muted-foreground">{show.number_of_episodes}</p>
              </div>
              {show.episode_run_time?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Duração</h4>
                  <p className="text-muted-foreground">{show.episode_run_time[0]} min por episódio</p>
                </div>
              )}
              {show.networks?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Emissoras</h4>
                  <div className="space-y-1">
                    {show.networks.slice(0, 3).map((network: any) => (
                      <p key={network.id} className="text-muted-foreground text-sm">
                        {network.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {show.seasons && show.seasons.length > 0 && (
            <Card className="bg-gradient-cinema border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Temporadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {show.seasons
                    .filter((season: any) => season.season_number > 0)
                    .slice(0, 5)
                    .map((season: any) => (
                      <div key={season.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                        <img
                          src={buildImageUrl(season.poster_path, 'w185')}
                          alt={season.name}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-foreground text-sm">{season.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {season.episode_count} episódios
                          </p>
                          {season.air_date && (
                            <p className="text-muted-foreground text-xs">
                              {new Date(season.air_date).getFullYear()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Elenco e Equipe */}
        <div className="md:col-span-2 space-y-6">
          {show.credits?.cast?.length > 0 && (
            <Card className="bg-gradient-cinema border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Elenco Principal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {show.credits.cast.slice(0, 12).map((person: any) => (
                    <div 
                      key={person.id} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer"
                      onClick={() => navigate(`/pessoa/${person.id}`)}
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

          {show.created_by?.length > 0 && (
            <Card className="bg-gradient-cinema border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Criadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {show.created_by.map((creator: any) => (
                    <div 
                      key={creator.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer"
                      onClick={() => navigate(`/pessoa/${creator.id}`)}
                    >
                      <img
                        src={buildImageUrl(creator.profile_path, 'w185')}
                        alt={creator.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{creator.name}</p>
                        <p className="text-muted-foreground text-sm">Criador</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <TrailerPlayer videos={show.videos} />
          
          <RecommendedContent 
            recommendations={show.recommendations}
            type="tv"
            title="Séries Similares"
          />
        </div>
      </div>
    </div>
  );
};

export default TVShowDetails;
