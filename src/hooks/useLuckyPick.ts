
import { useState } from 'react';
import { 
  getPopularMovies, 
  getPopularTVShows, 
  getPopularPeople,
  TMDBMovie,
  TMDBTVShow,
  TMDBPerson
} from '@/utils/tmdb';

export const useLuckyPick = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getRandomItem = async (): Promise<{
    item: TMDBMovie | TMDBTVShow | TMDBPerson;
    type: 'movie' | 'tv' | 'person';
  } | null> => {
    setIsLoading(true);
    
    try {
      // Escolher aleatoriamente entre filmes, séries ou pessoas
      const categories = ['movie', 'tv', 'person'] as const;
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      let response;
      
      switch (randomCategory) {
        case 'movie':
          response = await getPopularMovies(Math.floor(Math.random() * 5) + 1);
          break;
        case 'tv':
          response = await getPopularTVShows(Math.floor(Math.random() * 5) + 1);
          break;
        case 'person':
          response = await getPopularPeople(Math.floor(Math.random() * 5) + 1);
          break;
      }
      
      if (response && response.results && response.results.length > 0) {
        const randomIndex = Math.floor(Math.random() * response.results.length);
        const item = response.results[randomIndex];
        
        return {
          item,
          type: randomCategory
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting random item:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { getRandomItem, isLoading };
};
