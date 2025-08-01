import { useState, useRef } from 'react';
import { getPopularMovies } from '@/utils/tmdb';

interface Trailer {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
  movieTitle: string;
  movieId: number;
}

interface Movie {
  id: number;
  title: string;
  original_title: string;
}

export const useTrailers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTrailer, setCurrentTrailer] = useState<Trailer | null>(null);
  const [recentTrailers, setRecentTrailers] = useState<number[]>([]);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [trailerCount, setTrailerCount] = useState(0);
  const moviesCacheRef = useRef<Movie[]>([]);
  const nextTrailerRef = useRef<Trailer | null>(null);

  const populateMoviesCache = async () => {
    if (moviesCacheRef.current.length > 0) return;
    
    try {
      const pages = [1, 2, 3, 4, 5];
      const allMovies: Movie[] = [];
      
      for (const page of pages) {
        const response = await getPopularMovies(page);
        if (response?.results) {
          allMovies.push(...response.results);
        }
      }
      
      moviesCacheRef.current = allMovies;
    } catch (error) {
      console.error('Error populating movies cache:', error);
    }
  };

  const getRandomTrailer = async (useCache = false): Promise<Trailer | null> => {
    setIsLoading(true);
    
    try {
      let movies: Movie[] = [];
      
      if (useCache && moviesCacheRef.current.length > 0) {
        movies = moviesCacheRef.current;
      } else {
        const randomPage = Math.floor(Math.random() * 5) + 1;
        const response = await getPopularMovies(randomPage);
        
        if (!response || !response.results || response.results.length === 0) {
          return null;
        }
        movies = response.results;
      }

      // Filtrar filmes que não foram vistos recentemente
      const availableMovies = movies.filter(
        movie => !recentTrailers.includes(movie.id)
      );
      
      // Se todos foram vistos, limpar histórico e usar todos
      const moviesToCheck = availableMovies.length > 0 ? availableMovies : movies;
      if (availableMovies.length === 0) {
        setRecentTrailers([]);
      }
      
      // Tentar até 5 filmes diferentes para encontrar um trailer
      for (let i = 0; i < Math.min(5, moviesToCheck.length); i++) {
        const randomMovie = moviesToCheck[Math.floor(Math.random() * moviesToCheck.length)];
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
          
          const videosResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${randomMovie.id}/videos?api_key=${localStorage.getItem('tmdb_api_key')}&language=pt-BR`,
            { signal: controller.signal }
          );
          
          clearTimeout(timeoutId);
          const videosData = await videosResponse.json();
          
          if (videosData.results && videosData.results.length > 0) {
            const trailers = videosData.results.filter(
              (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
            );
            
            if (trailers.length > 0) {
              const trailer = trailers[0];
              
              setRecentTrailers(prev => {
                const updated = [randomMovie.id, ...prev].slice(0, 10);
                return updated;
              });
              
              const trailerData: Trailer = {
                id: trailer.id,
                key: trailer.key,
                name: trailer.name,
                type: trailer.type,
                site: trailer.site,
                movieTitle: randomMovie.title || randomMovie.original_title,
                movieId: randomMovie.id
              };
              
              setCurrentTrailer(trailerData);
              return trailerData;
            }
          }
        } catch (error) {
          console.error(`Error fetching videos for movie ${randomMovie.id}:`, error);
          continue;
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

  const preloadNextTrailer = async () => {
    try {
      const trailer = await getRandomTrailer(true);
      nextTrailerRef.current = trailer;
    } catch (error) {
      console.error('Error preloading next trailer:', error);
    }
  };

  const getNextTrailer = async (): Promise<Trailer | null> => {
    if (nextTrailerRef.current) {
      const trailer = nextTrailerRef.current;
      nextTrailerRef.current = null;
      setCurrentTrailer(trailer);
      
      // Preload próximo trailer em background
      setTimeout(preloadNextTrailer, 1000);
      
      return trailer;
    }
    
    return await getRandomTrailer();
  };

  const incrementTrailerCount = () => {
    setTrailerCount(prev => prev + 1);
  };

  const resetTrailerCount = () => {
    setTrailerCount(0);
  };

  const toggleAutoplay = () => {
    setAutoplayEnabled(prev => !prev);
  };

  return {
    getRandomTrailer,
    getNextTrailer,
    currentTrailer,
    isLoading,
    setCurrentTrailer,
    populateMoviesCache,
    preloadNextTrailer,
    autoplayEnabled,
    toggleAutoplay,
    trailerCount,
    incrementTrailerCount,
    resetTrailerCount
  };
};