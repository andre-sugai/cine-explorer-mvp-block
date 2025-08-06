
import { useState } from 'react';
import { getPopularMovies, getTopRatedMovies } from '@/utils/tmdb';

interface Trailer {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
  movieTitle: string;
  movieId: number;
  releaseYear?: string;
}

export const useTrailers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrailer, setCurrentTrailer] = useState<Trailer | null>(null);
  const [recentTrailers, setRecentTrailers] = useState<number[]>([]);

  const getRandomTrailer = async (): Promise<Trailer | null> => {
    setIsLoading(true);
    
    try {
      // Randomly choose between popular movies (50%) and top-rated movies (50%)
      const useTopRated = Math.random() < 0.5;
      const randomPage = Math.floor(Math.random() * 5) + 1;
      
      const response = useTopRated 
        ? await getTopRatedMovies(randomPage)
        : await getPopularMovies(randomPage);
      
      console.log(`Using ${useTopRated ? 'top-rated' : 'popular'} movies for trailer selection`);
      
      if (!response || !response.results || response.results.length === 0) {
        return null;
      }

      // Filtrar filmes que não foram vistos recentemente
      const availableMovies = response.results.filter(
        movie => !recentTrailers.includes(movie.id)
      );
      
      // Se todos foram vistos, limpar histórico
      const moviesToCheck = availableMovies.length > 0 ? availableMovies : response.results;
      
      // Tentar até 5 filmes diferentes para encontrar um trailer
      for (let i = 0; i < Math.min(5, moviesToCheck.length); i++) {
        const randomMovie = moviesToCheck[Math.floor(Math.random() * moviesToCheck.length)];
        
        try {
          // Buscar vídeos do filme
          const videosResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${randomMovie.id}/videos?api_key=${localStorage.getItem('tmdb_api_key')}&language=pt-BR`
          );
          const videosData = await videosResponse.json();
          
          if (videosData.results && videosData.results.length > 0) {
            // Filtrar apenas trailers do YouTube
            const trailers = videosData.results.filter(
              (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
            );
            
            if (trailers.length > 0) {
              const trailer = trailers[0]; // Pegar o primeiro trailer
              
              // Atualizar histórico de trailers recentes
              setRecentTrailers(prev => {
                const updated = [randomMovie.id, ...prev].slice(0, 20); // Manter últimos 20
                return updated;
              });
              
              // Extract year from release date
              const releaseYear = randomMovie.release_date 
                ? new Date(randomMovie.release_date).getFullYear().toString()
                : undefined;
              
              const trailerData: Trailer = {
                id: trailer.id,
                key: trailer.key,
                name: trailer.name,
                type: trailer.type,
                site: trailer.site,
                movieTitle: randomMovie.title || randomMovie.original_title,
                movieId: randomMovie.id,
                releaseYear
              };
              
              setCurrentTrailer(trailerData);
              return trailerData;
            }
          }
        } catch (error) {
          console.error(`Error fetching videos for movie ${randomMovie.id}:`, error);
          continue; // Tentar próximo filme
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting random trailer:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getRandomTrailer,
    currentTrailer,
    isLoading,
    setCurrentTrailer
  };
};
