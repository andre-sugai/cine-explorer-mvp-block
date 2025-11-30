// TMDB API utilities
// This file contains helper functions for interacting with The Movie Database API

import { filterAdultContent } from './adultContentFilter';

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

// Sistema de tracking de quota local
// TMDB API v3 tem limite de 40 requisições por 10 segundos
const RATE_LIMIT_WINDOW = 10000; // 10 segundos em ms
const RATE_LIMIT_MAX = 40; // Máximo de requisições por janela

interface RequestLog {
  timestamp: number;
}

// Armazenar logs de requisições
let requestLogs: RequestLog[] = [];

// Limpar logs antigos (fora da janela de 10 segundos)
const cleanOldLogs = () => {
  const now = Date.now();
  requestLogs = requestLogs.filter(
    (log) => now - log.timestamp < RATE_LIMIT_WINDOW
  );
};

// Registrar nova requisição
const logRequest = () => {
  cleanOldLogs();
  requestLogs.push({ timestamp: Date.now() });

  // Atualizar localStorage
  const remaining = Math.max(0, RATE_LIMIT_MAX - requestLogs.length);
  localStorage.setItem('tmdb_rate_limit', RATE_LIMIT_MAX.toString());
  localStorage.setItem('tmdb_rate_remaining', remaining.toString());
  localStorage.setItem('tmdb_rate_updated', new Date().toISOString());

  // Log para debug
  console.log(
    `📊 TMDB API: ${requestLogs.length}/${RATE_LIMIT_MAX} requisições nos últimos 10s (${remaining} restantes)`
  );

  // Disparar evento para atualizar UI
  window.dispatchEvent(new Event('tmdb-quota-updated'));
};

// Obter contagem atual de requisições
export const getCurrentRequestCount = (): number => {
  cleanOldLogs();
  return requestLogs.length;
};

// Obter requisições restantes
export const getRemainingRequests = (): number => {
  return Math.max(0, RATE_LIMIT_MAX - getCurrentRequestCount());
};

