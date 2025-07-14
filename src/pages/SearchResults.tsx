
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  searchMulti, 
  searchMovies, 
  searchTVShows, 
  searchPeople, 
  getPopularMovies,
  getPopularTVShows,
  getPopularPeople,
  buildImageUrl,
  type TMDBMovie,
  type TMDBTVShow,
  type TMDBPerson 
} from '@/utils/tmdb';
import { 
  Film, 
  Tv, 
  User, 
  Calendar, 
  Star, 
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';

const SearchResults: React.FC = () => {
  const { term } = useParams<{ term: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');

  const decodedTerm = term ? decodeURIComponent(term) : '';
  const isSpecialSearch = decodedTerm.startsWith('popular-');

  // Queries para busca geral
  const multiSearchQuery = useQuery({
    queryKey: ['search-multi', decodedTerm, currentPage],
    queryFn: () => searchMulti(decodedTerm, currentPage),
    enabled: !!decodedTerm && !isSpecialSearch,
  });

  // Queries para buscas específicas
  const moviesQuery = useQuery({
    queryKey: ['search-movies', decodedTerm, currentPage],
    queryFn: () => isSpecialSearch && decodedTerm === 'popular-movies' 
      ? getPopularMovies(currentPage) 
      : searchMovies(decodedTerm, currentPage),
    enabled: !!decodedTerm,
  });

  const tvQuery = useQuery({
    queryKey: ['search-tv', decodedTerm, currentPage],
    queryFn: () => isSpecialSearch && decodedTerm === 'popular-tv' 
      ? getPopularTVShows(currentPage) 
      : searchTVShows(decodedTerm, currentPage),
    enabled: !!decodedTerm,
  });

  const peopleQuery = useQuery({
    queryKey: ['search-people', decodedTerm, currentPage],
    queryFn: () => isSpecialSearch && decodedTerm === 'popular-people' 
      ? getPopularPeople(currentPage) 
      : searchPeople(decodedTerm, currentPage),
    enabled: !!decodedTerm,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [decodedTerm]);

  const getPageTitle = () => {
    if (isSpecialSearch) {
      switch (decodedTerm) {
        case 'popular-movies': return 'Filmes Populares';
        case 'popular-tv': return 'Séries Populares';
        case 'popular-people': return 'Pessoas Populares';
        case 'popular-directors': return 'Diretores Populares';
        default: return 'Resultados';
      }
    }
    return `Resultados para "${decodedTerm}"`;
  };

  const MovieCard: React.FC<{ movie: TMDBMovie }> = ({ movie }) => (
    <Card 
      className="bg-gradient-cinema border-primary/20 hover:shadow-glow transition-all duration-300 cursor-pointer transform hover:scale-105"
      onClick={() => navigate(`/filme/${movie.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img
            src={buildImageUrl(movie.poster_path, 'w185')}
            alt={movie.title}
            className="w-20 h-28 object-cover rounded-md"
          />
          <div className="flex-1 space-y-2">
            <h3 className="font-bold text-foreground line-clamp-2">{movie.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">{movie.vote_average.toFixed(1)}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{movie.overview}</p>
            <Button variant="outline" size="sm" className="w-full">
              Ver Detalhes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TVCard: React.FC<{ show: TMDBTVShow }> = ({ show }) => (
    <Card 
      className="bg-gradient-cinema border-primary/20 hover:shadow-glow transition-all duration-300 cursor-pointer transform hover:scale-105"
      onClick={() => navigate(`/serie/${show.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img
            src={buildImageUrl(show.poster_path, 'w185')}
            alt={show.name}
            className="w-20 h-28 object-cover rounded-md"
          />
          <div className="flex-1 space-y-2">
            <h3 className="font-bold text-foreground line-clamp-2">{show.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'}
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">{show.vote_average.toFixed(1)}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{show.overview}</p>
            <Button variant="outline" size="sm" className="w-full">
              Ver Detalhes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PersonCard: React.FC<{ person: TMDBPerson }> = ({ person }) => (
    <Card 
      className="bg-gradient-cinema border-primary/20 hover:shadow-glow transition-all duration-300 cursor-pointer transform hover:scale-105"
      onClick={() => navigate(`/pessoa/${person.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img
            src={buildImageUrl(person.profile_path, 'w185')}
            alt={person.name}
            className="w-20 h-28 object-cover rounded-md"
          />
          <div className="flex-1 space-y-2">
            <h3 className="font-bold text-foreground">{person.name}</h3>
            <Badge variant="secondary" className="text-xs">
              {person.known_for_department}
            </Badge>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Conhecido por:</p>
              {person.known_for.slice(0, 3).map((item) => (
                <p key={item.id} className="text-xs text-foreground line-clamp-1">
                  {'title' in item ? item.title : item.name}
                </p>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Ver Detalhes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="bg-gradient-cinema border-primary/20">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Skeleton className="w-20 h-28 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const ErrorMessage = ({ message }: { message: string }) => (
    <Card className="bg-gradient-cinema border-destructive/20">
      <CardContent className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Erro na busca</h3>
        <p className="text-muted-foreground">{message}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/')}
        >
          Voltar ao início
        </Button>
      </CardContent>
    </Card>
  );

  const NoResults = () => (
    <Card className="bg-gradient-cinema border-primary/20">
      <CardContent className="p-8 text-center">
        <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum resultado encontrado</h3>
        <p className="text-muted-foreground mb-4">
          Tente usar palavras-chave diferentes ou verifique a ortografia.
        </p>
        <Button 
          variant="outline"
          onClick={() => navigate('/')}
        >
          Nova Busca
        </Button>
      </CardContent>
    </Card>
  );

  const Pagination = ({ totalPages, currentPage, onPageChange }: { 
    totalPages: number; 
    currentPage: number; 
    onPageChange: (page: number) => void; 
  }) => (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-sm text-muted-foreground px-4">
        Página {currentPage} de {Math.min(totalPages, 500)}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= Math.min(totalPages, 500)}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );

  if (!decodedTerm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="Termo de busca não encontrado" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold text-primary mb-2">
          {getPageTitle()}
        </h1>
        {!isSpecialSearch && (
          <p className="text-muted-foreground">
            Encontramos resultados em diferentes categorias
          </p>
        )}
      </div>

      {isSpecialSearch ? (
        // Layout simples para buscas especiais (populares)
        <div className="space-y-6">
          {decodedTerm === 'popular-movies' && (
            <>
              {moviesQuery.isLoading && <LoadingSkeleton />}
              {moviesQuery.error && <ErrorMessage message="Erro ao carregar filmes populares" />}
              {moviesQuery.data?.results && (
                <>
                  <div className="space-y-4">
                    {moviesQuery.data.results.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                  <Pagination
                    totalPages={moviesQuery.data.total_pages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </>
          )}

          {decodedTerm === 'popular-tv' && (
            <>
              {tvQuery.isLoading && <LoadingSkeleton />}
              {tvQuery.error && <ErrorMessage message="Erro ao carregar séries populares" />}
              {tvQuery.data?.results && (
                <>
                  <div className="space-y-4">
                    {tvQuery.data.results.map((show) => (
                      <TVCard key={show.id} show={show} />
                    ))}
                  </div>
                  <Pagination
                    totalPages={tvQuery.data.total_pages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </>
          )}

          {decodedTerm === 'popular-people' && (
            <>
              {peopleQuery.isLoading && <LoadingSkeleton />}
              {peopleQuery.error && <ErrorMessage message="Erro ao carregar pessoas populares" />}
              {peopleQuery.data?.results && (
                <>
                  <div className="space-y-4">
                    {peopleQuery.data.results.map((person) => (
                      <PersonCard key={person.id} person={person} />
                    ))}
                  </div>
                  <Pagination
                    totalPages={peopleQuery.data.total_pages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </>
          )}
        </div>
      ) : (
        // Layout com abas para busca geral
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-md mb-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Todos
            </TabsTrigger>
            <TabsTrigger value="movies" className="flex items-center gap-2">
              <Film className="w-4 h-4" />
              Filmes
            </TabsTrigger>
            <TabsTrigger value="tv" className="flex items-center gap-2">
              <Tv className="w-4 h-4" />
              Séries
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Pessoas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {multiSearchQuery.isLoading && <LoadingSkeleton />}
            {multiSearchQuery.error && <ErrorMessage message="Erro ao realizar busca" />}
            {multiSearchQuery.data?.results && (
              <>
                {multiSearchQuery.data.results.length === 0 ? (
                  <NoResults />
                ) : (
                  <>
                    <div className="space-y-4">
                      {multiSearchQuery.data.results.map((item) => {
                        if ('title' in item) {
                          return <MovieCard key={`movie-${item.id}`} movie={item} />;
                        } else if ('name' in item && 'first_air_date' in item) {
                          return <TVCard key={`tv-${item.id}`} show={item} />;
                        } else if ('known_for' in item) {
                          return <PersonCard key={`person-${item.id}`} person={item} />;
                        }
                        return null;
                      })}
                    </div>
                    <Pagination
                      totalPages={multiSearchQuery.data.total_pages}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                    />
                  </>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="movies">
            {moviesQuery.isLoading && <LoadingSkeleton />}
            {moviesQuery.error && <ErrorMessage message="Erro ao buscar filmes" />}
            {moviesQuery.data?.results && (
              <>
                {moviesQuery.data.results.length === 0 ? (
                  <NoResults />
                ) : (
                  <>
                    <div className="space-y-4">
                      {moviesQuery.data.results.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                      ))}
                    </div>
                    <Pagination
                      totalPages={moviesQuery.data.total_pages}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                    />
                  </>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="tv">
            {tvQuery.isLoading && <LoadingSkeleton />}
            {tvQuery.error && <ErrorMessage message="Erro ao buscar séries" />}
            {tvQuery.data?.results && (
              <>
                {tvQuery.data.results.length === 0 ? (
                  <NoResults />
                ) : (
                  <>
                    <div className="space-y-4">
                      {tvQuery.data.results.map((show) => (
                        <TVCard key={show.id} show={show} />
                      ))}
                    </div>
                    <Pagination
                      totalPages={tvQuery.data.total_pages}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                    />
                  </>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="people">
            {peopleQuery.isLoading && <LoadingSkeleton />}
            {peopleQuery.error && <ErrorMessage message="Erro ao buscar pessoas" />}
            {peopleQuery.data?.results && (
              <>
                {peopleQuery.data.results.length === 0 ? (
                  <NoResults />
                ) : (
                  <>
                    <div className="space-y-4">
                      {peopleQuery.data.results.map((person) => (
                        <PersonCard key={person.id} person={person} />
                      ))}
                    </div>
                    <Pagination
                      totalPages={peopleQuery.data.total_pages}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                    />
                  </>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default SearchResults;
