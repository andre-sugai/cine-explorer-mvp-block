
import React, { useState, useEffect } from 'react';
import { SearchSection } from './home/SearchSection';
import { CategoryTabs } from './home/CategoryTabs';
import { ContentGrid } from './home/ContentGrid';
import { getPopularMovies, getPopularTVShows, getPopularPeople } from '@/utils/tmdb';
import { TMDBMovie, TMDBTVShow, TMDBPerson } from '@/utils/tmdb';

type ContentCategory = 'movies' | 'tv' | 'actors' | 'directors';

export const HomePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<ContentCategory>('movies');
  const [content, setContent] = useState<(TMDBMovie | TMDBTVShow | TMDBPerson)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadContent = async (category: ContentCategory, pageNum: number = 1, reset: boolean = false) => {
    try {
      setIsLoading(true);
      let response;
      
      switch (category) {
        case 'movies':
          response = await getPopularMovies(pageNum);
          break;
        case 'tv':
          response = await getPopularTVShows(pageNum);
          break;
        case 'actors':
          response = await getPopularPeople(pageNum);
          // Filter only actors
          response.results = response.results.filter((person: TMDBPerson) => 
            person.known_for_department === 'Acting'
          );
          break;
        case 'directors':
          response = await getPopularPeople(pageNum);
          // Filter only directors
          response.results = response.results.filter((person: TMDBPerson) => 
            person.known_for_department === 'Directing'
          );
          break;
        default:
          return;
      }
      
      if (reset) {
        setContent(response.results);
      } else {
        setContent(prev => [...prev, ...response.results]);
      }
      
      setHasMore(pageNum < response.total_pages);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category: ContentCategory) => {
    setActiveCategory(category);
    setPage(1);
    loadContent(category, 1, true);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadContent(activeCategory, nextPage, false);
    }
  };

  const handleLuckyPick = () => {
    if (content.length > 0) {
      const randomItem = content[Math.floor(Math.random() * content.length)];
      
      if ('title' in randomItem) {
        // It's a movie
        window.location.href = `/filme/${randomItem.id}`;
      } else if ('name' in randomItem && 'first_air_date' in randomItem) {
        // It's a TV show
        window.location.href = `/serie/${randomItem.id}`;
      } else if ('name' in randomItem) {
        // It's a person
        window.location.href = `/pessoa/${randomItem.id}`;
      }
    }
  };

  useEffect(() => {
    loadContent(activeCategory, 1, true);
  }, []);

  return (
    <div className="min-h-screen space-y-12">
      {/* Hero Section with Centralized Search */}
      <SearchSection onLuckyPick={handleLuckyPick} />

      {/* Category Navigation */}
      <CategoryTabs 
        activeCategory={activeCategory} 
        onCategoryChange={handleCategoryChange}
      />

      {/* Infinite Content Grid */}
      <ContentGrid 
        content={content}
        category={activeCategory}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
};