// Helper para fazer fetch e rastrear quota localmente
export const fetchWithQuota = async (url: string): Promise<Response> => {
  // Registrar requisição antes de fazer o fetch
  logRequest();

  const response = await fetch(url);

  // Tentar capturar headers de rate limit se existirem (alguns endpoints podem ter)
  const limit = response.headers.get('x-ratelimit-limit');
  const remaining = response.headers.get('x-ratelimit-remaining');

  if (limit && remaining) {
    // Se a API retornar headers, usar esses valores
    localStorage.setItem('tmdb_rate_limit', limit);
    localStorage.setItem('tmdb_rate_remaining', remaining);
    localStorage.setItem('tmdb_rate_updated', new Date().toISOString());
    window.dispatchEvent(new Event('tmdb-quota-updated'));
  }

  return response;
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

    const response = await fetchWithQuota(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    // Não aplicar filtro de conteúdo adulto aqui para evitar bloqueios desnecessários
    // O filtro será aplicado no componente SearchResults se necessário
    console.log(
      `🔍 searchMulti: retornando ${
        data.results?.length || 0
      } resultados para "${query}"`
    );

    return data;
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

    const response = await fetchWithQuota(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    // Não aplicar filtro de conteúdo adulto aqui para evitar bloqueios desnecessários
    // O filtro será aplicado no componente SearchResults de forma mais controlada
    console.log(
      `🎦 searchMovies: retornando ${
        data.results?.length || 0
      } filmes para "${query}"`
    );

    return data;
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

    const response = await fetchWithQuota(url);
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

    const response = await fetchWithQuota(url);
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

    const response = await fetchWithQuota(url);
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

    const response = await fetchWithQuota(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting TV show details:', error);
    throw error;
  }
};

// Detalhes da temporada
export const getTVSeasonDetails = async (tvId: number, seasonNumber: number) => {
  try {
    const url = buildApiUrl(`/tv/${tvId}/season/${seasonNumber}`);

    const response = await fetchWithQuota(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting TV season details:', error);
    throw error;
  }
};

// Detalhes da coleção
export const getCollectionDetails = async (id: number) => {
  try {
    const url = buildApiUrl(`/collection/${id}`);

    const response = await fetchWithQuota(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting collection details:', error);
    throw error;
  }
};

// Detalhes de pessoa
export const getPersonDetails = async (id: number) => {
  try {
    const url = buildApiUrl(`/person/${id}`, {
      append_to_response: 'movie_credits,tv_credits',
    });

    const response = await fetchWithQuota(url);
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

    const response = await fetchWithQuota(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    // Aplicar filtro de conteúdo adulto
    if (data.results) {
      data.results = filterAdultContent(data.results);
    }

    return data;
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

    const response = await fetchWithQuota(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    // Aplicar filtro de conteúdo adulto
    if (data.results) {
      data.results = filterAdultContent(data.results);
    }

    return data;
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

    const response = await fetchWithQuota(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    // Aplicar filtro de conteúdo adulto
    if (data.results) {
      data.results = filterAdultContent(data.results);
    }

    return data;
  } catch (error) {
    console.error('Error getting top rated movies:', error);
    throw error;
  }
};

/**
 * Busca filmes que estão atualmente em cartaz nos cinemas
 * Filtra apenas filmes que estão exclusivamente em cinemas (não disponíveis em streaming)
 * @param page Número da página
 * @param region Região para buscar filmes em cartaz (padrão: 'BR')
 * @param filterStreaming Se true, filtra filmes que já estão disponíveis em streaming (padrão: true)
 * @returns Filmes em cartaz exclusivamente nos cinemas
 */
export const getNowPlayingMovies = async (
  page: number = 1,
  region: string = 'BR',
  filterStreaming: boolean = true
) => {
  try {
    const url = buildApiUrl('/movie/now_playing', {
      page: page.toString(),
      region: region, // Adiciona região para garantir filmes do Brasil
    });

    const response = await fetchWithQuota(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    // Log para debug: verificar quais filmes estão sendo retornados
    if (data.results && data.results.length > 0) {
      console.log(
        `🎬 Filmes retornados pelo endpoint now_playing (${data.results.length} total):`,
        data.results.map((m: TMDBMovie) => ({
          id: m.id,
          title: m.title,
          release_date: m.release_date,
        }))
      );
    }

    // Aplicar filtro de conteúdo adulto
    if (data.results) {
      data.results = filterAdultContent(data.results);

      // Filtrar filmes que estão exclusivamente em cinemas
      if (filterStreaming && data.results.length > 0) {
        const originalCount = data.results.length;
        const filteredMovies: TMDBMovie[] = [];

        // Verificar TODOS os filmes (não apenas os antigos)
        // Muitos filmes hoje são lançados simultaneamente em cinemas e streaming
        const moviesToCheck: TMDBMovie[] = [...data.results];

        // Verificar streaming para TODOS os filmes em paralelo (batch processing)
        const batchSize = 3; // Reduzido para evitar timeouts em produção
        const timeout = 5000; // 5 segundos de timeout por filme

        for (let i = 0; i < moviesToCheck.length; i += batchSize) {
          const batch = moviesToCheck.slice(i, i + batchSize);
          const batchPromises = batch.map(async (movie) => {
            try {
              // Adicionar timeout à chamada para evitar travamentos
              const timeoutPromise: Promise<never> = new Promise((_, reject) =>
                setTimeout(
                  () =>
                    reject(new Error('Timeout na verificação de providers')),
                  timeout
                )
              );

              const providersPromise = getMovieWatchProviders(movie.id, region);
              const providers = (await Promise.race([
                providersPromise,
                timeoutPromise,
              ])) as Awaited<ReturnType<typeof getMovieWatchProviders>>;

              // Verificar TODOS os tipos de disponibilidade digital
              const hasDigitalAvailability =
                (providers.flatrate && providers.flatrate.length > 0) || // Streaming
                (providers.rent && providers.rent.length > 0) || // Aluguel digital
                (providers.buy && providers.buy.length > 0); // Compra digital

              if (hasDigitalAvailability) {
                console.log(
                  `🎬 Filme "${movie.title}" excluído: disponível digitalmente (streaming/aluguel/compra)`
                );
                return null;
              }

              // Filme não está disponível digitalmente - incluir (está apenas em cinemas)
              return movie;
            } catch (error) {
              // Em caso de erro/timeout, MANTER o filme mas com aviso
              // Filmes em cartaz podem ter problemas temporários na API
              // É melhor incluir com aviso do que excluir incorretamente (falso negativo)
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              const isTimeout = errorMessage.includes('Timeout');

              console.warn(
                `⚠️ Erro ao verificar providers de "${movie.title}":`,
                errorMessage
              );

              if (isTimeout) {
                console.log(
                  `⏱️ Timeout ao verificar "${movie.title}" - incluindo por segurança (assumindo apenas em cinemas)`
                );
              } else {
                console.log(
                  `🎬 Filme "${movie.title}" incluído por segurança (erro na verificação, assumindo apenas em cinemas)`
                );
              }

              // Manter o filme em caso de erro para evitar falsos negativos
              // Se o filme está no endpoint now_playing, provavelmente está em cinemas
              return movie;
            }
          });

          const batchResults = await Promise.all(batchPromises);
          const validMovies = batchResults.filter(
            (m): m is TMDBMovie => m !== null
          );
          filteredMovies.push(...validMovies);
        }

        data.results = filteredMovies;

        if (filteredMovies.length < originalCount) {
          console.log(
            `🎬 Filmes em cartaz: ${originalCount} → ${filteredMovies.length} após filtro rigoroso (apenas filmes exclusivos de cinemas)`
          );
        } else {
          console.log(
            `🎬 Todos os ${filteredMovies.length} filmes passaram no filtro de cinemas exclusivos`
          );
        }
      }
    }

    return data;
  } catch (error) {
    console.error('Error getting now playing movies:', error);
    throw error;
  }
};

// Popular TV shows
export const getPopularTVShows = async (page: number = 1) => {
  try {
    const url = buildApiUrl('/tv/popular', {
      page: page.toString(),
    });

    const response = await fetchWithQuota(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting popular TV shows:', error);
    throw error;
  }
};

// Top rated TV shows
export const getTopRatedTVShows = async (page: number = 1) => {
  try {
    const url = buildApiUrl('/tv/top_rated', {
      page: page.toString(),
    });

    const response = await fetchWithQuota(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting top rated TV shows:', error);
    throw error;
  }
};

// Trending TV shows
export const getTrendingTVShows = async (
  timeWindow: 'day' | 'week' = 'week'
) => {
  try {
    const url = buildApiUrl(`/trending/tv/${timeWindow}`);

    const response = await fetchWithQuota(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting trending TV shows:', error);
    throw error;
  }
};

// Popular people
export const getPopularPeople = async (page: number = 1) => {
  try {
    const url = buildApiUrl('/person/popular', {
      page: page.toString(),
    });

    const response = await fetchWithQuota(url);
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
    const response = await fetchWithQuota(url);
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
    const response = await fetchWithQuota(url);
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
    const response = await fetchWithQuota(url);
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
    const response = await fetchWithQuota(url);
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
  const response = await fetchWithQuota(url);
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
    const response = await fetchWithQuota(url);
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
  const response = await fetchWithQuota(url);
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
    const response = await fetchWithQuota(url);
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
    const response = await fetchWithQuota(url);
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

    const response = await fetchWithQuota(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    // Aplicar filtro de conteúdo adulto
    if (data.results) {
      data.results = filterAdultContent(data.results);
    }

    return data;
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

    const response = await fetchWithQuota(url);
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

    const response = await fetchWithQuota(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    // Aplicar filtro de conteúdo adulto
    if (data.results) {
      data.results = filterAdultContent(data.results);
    }

    return data;
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

    const response = await fetchWithQuota(url);
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
 * Buscar sequências e filmes relacionados do filme
 * @param id ID do filme
 * @returns Sequências diretas ou filmes similares se não houver sequências
 */
export const getMovieSequels = async (id: number) => {
  try {
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
        return yearA - yearB;
      });
    };

    // ESTRATÉGIA 1: belongs_to_collection (mais precisa para sequências)
    if (movie.belongs_to_collection) {
      try {
        const collectionUrl = buildApiUrl(
          `/collection/${movie.belongs_to_collection.id}`
        );
        const collectionResponse = await fetchWithQuota(collectionUrl);

        if (collectionResponse.ok) {
          const collectionData = await collectionResponse.json();

          // Filtrar filmes da coleção (excluindo o filme atual)
          const collectionMovies = collectionData.parts.filter(
            (part: any) => part.id !== id && part.release_date
          );

          if (collectionMovies.length > 0) {
            // Ordenar por ano e pegar até 15 filmes
            sequels = sortMoviesByYear(collectionMovies).slice(0, 15);
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

    // ESTRATÉGIA 2: Busca por título (menos restritiva)
    try {
      const movieTitle = movie.title.toLowerCase();
      const originalTitle = movie.original_title.toLowerCase();

      // Extrair nome base do filme (remover números e palavras de sequência)
      const baseName = movieTitle
        .replace(/\d+/g, '')
        .replace(/part|chapter|episode|sequel|prequel|volume|book/gi, '')
        .replace(/[^\w\s]/g, '')
        .trim();

      // Se o nome base é muito curto ou genérico, não buscar
      if (
        baseName.length < 3 ||
        ['the', 'a', 'an', 'of', 'in', 'on'].includes(baseName)
      ) {
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

      const searchResponse = await fetchWithQuota(searchUrl);
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();

        // Filtrar filmes com nome similar (mais flexível)
        const titleSequels = searchData.results.filter((result: any) => {
          if (result.id === id) return false; // Excluir o filme atual

          const resultTitle = result.title.toLowerCase();
          const resultOriginal = result.original_title.toLowerCase();

          // Verificar se tem nome base similar
          const hasSimilarName =
            resultTitle.includes(baseName) ||
            baseName.includes(resultTitle) ||
            resultOriginal.includes(baseName) ||
            baseName.includes(resultOriginal);

          // Verificar se tem números (indicando sequência)
          const hasNumbers =
            /\d/.test(resultTitle) || /\d/.test(resultOriginal);

          // Verificar se tem palavras indicando sequência
          const hasSequenceWords =
            /part|chapter|episode|sequel|prequel|volume|book/gi.test(
              resultTitle
            ) ||
            /part|chapter|episode|sequel|prequel|volume|book/gi.test(
              resultOriginal
            );

          // Verificar se tem palavras específicas de franquias conhecidas
          const hasFranchiseWords =
            /star wars|starwars|lord of the rings|lordoftherings|harry potter|harrypotter|marvel|dc|batman|superman|spider-man|spiderman/gi.test(
              resultTitle
            ) ||
            /star wars|starwars|lord of the rings|lordoftherings|harry potter|harrypotter|marvel|dc|batman|superman|spider-man|spiderman/gi.test(
              resultOriginal
            );

          // Retornar true se tem nome similar E (números OU palavras de sequência OU palavras de franquia)
          return (
            hasSimilarName &&
            (hasNumbers || hasSequenceWords || hasFranchiseWords)
          );
        });

        if (titleSequels.length > 0) {
          // Ordenar por ano
          sequels = sortMoviesByYear(titleSequels).slice(0, 15);
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

    // ESTRATÉGIA 3: Busca por keywords específicas de sequência
    if (
      movie.keywords &&
      movie.keywords.keywords &&
      movie.keywords.keywords.length > 0
    ) {
      try {
        // Filtrar keywords relacionadas a sequências
        const sequelKeywords = movie.keywords.keywords.filter((keyword: any) =>
          /sequel|prequel|franchise|series|trilogy|saga/gi.test(keyword.name)
        );

        if (sequelKeywords.length > 0) {
          const baseName = movie.title
            .toLowerCase()
            .replace(/\d+/g, '')
            .replace(/part|chapter|episode|sequel|prequel|volume|book/gi, '')
            .replace(/[^\w\s]/g, '')
            .trim();

          for (const keyword of sequelKeywords.slice(0, 2)) {
            const keywordUrl = buildApiUrl('/discover/movie', {
              with_keywords: keyword.id.toString(),
              sort_by: 'popularity.desc',
              page: '1',
            });

            const keywordResponse = await fetchWithQuota(keywordUrl);
            if (keywordResponse.ok) {
              const keywordData = await keywordResponse.json();

              // Filtrar filmes com nome similar
              const keywordSequels = keywordData.results.filter(
                (result: any) => {
                  if (result.id === id) return false;

                  const resultTitle = result.title.toLowerCase();
                  const resultOriginal = result.original_title.toLowerCase();

                  const hasSimilarName =
                    resultTitle.includes(baseName) ||
                    baseName.includes(resultTitle) ||
                    resultOriginal.includes(baseName) ||
                    baseName.includes(resultOriginal);

                  const hasNumbers =
                    /\d/.test(resultTitle) || /\d/.test(resultOriginal);

                  const hasSequenceWords =
                    /part|chapter|episode|sequel|prequel|volume|book/gi.test(
                      resultTitle
                    ) ||
                    /part|chapter|episode|sequel|prequel|volume|book/gi.test(
                      resultOriginal
                    );

                  const hasFranchiseWords =
                    /star wars|starwars|lord of the rings|lordoftherings|harry potter|harrypotter|marvel|dc|batman|superman|spider-man|spiderman/gi.test(
                      resultTitle
                    ) ||
                    /star wars|starwars|lord of the rings|lordoftherings|harry potter|harrypotter|marvel|dc|batman|superman|spider-man|spiderman/gi.test(
                      resultOriginal
                    );

                  return (
                    hasSimilarName &&
                    (hasNumbers || hasSequenceWords || hasFranchiseWords)
                  );
                }
              );

              if (keywordSequels.length > 0) {
                sequels = sortMoviesByYear(keywordSequels).slice(0, 15);
                return {
                  results: sequels,
                  total_results: sequels.length,
                  strategy: 'keyword_sequels',
                };
              }
            }
          }
        }
      } catch (error) {
        console.warn('Erro ao buscar por keywords:', error);
      }
    }

    // ESTRATÉGIA 4: Fallback para filmes similares se não houver sequências
    try {
      const similarUrl = buildApiUrl(`/movie/${id}/similar`, {
        page: '1',
      });

      const similarResponse = await fetchWithQuota(similarUrl);
      if (similarResponse.ok) {
        const similarData = await similarResponse.json();

        // Retornar array vazio mas com estratégia similar_movies para mostrar mensagem explicativa
        return {
          results: [],
          total_results: 0,
          strategy: 'similar_movies',
        };
      }
    } catch (error) {
      console.warn('Erro ao buscar filmes similares:', error);
    }

    // Se nenhuma estratégia funcionou, retornar array vazio
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

    const similarResponse = await fetchWithQuota(similarUrl);
    if (similarResponse.ok) {
      const similarData = await similarResponse.json();

      // Aplicar filtro de conteúdo adulto
      let similarMovies = similarData.results;
      if (similarMovies) {
        similarMovies = filterAdultContent(similarMovies);
      }

      // Retornar até 12 filmes similares
      similarMovies = similarMovies.slice(0, 12);

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

/**
 * Busca filmes lançados em um intervalo de datas específico.
 * @param startDate Data inicial (YYYY-MM-DD)
 * @param endDate Data final (YYYY-MM-DD)
 * @param page Página de resultados
 * @returns Lista de filmes no intervalo
 */
export const getMoviesByDateRange = async (
  startDate: string,
  endDate: string,
  page: number = 1
) => {
  try {
    const url = buildApiUrl('/discover/movie', {
      'primary_release_date.gte': startDate,
      'primary_release_date.lte': endDate,
      sort_by: 'popularity.desc',
      page: page.toString(),
      include_adult: 'false',
      include_video: 'true',
    });

    const response = await fetchWithQuota(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    // Aplicar filtro de conteúdo adulto
    if (data.results) {
      data.results = filterAdultContent(data.results);
    }

    return data;
  } catch (error) {
    console.error('Error getting movies by date range:', error);
    throw error;
  }
};
// Buscar palavras-chave
export const searchKeywords = async (query: string) => {
  try {
    const url = buildApiUrl('/search/keyword', {
      query: query,
      page: '1',
    });
    const response = await fetchWithQuota(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching keywords:', error);
    return { results: [] };
  }
};
