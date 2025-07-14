
// TMDB API utilities
// This file contains helper functions for interacting with The Movie Database API

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const getApiKey = (): string | null => {
  return localStorage.getItem('tmdb_api_key');
};

export const buildImageUrl = (path: string, size: string = 'w500'): string => {
  if (!path) return '/placeholder.svg';
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

// Types
export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  popularity: number;
}

export interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string;
  adult: boolean;
  popularity: number;
  known_for_department: string;
  known_for: (TMDBMovie | TMDBTVShow)[];
}

export interface TMDBSearchResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Multi-search (busca geral)
export const searchMulti = async (query: string, page: number = 1): Promise<TMDBSearchResponse<TMDBMovie | TMDBTVShow | TMDBPerson>> => {
  try {
    const url = buildApiUrl('/search/multi', {
      query: query.trim(),
      page: page.toString(),
      include_adult: 'false'
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching multi:', error);
    throw error;
  }
};

// Busca específica por filmes
export const searchMovies = async (query: string, page: number = 1): Promise<TMDBSearchResponse<TMDBMovie>> => {
  try {
    const url = buildApiUrl('/search/movie', {
      query: query.trim(),
      page: page.toString(),
      include_adult: 'false'
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

// Busca específica por séries
export const searchTVShows = async (query: string, page: number = 1): Promise<TMDBSearchResponse<TMDBTVShow>> => {
  try {
    const url = buildApiUrl('/search/tv', {
      query: query.trim(),
      page: page.toString(),
      include_adult: 'false'
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching TV shows:', error);
    throw error;
  }
};

// Busca específica por pessoas (atores/diretores)
export const searchPeople = async (query: string, page: number = 1): Promise<TMDBSearchResponse<TMDBPerson>> => {
  try {
    const url = buildApiUrl('/search/person', {
      query: query.trim(),
      page: page.toString(),
      include_adult: 'false'
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching people:', error);
    throw error;
  }
};

// Detalhes de filme
export const getMovieDetails = async (id: number) => {
  try {
    const url = buildApiUrl(`/movie/${id}`, {
      append_to_response: 'credits,videos,recommendations'
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting movie details:', error);
    throw error;
  }
};

// Detalhes de série
export const getTVShowDetails = async (id: number) => {
  try {
    const url = buildApiUrl(`/tv/${id}`, {
      append_to_response: 'credits,videos,recommendations'
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting TV show details:', error);
    throw error;
  }
};

// Detalhes de pessoa
export const getPersonDetails = async (id: number) => {
  try {
    const url = buildApiUrl(`/person/${id}`, {
      append_to_response: 'movie_credits,tv_credits'
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting person details:', error);
    throw error;
  }
};

// Trending movies
export const getTrendingMovies = async (timeWindow: 'day' | 'week' = 'week') => {
  try {
    const url = buildApiUrl(`/trending/movie/${timeWindow}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting trending movies:', error);
    throw error;
  }
};

// Popular movies
export const getPopularMovies = async (page: number = 1) => {
  try {
    const url = buildApiUrl('/movie/popular', {
      page: page.toString()
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting popular movies:', error);
    throw error;
  }
};

// Popular TV shows
export const getPopularTVShows = async (page: number = 1) => {
  try {
    const url = buildApiUrl('/tv/popular', {
      page: page.toString()
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting popular TV shows:', error);
    throw error;
  }
};

// Popular people
export const getPopularPeople = async (page: number = 1) => {
  try {
    const url = buildApiUrl('/person/popular', {
      page: page.toString()
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting popular people:', error);
    throw error;
  }
};
