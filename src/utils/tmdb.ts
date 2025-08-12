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

export const buildApiUrl = (
  endpoint: string,
  params: Record<string, string> = {}
): string => {
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
export const searchMulti = async (
  query: string,
  page: number = 1
): Promise<TMDBSearchResponse<TMDBMovie | TMDBTVShow | TMDBPerson>> => {
  try {
    const url = buildApiUrl('/search/multi', {
      query: query.trim(),
      page: page.toString(),
      include_adult: 'false',
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
export const searchMovies = async (
  query: string,
  page: number = 1
): Promise<TMDBSearchResponse<TMDBMovie>> => {
  try {
    const url = buildApiUrl('/search/movie', {
      query: query.trim(),
      page: page.toString(),
      include_adult: 'false',
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
export const searchTVShows = async (
  query: string,
  page: number = 1
): Promise<TMDBSearchResponse<TMDBTVShow>> => {
  try {
    const url = buildApiUrl('/search/tv', {
      query: query.trim(),
      page: page.toString(),
      include_adult: 'false',
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
export const searchPeople = async (
  query: string,
  page: number = 1
): Promise<TMDBSearchResponse<TMDBPerson>> => {
  try {
    const url = buildApiUrl('/search/person', {
      query: query.trim(),
      page: page.toString(),
      include_adult: 'false',
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
      append_to_response: 'credits,videos,recommendations,similar,keywords',
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
      append_to_response: 'credits,videos,recommendations',
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
      append_to_response: 'movie_credits,tv_credits',
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
export const getTrendingMovies = async (
  timeWindow: 'day' | 'week' = 'week'
) => {
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
      page: page.toString(),
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

// Top rated movies
export const getTopRatedMovies = async (page: number = 1) => {
  try {
    const url = buildApiUrl('/movie/top_rated', {
      page: page.toString(),
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting top rated movies:', error);
    throw error;
  }
};

// Popular TV shows
export const getPopularTVShows = async (page: number = 1) => {
  try {
    const url = buildApiUrl('/tv/popular', {
      page: page.toString(),
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
      page: page.toString(),
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

/**
 * Busca imagens extras (backdrops, posters, stills) de um filme.
 * @param id ID do filme
 * @returns Imagens do filme (backdrops, posters)
 */
export const getMovieImages = async (id: number) => {
  try {
    const url = buildApiUrl(`/movie/${id}/images`, {
      include_image_language: 'en,null,pt',
    });
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting movie images:', error);
    throw error;
  }
};

/**
 * Busca imagens extras de uma série.
 * @param id ID da série
 * @returns Imagens da série (backdrops, posters)
 */
export const getTVShowImages = async (id: number) => {
  try {
    const url = buildApiUrl(`/tv/${id}/images`, {
      include_image_language: 'en,null,pt',
    });
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting TV show images:', error);
    throw error;
  }
};

/**
 * Busca imagens extras de uma pessoa.
 * @param id ID da pessoa
 * @returns Imagens da pessoa (perfis)
 */
export const getPersonImages = async (id: number) => {
  try {
    const url = buildApiUrl(`/person/${id}/images`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting person images:', error);
    throw error;
  }
};

/**
 * Busca provedores de streaming (onde assistir) de um filme.
 * @param id ID do filme
 * @param region Região (padrão 'BR')
 * @returns Provedores de streaming para a região especificada
 */
export const getMovieWatchProviders = async (id: number, region = 'BR') => {
  try {
    const url = buildApiUrl(`/movie/${id}/watch/providers`);
    const response = await fetch(url);
    if (!response.ok) return { flatrate: [], rent: [], buy: [] };
    const data = await response.json();
    return data.results?.[region] || { flatrate: [], rent: [], buy: [] };
  } catch (error) {
    console.error('Error getting movie watch providers:', error);
    return { flatrate: [], rent: [], buy: [] };
  }
};

/**
 * Busca provedores de streaming disponíveis para filmes no país informado.
 * @param region Código do país (ex: 'BR')
 * @returns Array de provedores
 */
export const getWatchProviders = async (region = 'BR') => {
  const url = buildApiUrl('/watch/providers/movie', { watch_region: region });
  const response = await fetch(url);
  if (!response.ok) throw new Error('Erro ao buscar provedores');
  const data = await response.json();
  return data.results || [];
};

/**
 * Busca provedores de streaming disponíveis para uma série específica.
 * @param id ID da série
 * @param region Região (padrão 'BR')
 * @returns Array de provedores disponíveis para a série
 */
export const getTVWatchProviders = async (id: number, region = 'BR') => {
  try {
    const url = buildApiUrl(`/tv/${id}/watch/providers`);
    const response = await fetch(url);
    if (!response.ok) return { flatrate: [], rent: [], buy: [] };
    const data = await response.json();
    return data.results?.[region] || { flatrate: [], rent: [], buy: [] };
  } catch (error) {
    console.error('Error getting TV watch providers:', error);
    return { flatrate: [], rent: [], buy: [] };
  }
};

/**
 * Busca idiomas suportados pela API do TMDB.
 * @returns Array de idiomas
 */
export const getLanguages = async () => {
  const url = buildApiUrl('/configuration/languages', {});
  const response = await fetch(url);
  if (!response.ok) throw new Error('Erro ao buscar idiomas');
  const data = await response.json();
  // Retorna apenas idiomas mais comuns, pode ser filtrado se necessário
  return data.map((lang: any) => ({
    value: lang.iso_639_1,
    label: lang.english_name,
  }));
};

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBGenreResponse {
  genres: TMDBGenre[];
}

// Gêneros padrão como fallback
const defaultGenres = [
  { id: 28, name: 'Ação' },
  { id: 12, name: 'Aventura' },
  { id: 16, name: 'Animação' },
  { id: 35, name: 'Comédia' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentário' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Família' },
  { id: 14, name: 'Fantasia' },
  { id: 36, name: 'História' },
  { id: 27, name: 'Terror' },
  { id: 10402, name: 'Música' },
  { id: 9648, name: 'Mistério' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Ficção Científica' },
  { id: 10770, name: 'Cinema TV' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'Guerra' },
  { id: 37, name: 'Faroeste' },
];

/**
 * Busca gêneros de filmes da API TMDB.
 * @returns Array de gêneros de filmes
 */
export const getMovieGenres = async (): Promise<TMDBGenre[]> => {
  try {
    const url = buildApiUrl('/genre/movie/list');
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar gêneros de filmes');
    const data: TMDBGenreResponse = await response.json();
    return data.genres || defaultGenres;
  } catch (error) {
    console.error('Error getting movie genres:', error);
    return defaultGenres;
  }
};

/**
 * Busca gêneros de séries da API TMDB.
 * @returns Array de gêneros de séries
 */
export const getTVGenres = async (): Promise<TMDBGenre[]> => {
  try {
    const url = buildApiUrl('/genre/tv/list');
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar gêneros de séries');
    const data: TMDBGenreResponse = await response.json();
    return data.genres || defaultGenres;
  } catch (error) {
    console.error('Error getting TV genres:', error);
    return defaultGenres;
  }
};

/**
 * Busca e combina gêneros de filmes e séries, removendo duplicatas.
 * @returns Array de gêneros únicos ordenados alfabeticamente
 */
export const getAllGenres = async (): Promise<TMDBGenre[]> => {
  try {
    const [movieGenres, tvGenres] = await Promise.all([
      getMovieGenres(),
      getTVGenres(),
    ]);

    // Combinar e remover duplicatas
    const genresMap = new Map<number, TMDBGenre>();
    [...movieGenres, ...tvGenres].forEach((genre) => {
      genresMap.set(genre.id, genre);
    });

    // Converter para array e ordenar alfabeticamente
    return Array.from(genresMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  } catch (error) {
    console.error('Error getting all genres:', error);
    return defaultGenres.sort((a, b) => a.name.localeCompare(b.name));
  }
};

/**
 * Busca filmes por gênero específico usando a API discover.
 * @param genreId ID do gênero
 * @param page Número da página
 * @returns Filmes do gênero especificado
 */
export const getMoviesByGenre = async (genreId: number, page: number = 1) => {
  try {
    const url = buildApiUrl('/discover/movie', {
      with_genres: genreId.toString(),
      page: page.toString(),
      sort_by: 'popularity.desc',
      include_adult: 'false',
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting movies by genre:', error);
    throw error;
  }
};

/**
 * Busca séries por gênero específico usando a API discover.
 * @param genreId ID do gênero
 * @param page Número da página
 * @returns Séries do gênero especificado
 */
export const getTVShowsByGenre = async (genreId: number, page: number = 1) => {
  try {
    const url = buildApiUrl('/discover/tv', {
      with_genres: genreId.toString(),
      page: page.toString(),
      sort_by: 'popularity.desc',
      include_adult: 'false',
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting TV shows by genre:', error);
    throw error;
  }
};

/**
 * Busca filmes por década específica.
 * @param decade Década (ex: 2020, 2010, 2000)
 * @param page Número da página
 * @returns Filmes da década especificada
 */
export const getMoviesByDecade = async (decade: number, page: number = 1) => {
  try {
    const startYear = decade;
    const endYear = decade + 9;

    const url = buildApiUrl('/discover/movie', {
      'primary_release_date.gte': `${startYear}-01-01`,
      'primary_release_date.lte': `${endYear}-12-31`,
      page: page.toString(),
      sort_by: 'popularity.desc',
      include_adult: 'false',
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting movies by decade:', error);
    throw error;
  }
};

/**
 * Busca séries por década específica.
 * @param decade Década (ex: 2020, 2010, 2000)
 * @param page Número da página
 * @returns Séries da década especificada
 */
export const getTVShowsByDecade = async (decade: number, page: number = 1) => {
  try {
    const startYear = decade;
    const endYear = decade + 9;

    const url = buildApiUrl('/discover/tv', {
      'first_air_date.gte': `${startYear}-01-01`,
      'first_air_date.lte': `${endYear}-12-31`,
      page: page.toString(),
      sort_by: 'popularity.desc',
      include_adult: 'false',
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting TV shows by decade:', error);
    throw error;
  }
};

/**
 * Buscar apenas sequências diretas do filme (não filmes relacionados ou similares)
 * @param id ID do filme
 * @returns Apenas sequências diretas do filme
 */
export const getMovieSequels = async (id: number) => {
  try {
    // 1. Primeiro, buscar detalhes do filme para verificar belongs_to_collection
    const movieDetails = await getMovieDetails(id);
    const movie = movieDetails;

    let sequels: any[] = [];

    // Função auxiliar para ordenar filmes por ano cronologicamente
    const sortMoviesByYear = (movies: any[]) => {
      return movies.sort((a, b) => {
        const yearA = a.release_date
          ? new Date(a.release_date).getFullYear()
          : 0;
        const yearB = b.release_date
          ? new Date(b.release_date).getFullYear()
          : 0;
        return yearA - yearB; // Ordem crescente (mais antigo para mais recente)
      });
    };

    // ESTRATÉGIA 1: belongs_to_collection (mais precisa para sequências)
    if (movie.belongs_to_collection) {
      try {
        const collectionUrl = buildApiUrl(
          `/collection/${movie.belongs_to_collection.id}`
        );
        const collectionResponse = await fetch(collectionUrl);

        if (collectionResponse.ok) {
          const collectionData = await collectionResponse.json();

          // Filtrar apenas filmes da coleção que são sequências diretas
          const collectionMovies = collectionData.parts.filter((part: any) => {
            // Excluir o filme atual
            if (part.id === id) return false;

            const partTitle = part.title.toLowerCase();
            const originalTitle = part.original_title.toLowerCase();
            const movieTitle = movie.title.toLowerCase();

            // Verificar se é uma sequência real:
            // 1. Mesmo nome base + números (ex: "Star Wars 1", "Star Wars 2")
            // 2. Mesmo nome base + palavras como "Part", "Chapter", "Episode"
            // 3. Mesmo nome base + anos (ex: "Mission Impossible 1996", "Mission Impossible 2000")

            // Extrair nome base do filme original
            const baseName = movieTitle
              .replace(/\d+/g, '')
              .replace(/part|chapter|episode/gi, '')
              .trim();
            const partBaseName = partTitle
              .replace(/\d+/g, '')
              .replace(/part|chapter|episode/gi, '')
              .trim();

            // Verificar se tem o mesmo nome base
            const hasSameBaseName =
              partBaseName.includes(baseName) ||
              baseName.includes(partBaseName);

            // Verificar se tem números (indicando sequência)
            const hasNumbers = /\d/.test(partTitle) || /\d/.test(originalTitle);

            // Verificar se tem palavras indicando sequência
            const hasSequenceWords =
              /part|chapter|episode|sequel|prequel/gi.test(partTitle) ||
              /part|chapter|episode|sequel|prequel/gi.test(originalTitle);

            // Verificar se é do mesmo ano ou próximo (máximo 10 anos de diferença)
            const movieYear = movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : 0;
            const partYear = part.release_date
              ? new Date(part.release_date).getFullYear()
              : 0;
            const yearDiff = Math.abs(movieYear - partYear);
            const isReasonableTimeframe = yearDiff <= 10;

            return (
              hasSameBaseName &&
              (hasNumbers || hasSequenceWords) &&
              isReasonableTimeframe
            );
          });

          if (collectionMovies.length > 0) {
            // Ordenar por ano e pegar até 12 filmes
            sequels = sortMoviesByYear(collectionMovies).slice(0, 12);
            console.log(
              `Encontradas ${sequels.length} sequências da coleção: ${movie.belongs_to_collection.name}`
            );
            return {
              results: sequels,
              total_results: sequels.length,
              strategy: 'collection_sequels',
            };
          }
        }
      } catch (error) {
        console.warn('Erro ao buscar coleção:', error);
      }
    }

    // ESTRATÉGIA 2: Busca por título muito restritiva (apenas sequências diretas)
    try {
      const movieTitle = movie.title.toLowerCase();
      const originalTitle = movie.original_title.toLowerCase();

      // Extrair nome base do filme (remover números e palavras de sequência)
      const baseName = movieTitle
        .replace(/\d+/g, '')
        .replace(/part|chapter|episode|sequel|prequel/gi, '')
        .trim();

      // Se o nome base é muito curto ou genérico, não buscar
      if (baseName.length < 3 || ['the', 'a', 'an'].includes(baseName)) {
        console.log('Nome base muito genérico, não buscando sequências');
        return {
          results: [],
          total_results: 0,
          strategy: 'no_base_name',
        };
      }

      // Buscar por nome base
      const searchUrl = buildApiUrl('/search/movie', {
        query: baseName,
        page: '1',
      });

      const searchResponse = await fetch(searchUrl);
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();

        // Filtrar apenas sequências diretas
        const titleSequels = searchData.results.filter((result: any) => {
          if (result.id === id) return false; // Excluir o filme atual

          const resultTitle = result.title.toLowerCase();
          const resultOriginalTitle = result.original_title.toLowerCase();

          // Verificar se tem o mesmo nome base
          const resultBaseName = resultTitle
            .replace(/\d+/g, '')
            .replace(/part|chapter|episode|sequel|prequel/gi, '')
            .trim();

          const hasSameBaseName =
            resultBaseName.includes(baseName) ||
            baseName.includes(resultBaseName);

          // Verificar se tem números (indicando sequência)
          const hasNumbers =
            /\d/.test(resultTitle) || /\d/.test(resultOriginalTitle);

          // Verificar se tem palavras indicando sequência
          const hasSequenceWords =
            /part|chapter|episode|sequel|prequel/gi.test(resultTitle) ||
            /part|chapter|episode|sequel|prequel/gi.test(resultOriginalTitle);

          // Verificar se é do mesmo ano ou próximo (máximo 15 anos de diferença)
          const movieYear = movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : 0;
          const resultYear = result.release_date
            ? new Date(result.release_date).getFullYear()
            : 0;
          const yearDiff = Math.abs(movieYear - resultYear);
          const isReasonableTimeframe = yearDiff <= 15;

          // Deve ter nome base similar E (números OU palavras de sequência) E timeframe razoável
          return (
            hasSameBaseName &&
            (hasNumbers || hasSequenceWords) &&
            isReasonableTimeframe
          );
        });

        if (titleSequels.length > 0) {
          // Ordenar por ano
          sequels = sortMoviesByYear(titleSequels).slice(0, 12);
          console.log(
            `Encontradas ${sequels.length} sequências por título usando base: ${baseName}`
          );
          return {
            results: sequels,
            total_results: sequels.length,
            strategy: 'title_sequels',
          };
        }
      }
    } catch (error) {
      console.warn('Erro ao buscar por título:', error);
    }

    // Se nenhuma estratégia funcionou, retornar array vazio
    console.log('Nenhuma sequência encontrada para este filme');
    return {
      results: [],
      total_results: 0,
      strategy: 'no_sequels',
    };
  } catch (error) {
    console.error('Erro ao buscar sequências:', error);
    return {
      results: [],
      total_results: 0,
      strategy: 'error',
    };
  }
};

/**
 * Buscar filmes similares usando a API do TMDB
 * @param id ID do filme
 * @returns Lista de filmes similares
 */
export const getSimilarMovies = async (id: number) => {
  try {
    const similarUrl = buildApiUrl(`/movie/${id}/similar`, {
      page: '1',
    });

    const similarResponse = await fetch(similarUrl);
    if (similarResponse.ok) {
      const similarData = await similarResponse.json();

      // Retornar até 12 filmes similares
      const similarMovies = similarData.results.slice(0, 12);

      console.log(`Encontrados ${similarMovies.length} filmes similares`);

      return {
        results: similarMovies,
        total_results: similarData.total_results,
        page: similarData.page,
        total_pages: similarData.total_pages,
      };
    } else {
      console.error('Erro ao buscar filmes similares:', similarResponse.status);
      return {
        results: [],
        total_results: 0,
        page: 1,
        total_pages: 0,
      };
    }
  } catch (error) {
    console.error('Error getting similar movies:', error);
    return {
      results: [],
      total_results: 0,
      page: 1,
      total_pages: 0,
    };
  }
};
