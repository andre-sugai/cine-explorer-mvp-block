
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buildImageUrl } from '@/utils/tmdb';
import { Film, Tv } from 'lucide-react';

interface PersonCreditsProps {
  movieCredits?: {
    cast: Array<{
      id: number;
      title: string;
      character?: string;
      poster_path: string;
      release_date: string;
      popularity: number;
    }>;
  };
  tvCredits?: {
    cast: Array<{
      id: number;
      name: string;
      character?: string;
      poster_path: string;
      first_air_date: string;
      popularity: number;
    }>;
  };
}

const PersonCredits: React.FC<PersonCreditsProps> = ({ movieCredits, tvCredits }) => {
  const navigate = useNavigate();

  const topMovies = movieCredits?.cast
    ?.sort((a, b) => b.popularity - a.popularity)
    ?.slice(0, 8) || [];

  const topTVShows = tvCredits?.cast
    ?.sort((a, b) => b.popularity - a.popularity)
    ?.slice(0, 8) || [];

  const allCredits = [
    ...(movieCredits?.cast?.map(movie => ({ ...movie, media_type: 'movie' })) || []),
    ...(tvCredits?.cast?.map(show => ({ ...show, media_type: 'tv', title: show.name, release_date: show.first_air_date })) || [])
  ].sort((a, b) => new Date(b.release_date || '').getTime() - new Date(a.release_date || '').getTime());

  return (
    <div className="space-y-6">
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
              {topMovies.map((movie) => (
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
              {topTVShows.map((show) => (
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

      {/* Filmografia Completa */}
      {allCredits.length > 0 && (
        <Card className="bg-gradient-cinema border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Filmografia Completa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {allCredits.slice(0, 20).map((credit, index) => (
                <div
                  key={`${credit.id}-${index}`}
                  className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer"
                  onClick={() => navigate(`/${credit.media_type === 'movie' ? 'filme' : 'serie'}/${credit.id}`)}
                >
                  <img
                    src={buildImageUrl(credit.poster_path, 'w185')}
                    alt={credit.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{credit.title}</p>
                    {credit.character && (
                      <p className="text-sm text-muted-foreground">{credit.character}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {credit.release_date ? new Date(credit.release_date).getFullYear() : 'N/A'}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {credit.media_type === 'movie' ? 'Filme' : 'Série'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PersonCredits;
