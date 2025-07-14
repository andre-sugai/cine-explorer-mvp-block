
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getPersonDetails, buildImageUrl } from '@/utils/tmdb';
import { 
  ChevronLeft, 
  Calendar, 
  MapPin, 
  Star, 
  Film, 
  Tv,
  Users,
  Award 
} from 'lucide-react';

const PersonDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: person, isLoading, error } = useQuery({
    queryKey: ['person-details', id],
    queryFn: () => getPersonDetails(Number(id)),
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
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gradient-cinema border-destructive/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">Erro ao carregar pessoa</h3>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar os detalhes da pessoa.
            </p>
            <Button onClick={() => navigate('/')}>
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const movieCredits = person.movie_credits?.cast || [];
  const tvCredits = person.tv_credits?.cast || [];
  const directorCredits = person.movie_credits?.crew?.filter((c: any) => c.job === 'Director') || [];

  const topMovies = movieCredits
    .sort((a: any, b: any) => b.popularity - a.popularity)
    .slice(0, 12);

  const topTVShows = tvCredits
    .sort((a: any, b: any) => b.popularity - a.popularity)
    .slice(0, 12);

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

      <div className="grid md:grid-cols-3 gap-8 mb-8">
        {/* Foto e Informações Básicas */}
        <div className="space-y-6">
          <Card className="bg-gradient-cinema border-primary/20">
            <CardContent className="p-6">
              <img
                src={buildImageUrl(person.profile_path, 'w500')}
                alt={person.name}
                className="w-full rounded-lg shadow-cinema mb-4"
              />
              <h1 className="text-2xl font-bold text-primary mb-4">{person.name}</h1>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="secondary">{person.known_for_department}</Badge>
                </div>
                
                {person.birthday && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(person.birthday).toLocaleDateString('pt-BR')}
                    {person.deathday && ` - ${new Date(person.deathday).toLocaleDateString('pt-BR')}`}
                  </div>
                )}
                
                {person.place_of_birth && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {person.place_of_birth}
                  </div>
                )}

                {person.popularity && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4" />
                    Popularidade: {person.popularity.toFixed(1)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card className="bg-gradient-cinema border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Filmes</span>
                <span className="font-semibold text-foreground">{movieCredits.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Séries</span>
                <span className="font-semibold text-foreground">{tvCredits.length}</span>
              </div>
              {directorCredits.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Como Diretor</span>
                  <span className="font-semibold text-foreground">{directorCredits.length}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Biografia e Filmografia */}
        <div className="md:col-span-2 space-y-6">
          {person.biography && (
            <Card className="bg-gradient-cinema border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Biografia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {person.biography}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Filmes Principais */}
          {topMovies.length > 0 && (
            <Card className="bg-gradient-cinema border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Film className="w-5 h-5" />
                  Filmes Principais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {topMovies.map((movie: any) => (
                    <div
                      key={movie.id}
                      className="cursor-pointer transform hover:scale-105 transition-transform"
                      onClick={() => navigate(`/filme/${movie.id}`)}
                    >
                      <img
                        src={buildImageUrl(movie.poster_path, 'w342')}
                        alt={movie.title}
                        className="w-full rounded-lg shadow-md"
                      />
                      <div className="mt-2">
                        <p className="text-sm text-foreground line-clamp-2 font-medium">
                          {movie.title}
                        </p>
                        {movie.character && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {movie.character}
                          </p>
                        )}
                        {movie.release_date && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(movie.release_date).getFullYear()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Séries Principais */}
          {topTVShows.length > 0 && (
            <Card className="bg-gradient-cinema border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Tv className="w-5 h-5" />
                  Séries Principais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {topTVShows.map((show: any) => (
                    <div
                      key={show.id}
                      className="cursor-pointer transform hover:scale-105 transition-transform"
                      onClick={() => navigate(`/serie/${show.id}`)}
                    >
                      <img
                        src={buildImageUrl(show.poster_path, 'w342')}
                        alt={show.name}
                        className="w-full rounded-lg shadow-md"
                      />
                      <div className="mt-2">
                        <p className="text-sm text-foreground line-clamp-2 font-medium">
                          {show.name}
                        </p>
                        {show.character && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {show.character}
                          </p>
                        )}
                        {show.first_air_date && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(show.first_air_date).getFullYear()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Direção (se aplicável) */}
          {directorCredits.length > 0 && (
            <Card className="bg-gradient-cinema border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Como Diretor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {directorCredits.slice(0, 8).map((movie: any) => (
                    <div
                      key={movie.id}
                      className="cursor-pointer transform hover:scale-105 transition-transform"
                      onClick={() => navigate(`/filme/${movie.id}`)}
                    >
                      <img
                        src={buildImageUrl(movie.poster_path, 'w342')}
                        alt={movie.title}
                        className="w-full rounded-lg shadow-md"
                      />
                      <div className="mt-2">
                        <p className="text-sm text-foreground line-clamp-2 font-medium">
                          {movie.title}
                        </p>
                        <p className="text-xs text-muted-foreground">Diretor</p>
                        {movie.release_date && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(movie.release_date).getFullYear()}
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
      </div>
    </div>
  );
};

export default PersonDetails;
