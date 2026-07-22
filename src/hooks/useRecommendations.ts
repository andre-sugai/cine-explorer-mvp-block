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
  getGenreNameById
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

  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  const [cache, setCache] = useState<{
    [key: string]: { data: RecommendationItem[]; timestamp: number };
  }>({});

  const analyzeUserPreferences = useMemo((): UserPreferences => {
    const allItems = [...favorites, ...watched];

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

    const ratings = allItems
      .filter((item) => item.vote_average)
      .map((item) => item.vote_average!);

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 7.0;

    const movieCount =
      getFavoritesByType('movie').length +
      watched.filter((w) => w.type === 'movie').length;
    const tvCount =
      getFavoritesByType('tv').length +
      watched.filter((w) => w.type === 'tv').length;
    const preferredType =
      movieCount > tvCount ? 'movie' : tvCount > movieCount ? 'tv' : 'both';

    const watchedStats = getStats();
    const mostWatchedGenre =
      watchedStats.mostWatchedGenre || favoriteGenres[0] || 28;

    return {
      favoriteGenres,
      favoriteDecades,
      averageRating,
      totalWatched: watched.length,
      mostWatchedGenre,
      preferredType,
    };
  }, [favorites, watched, getFavoritesByType, getStats]);

  const getCachedData = (key: string): RecommendationItem[] | null => {
    const cached = cache[key];
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.data;
    }
    return null;
  };

  const setCachedData = (key: string, data: RecommendationItem[]) => {
    setCache((prev) => ({
      ...prev,
      [key]: { data, timestamp: Date.now() },
    }));
  };

  const removeDuplicates = (items: RecommendationItem[]): RecommendationItem[] => {
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

  const generateRecommendations = async (limit: number = 20): Promise<RecommendationItem[]> => {
    setIsLoading(true);

    try {
      const prefs = analyzeUserPreferences;
      const cacheKey = `general-${prefs.totalWatched}-${prefs.favoriteGenres.join(',')}`;

      const cached = getCachedData(cacheKey);
      if (cached) {
        return cached.slice(0, limit);
      }

      let recommendations: RecommendationItem[] = [];

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

      if (prefs.favoriteGenres.length > 0) {
        for (const genreId of prefs.favoriteGenres.slice(0, 3)) {
          try {
            const genreMovies = await getMoviesByGenre(genreId, 1);
            const genreTV = await getTVShowsByGenre(genreId, 1);

            const genreItems = [
              ...genreMovies.results.map((movie) => ({
                ...movie,
                type: 'movie' as const,
                reason: `Baseado no seu gosto por ${getGenreNameById(genreId)}`,
                confidence: 0.8,
              })),
              ...genreTV.results.map((tv) => ({
                ...tv,
                type: 'tv' as const,
                reason: `Baseado no seu gosto por ${getGenreNameById(genreId)}`,
                confidence: 0.8,
              })),
            ];

            const uniqueGenreItems = removeDuplicates(genreItems);
            recommendations = addUniqueItems(recommendations, uniqueGenreItems);
          } catch (error) {
            console.error(`Erro ao buscar gênero ${genreId}:`, error);
            const popularMovies = await getPopularMovies(1);
            const popularTV = await getPopularTVShows(1);

            const fallbackItems = [
              ...popularMovies.results.slice(0, 5).map((movie) => ({
                ...movie,
                type: 'movie' as const,
                reason: `Baseado no seu gosto por ${getGenreNameById(genreId)}`,
                confidence: 0.6,
              })),
              ...popularTV.results.slice(0, 5).map((tv) => ({
                ...tv,
                type: 'tv' as const,
                reason: `Baseado no seu gosto por ${getGenreNameById(genreId)}`,
                confidence: 0.6,
              })),
            ];

            const uniqueFallbackItems = removeDuplicates(fallbackItems);
            recommendations = addUniqueItems(recommendations, uniqueFallbackItems);
          }
        }
      }

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

          const uniqueFallbackDecadeItems = removeDuplicates(fallbackDecadeItems);
          recommendations = addUniqueItems(recommendations, uniqueFallbackDecadeItems);
        }
      }

      const watchedIds = new Set(watched.map((w) => `${w.id}-${w.type}`));
      const favoriteIds = new Set(favorites.map((f) => `${f.id}-${f.type}`));

      const filtered = recommendations
        .filter((item) => {
          const itemKey = `${item.id}-${item.type}`;
          return !watchedIds.has(itemKey) && !favoriteIds.has(itemKey);
        })
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, limit);

      setCachedData(cacheKey, filtered);
      return filtered;
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = async (mood?: string, occasion?: string) => {
    if (!mood && !occasion) {
      setFilteredRecommendations([]);
      return;
    }
    
    setIsFiltering(true);
    const cacheKey = `filter-${mood || 'none'}-${occasion || 'none'}`;
    
    try {
      const cached = getCachedData(cacheKey);
      if (cached) {
        setFilteredRecommendations(cached);
        return;
      }

      const moodGenres: { [key: string]: number[] } = {
        feliz: [35, 10751, 16],
        triste: [18, 10749, 10402],
        estressado: [35, 16, 10751],
        inspirado: [12, 14, 36],
        relaxado: [16, 10751, 10402],
        motivado: [12, 28, 36],
        romantico: [10749, 18, 35],
        assustado: [27, 53, 9648],
      };

      const occasionGenres: { [key: string]: { genres: number[]; type: 'movie' | 'tv' | 'both' } } = {
        familia: { genres: [10751, 16, 35], type: 'both' },
        encontro: { genres: [10749, 35, 18], type: 'both' },
        amigos: { genres: [35, 28, 12], type: 'both' },
        sozinho: { genres: [18, 9648, 53], type: 'both' },
        'fim-de-semana': { genres: [28, 12, 35], type: 'both' },
        noite: { genres: [27, 53, 9648], type: 'both' },
        tarde: { genres: [16, 10751, 35], type: 'both' },
        manha: { genres: [16, 10751, 10402], type: 'both' },
      };

      let targetGenres = new Set<number>();
      let filterType: 'movie' | 'tv' | 'both' = 'both';
      
      let reason = '';
      if (mood && occasion) {
        reason = `Combinação de humor e ocasião escolhida`;
        const mG = moodGenres[mood] || [];
        const oG = occasionGenres[occasion]?.genres || [];
        mG.forEach(g => targetGenres.add(g));
        oG.forEach(g => targetGenres.add(g));
        filterType = occasionGenres[occasion]?.type || 'both';
      } else if (mood) {
        reason = `Perfeito para quando você está se sentindo assim`;
        (moodGenres[mood] || []).forEach(g => targetGenres.add(g));
      } else if (occasion) {
        reason = `Ideal para esta ocasião`;
        (occasionGenres[occasion]?.genres || []).forEach(g => targetGenres.add(g));
        filterType = occasionGenres[occasion]?.type || 'both';
      }

      if (targetGenres.size === 0) {
        targetGenres.add(28).add(35);
      }

      const recs: RecommendationItem[] = [];
      const genresToFetch = Array.from(targetGenres).slice(0, 4);

      for (const genreId of genresToFetch) {
        try {
          if (filterType === 'movie' || filterType === 'both') {
            const movies = await getMoviesByGenre(genreId, 1);
            recs.push(
              ...movies.results.slice(0, 4).map((movie) => ({
                ...movie,
                type: 'movie' as const,
                reason,
                confidence: 0.9,
              }))
            );
          }
          if (filterType === 'tv' || filterType === 'both') {
            const tv = await getTVShowsByGenre(genreId, 1);
            recs.push(
              ...tv.results.slice(0, 4).map((show) => ({
                ...show,
                type: 'tv' as const,
                reason,
                confidence: 0.9,
              }))
            );
          }
        } catch (error) {
          console.error(`Erro ao buscar gênero ${genreId} para filtro`, error);
        }
      }

      const uniqueRecs = removeDuplicates(recs);
      
      // Filter watched and favorites!
      const watchedIds = new Set(watched.map((w) => `${w.id}-${w.type}`));
      const favoriteIds = new Set(favorites.map((f) => `${f.id}-${f.type}`));

      const finalFiltered = uniqueRecs
        .filter((item) => {
          const itemKey = `${item.id}-${item.type}`;
          return !watchedIds.has(itemKey) && !favoriteIds.has(itemKey);
        })
        .slice(0, 15);

      setCachedData(cacheKey, finalFiltered);
      setFilteredRecommendations(finalFiltered);
    } catch (error) {
      console.error('Error applying filters', error);
      setFilteredRecommendations([]);
    } finally {
      setIsFiltering(false);
    }
  };

  const refreshRecommendations = async () => {
    const newRecommendations = await generateRecommendations();
    setRecommendations(newRecommendations);
  };

  useEffect(() => {
    setUserPreferences(analyzeUserPreferences);
    refreshRecommendations();
  }, [analyzeUserPreferences]);

  return {
    recommendations,
    filteredRecommendations,
    userPreferences,
    isLoading,
    isFiltering,
    applyFilters,
    generateRecommendations,
    refreshRecommendations,
  };
};
