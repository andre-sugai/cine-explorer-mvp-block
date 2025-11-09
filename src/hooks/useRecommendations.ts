import { useState, useEffect, useMemo } from 'react';
import { useFavoritesContext } from '@/context/FavoritesContext';
import { useWatchedContext } from '@/context/WatchedContext';
import { useAuth } from '@/context/AuthContext';
import {
  getMovieDetails,
  getTVShowDetails,
  getPopularMovies,
  getPopularTVShows,
  getMoviesByGenre,
  getTVShowsByGenre,
  getMoviesByDecade,
  getTVShowsByDecade,
  TMDBMovie,
  TMDBTVShow,
  TMDBPerson,
} from '@/utils/tmdb';

export interface RecommendationItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  overview?: string;
  reason: string;
  confidence: number;
}

export interface UserPreferences {
  favoriteGenres: number[];
  favoriteDecades: number[];
  averageRating: number;
  totalWatched: number;
  mostWatchedGenre: number;
  preferredType: 'movie' | 'tv' | 'both';
}

export const useRecommendations = () => {
  const { favorites, getFavoritesByType } = useFavoritesContext();
  const { watched, getStats } = useWatchedContext();
  const { isAuthenticated } = useAuth();

  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [userPreferences, setUserPreferences] =
    useState<UserPreferences | null>(null);

  // Cache para evitar requisições repetidas
  const [cache, setCache] = useState<{
    [key: string]: { data: RecommendationItem[]; timestamp: number };
  }>({});

  /**
   * Analisa os dados do usuário para extrair preferências
   */
  const analyzeUserPreferences = useMemo((): UserPreferences => {
    const allItems = [...favorites, ...watched];

    // Análise de gêneros
    const genreCount: { [key: number]: number } = {};
    allItems.forEach((item) => {
      item.genre_ids?.forEach((genreId) => {
        genreCount[genreId] = (genreCount[genreId] || 0) + 1;
      });
    });

    const favoriteGenres = Object.entries(genreCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genreId]) => Number(genreId));

    // Análise de décadas
    const decadeCount: { [key: number]: number } = {};
    allItems.forEach((item) => {
      const year = item.release_date
        ? new Date(item.release_date).getFullYear()
        : item.first_air_date
        ? new Date(item.first_air_date).getFullYear()
        : null;

      if (year) {
        const decade = Math.floor(year / 10) * 10;
        decadeCount[decade] = (decadeCount[decade] || 0) + 1;
      }
    });

    const favoriteDecades = Object.entries(decadeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([decade]) => Number(decade));

    // Análise de avaliações
    const ratings = allItems
      .filter((item) => item.vote_average)
      .map((item) => item.vote_average!);

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 7.0;

    // Análise de tipo preferido
    const movieCount =
      getFavoritesByType('movie').length +
      watched.filter((w) => w.type === 'movie').length;
    const tvCount =
      getFavoritesByType('tv').length +
      watched.filter((w) => w.type === 'tv').length;
    const preferredType =
      movieCount > tvCount ? 'movie' : tvCount > movieCount ? 'tv' : 'both';

    // Gênero mais assistido
    const watchedStats = getStats();
    const mostWatchedGenre =
      watchedStats.mostWatchedGenre || favoriteGenres[0] || 28;

    return {
      favoriteGenres,
      favoriteDecades,
      averageRating,
      totalWatched: watched.length, // Corrigido: conta apenas assistidos
      mostWatchedGenre,
      preferredType,
    };
  }, [favorites, watched, getFavoritesByType, getStats]);

  /**
   * Verifica se há dados em cache válidos (menos de 5 minutos)
   */
  const getCachedData = (key: string): RecommendationItem[] | null => {
    const cached = cache[key];
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.data;
    }
    return null;
  };

  /**
   * Salva dados no cache
   */
  const setCachedData = (key: string, data: RecommendationItem[]) => {
    setCache((prev) => ({
      ...prev,
      [key]: { data, timestamp: Date.now() },
    }));
  };

  /**
   * Remove duplicatas de recomendações baseado no ID e tipo
   */
  const removeDuplicates = (
    items: RecommendationItem[]
  ): RecommendationItem[] => {
    const seen = new Set<string>();
    return items.filter((item) => {
      const key = `${item.id}-${item.type}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  /**
   * Adiciona itens únicos à lista de recomendações, evitando duplicatas
   */
  const addUniqueItems = (
    currentItems: RecommendationItem[],
    newItems: RecommendationItem[]
  ): RecommendationItem[] => {
    const existingKeys = new Set(
      currentItems.map((item) => `${item.id}-${item.type}`)
    );
    const uniqueNewItems = newItems.filter((item) => {
      const key = `${item.id}-${item.type}`;
      return !existingKeys.has(key);
    });
    return [...currentItems, ...uniqueNewItems];
  };

  /**
   * Gera recomendações baseadas nas preferências do usuário
   */
  const generateRecommendations = async (
    limit: number = 20
  ): Promise<RecommendationItem[]> => {
    setIsLoading(true);

    try {
      const prefs = analyzeUserPreferences;
      const cacheKey = `general-${
        prefs.totalWatched
      }-${prefs.favoriteGenres.join(',')}`;

      // Verificar cache primeiro
      const cached = getCachedData(cacheKey);
      if (cached) {
        return cached.slice(0, limit);
      }

      let recommendations: RecommendationItem[] = [];

      // Se o usuário tem poucos dados assistidos, usar recomendações populares
      // Considera também favoritos para ter uma base mínima de preferências
      const totalUserData = favorites.length + watched.length;
      if (totalUserData < 5) {
        const popularMovies = await getPopularMovies(1);
        const popularTV = await getPopularTVShows(1);

        const popularItems = [
          ...popularMovies.results.map((movie) => ({
            ...movie,
            type: 'movie' as const,
            reason: 'Filme popular no momento',
            confidence: 0.7,
          })),
          ...popularTV.results.map((tv) => ({
            ...tv,
            type: 'tv' as const,
            reason: 'Série popular no momento',
            confidence: 0.7,
          })),
        ];

        const uniqueItems = removeDuplicates(popularItems);
        return uniqueItems.slice(0, limit);
      }

      // Buscar filmes similares baseados em gêneros favoritos
      if (prefs.favoriteGenres.length > 0) {
        for (const genreId of prefs.favoriteGenres.slice(0, 3)) {
          try {
            const genreMovies = await getMoviesByGenre(genreId, 1);
            const genreTV = await getTVShowsByGenre(genreId, 1);

            const genreItems = [
              ...genreMovies.results.map((movie) => ({
                ...movie,
                type: 'movie' as const,
                reason: `Baseado no seu gosto por ${getGenreName(genreId)}`,
                confidence: 0.8,
              })),
              ...genreTV.results.map((tv) => ({
                ...tv,
                type: 'tv' as const,
                reason: `Baseado no seu gosto por ${getGenreName(genreId)}`,
                confidence: 0.8,
              })),
            ];

            // Adicionar apenas itens únicos
            const uniqueGenreItems = removeDuplicates(genreItems);
            recommendations = addUniqueItems(recommendations, uniqueGenreItems);
          } catch (error) {
            console.error(`Erro ao buscar gênero ${genreId}:`, error);
            // Fallback para filmes populares se a busca por gênero falhar
            const popularMovies = await getPopularMovies(1);
            const popularTV = await getPopularTVShows(1);

            const fallbackItems = [
              ...popularMovies.results.slice(0, 5).map((movie) => ({
                ...movie,
                type: 'movie' as const,
                reason: `Baseado no seu gosto por ${getGenreName(genreId)}`,
                confidence: 0.6,
              })),
              ...popularTV.results.slice(0, 5).map((tv) => ({
                ...tv,
                type: 'tv' as const,
                reason: `Baseado no seu gosto por ${getGenreName(genreId)}`,
                confidence: 0.6,
              })),
            ];

            const uniqueFallbackItems = removeDuplicates(fallbackItems);
            recommendations = addUniqueItems(
              recommendations,
              uniqueFallbackItems
            );
          }
        }
      }

      // Buscar conteúdo da década favorita
      if (prefs.favoriteDecades.length > 0) {
        const decade = prefs.favoriteDecades[0];
        try {
          const decadeMovies = await getMoviesByDecade(decade, 1);
          const decadeTV = await getTVShowsByDecade(decade, 1);

          const decadeItems = [
            ...decadeMovies.results.map((movie) => ({
              ...movie,
              type: 'movie' as const,
              reason: `Baseado no seu gosto por filmes dos anos ${decade}s`,
              confidence: 0.75,
            })),
            ...decadeTV.results.map((tv) => ({
              ...tv,
              type: 'tv' as const,
              reason: `Baseado no seu gosto por séries dos anos ${decade}s`,
              confidence: 0.75,
            })),
          ];

          const uniqueDecadeItems = removeDuplicates(decadeItems);
          recommendations = addUniqueItems(recommendations, uniqueDecadeItems);
        } catch (error) {
          console.error(`Erro ao buscar década ${decade}:`, error);
          // Fallback para filmes populares se a busca por década falhar
          const popularMovies = await getPopularMovies(1);
          const popularTV = await getPopularTVShows(1);

          const fallbackDecadeItems = [
            ...popularMovies.results.slice(0, 5).map((movie) => ({
              ...movie,
              type: 'movie' as const,
              reason: `Baseado no seu gosto por filmes dos anos ${decade}s`,
              confidence: 0.6,
            })),
            ...popularTV.results.slice(0, 5).map((tv) => ({
              ...tv,
              type: 'tv' as const,
              reason: `Baseado no seu gosto por séries dos anos ${decade}s`,
              confidence: 0.6,
            })),
          ];

          const uniqueFallbackDecadeItems =
            removeDuplicates(fallbackDecadeItems);
          recommendations = addUniqueItems(
            recommendations,
            uniqueFallbackDecadeItems
          );
        }
      }

      // Filtrar itens já assistidos ou favoritados
      const watchedIds = new Set(watched.map((w) => `${w.id}-${w.type}`));
      const favoriteIds = new Set(favorites.map((f) => `${f.id}-${f.type}`));

      const filteredRecommendations = recommendations
        .filter((item) => {
          const itemKey = `${item.id}-${item.type}`;
          return !watchedIds.has(itemKey) && !favoriteIds.has(itemKey);
        })
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, limit);

      // Salvar no cache
      setCachedData(cacheKey, filteredRecommendations);

      return filteredRecommendations;
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gera recomendações por humor/ocasião
   */
  const getRecommendationsByMood = async (
    mood: string
  ): Promise<RecommendationItem[]> => {
    const cacheKey = `mood-${mood}`;

    // Verificar cache primeiro
    const cached = getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    const moodGenres: { [key: string]: number[] } = {
      feliz: [35, 10751, 16], // Comédia, Família, Animação
      triste: [18, 10749, 10402], // Drama, Romance, Música
      estressado: [35, 16, 10751], // Comédia, Animação, Família
      inspirado: [12, 14, 36], // Aventura, Fantasia, História
      relaxado: [16, 10751, 10402], // Animação, Família, Música
      motivado: [12, 28, 36], // Aventura, Ação, História
      romantico: [10749, 18, 35], // Romance, Drama, Comédia
      assustado: [27, 53, 9648], // Terror, Thriller, Mistério
    };

    const genres = moodGenres[mood] || moodGenres['feliz'];
    const recommendations: RecommendationItem[] = [];

    for (const genreId of genres) {
      try {
        const movies = await getMoviesByGenre(genreId, 1);
        const tv = await getTVShowsByGenre(genreId, 1);

        recommendations.push(
          ...movies.results.slice(0, 3).map((movie) => ({
            ...movie,
            type: 'movie' as const,
            reason: `Perfeito para quando você está ${mood}`,
            confidence: 0.9,
          })),
          ...tv.results.slice(0, 3).map((show) => ({
            ...show,
            type: 'tv' as const,
            reason: `Perfeito para quando você está ${mood}`,
            confidence: 0.9,
          }))
        );
      } catch (error) {
        console.error(
          `Erro ao buscar gênero ${genreId} para humor ${mood}:`,
          error
        );
        // Fallback para filmes populares
        const popularMovies = await getPopularMovies(1);
        const popularTV = await getPopularTVShows(1);

        recommendations.push(
          ...popularMovies.results.slice(0, 2).map((movie) => ({
            ...movie,
            type: 'movie' as const,
            reason: `Perfeito para quando você está ${mood}`,
            confidence: 0.7,
          })),
          ...popularTV.results.slice(0, 2).map((show) => ({
            ...show,
            type: 'tv' as const,
            reason: `Perfeito para quando você está ${mood}`,
            confidence: 0.7,
          }))
        );
      }
    }

    const uniqueRecommendations = removeDuplicates(recommendations);
    const result = uniqueRecommendations.slice(0, 10);
    setCachedData(cacheKey, result);
    return result;
  };

  /**
   * Gera recomendações por ocasião
   */
  const getRecommendationsByOccasion = async (
    occasion: string
  ): Promise<RecommendationItem[]> => {
    const cacheKey = `occasion-${occasion}`;

    // Verificar cache primeiro
    const cached = getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    const occasionGenres: {
      [key: string]: { genres: number[]; type: 'movie' | 'tv' | 'both' };
    } = {
      familia: { genres: [10751, 16, 35], type: 'both' },
      encontro: { genres: [10749, 35, 18], type: 'both' },
      amigos: { genres: [35, 28, 12], type: 'both' },
      sozinho: { genres: [18, 9648, 53], type: 'both' },
      'fim-de-semana': { genres: [28, 12, 35], type: 'both' },
      noite: { genres: [27, 53, 9648], type: 'both' },
      tarde: { genres: [16, 10751, 35], type: 'both' },
      manha: { genres: [16, 10751, 10402], type: 'both' },
    };

    const config = occasionGenres[occasion] || occasionGenres['familia'];
    const recommendations: RecommendationItem[] = [];

    for (const genreId of config.genres) {
      try {
        if (config.type === 'movie' || config.type === 'both') {
          const movies = await getMoviesByGenre(genreId, 1);
          recommendations.push(
            ...movies.results.slice(0, 3).map((movie) => ({
              ...movie,
              type: 'movie' as const,
              reason: `Ideal para ${occasion}`,
              confidence: 0.85,
            }))
          );
        }

        if (config.type === 'tv' || config.type === 'both') {
          const tv = await getTVShowsByGenre(genreId, 1);
          recommendations.push(
            ...tv.results.slice(0, 3).map((show) => ({
              ...show,
              type: 'tv' as const,
              reason: `Ideal para ${occasion}`,
              confidence: 0.85,
            }))
          );
        }
      } catch (error) {
        console.error(
          `Erro ao buscar gênero ${genreId} para ocasião ${occasion}:`,
          error
        );
        // Fallback para filmes populares
        if (config.type === 'movie' || config.type === 'both') {
          const popularMovies = await getPopularMovies(1);
          recommendations.push(
            ...popularMovies.results.slice(0, 2).map((movie) => ({
              ...movie,
              type: 'movie' as const,
              reason: `Ideal para ${occasion}`,
              confidence: 0.7,
            }))
          );
        }

        if (config.type === 'tv' || config.type === 'both') {
          const popularTV = await getPopularTVShows(1);
          recommendations.push(
            ...popularTV.results.slice(0, 2).map((show) => ({
              ...show,
              type: 'tv' as const,
              reason: `Ideal para ${occasion}`,
              confidence: 0.7,
            }))
          );
        }
      }
    }

    const uniqueRecommendations = removeDuplicates(recommendations);
    const result = uniqueRecommendations.slice(0, 10);
    setCachedData(cacheKey, result);
    return result;
  };

  /**
   * Atualiza as recomendações
   */
  const refreshRecommendations = async () => {
    const newRecommendations = await generateRecommendations();
    setRecommendations(newRecommendations);
  };

  // Atualizar recomendações quando os dados do usuário mudarem
  useEffect(() => {
    setUserPreferences(analyzeUserPreferences);
    refreshRecommendations();
  }, [analyzeUserPreferences]);

  return {
    recommendations,
    userPreferences,
    isLoading,
    generateRecommendations,
    getRecommendationsByMood,
    getRecommendationsByOccasion,
    refreshRecommendations,
  };
};

/**
 * Função auxiliar para obter nome do gênero
 */
const getGenreName = (genreId: number): string => {
  const genres: { [key: number]: string } = {
    28: 'Ação',
    12: 'Aventura',
    16: 'Animação',
    35: 'Comédia',
    80: 'Crime',
    99: 'Documentário',
    18: 'Drama',
    10751: 'Família',
    14: 'Fantasia',
    36: 'História',
    27: 'Terror',
    10402: 'Música',
    9648: 'Mistério',
    10749: 'Romance',
    878: 'Ficção Científica',
    10770: 'Cinema TV',
    53: 'Thriller',
    10752: 'Guerra',
    37: 'Faroeste',
  };

  return genres[genreId] || 'Filme';
};
