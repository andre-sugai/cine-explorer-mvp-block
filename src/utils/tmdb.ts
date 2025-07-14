// TMDB API utilities
// This file contains helper functions for interacting with The Movie Database API

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const getApiKey = (): string | null => {
  return localStorage.getItem('tmdb_api_key');
};

export const buildImageUrl = (path: string, size: string = 'w500'): string => {
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const buildApiUrl = (endpoint: string, params: Record<string, string> = {}): string => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API key not found');
  }

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', apiKey);
  url.searchParams.append('language', 'pt-BR');

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  return url.toString();
};

// Example API calls (to be implemented in future versions)
export const searchMovies = async (query: string) => {
  // Implementation will be added when movie search functionality is needed
  console.log('Search movies:', query);
};

export const getMovieDetails = async (id: number) => {
  // Implementation will be added when movie details are needed
  console.log('Get movie details:', id);
};

export const getTrendingMovies = async () => {
  // Implementation will be added when trending movies are needed
  console.log('Get trending movies');
};

export const getPopularMovies = async () => {
  // Implementation will be added when popular movies are needed
  console.log('Get popular movies');
};