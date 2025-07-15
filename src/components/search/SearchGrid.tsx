
import React from 'react';
import { MovieCard } from './cards/MovieCard';
import { TVCard } from './cards/TVCard';
import { PersonCard } from './cards/PersonCard';
import { SearchSkeleton } from './SearchSkeleton';
import { NoResults } from './NoResults';
import { TMDBMovie, TMDBTVShow, TMDBPerson } from '@/utils/tmdb';
import { FilterType } from './SearchFilters';

type SearchResult = TMDBMovie | TMDBTVShow | TMDBPerson;

interface SearchGridProps {
  results: SearchResult[];
  isLoading: boolean;
  error: any;
  activeFilter: FilterType;
}

export const SearchGrid: React.FC<SearchGridProps> = ({
  results,
  isLoading,
  error,
  activeFilter
}) => {
  if (isLoading) {
    return <SearchSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Erro ao carregar resultados</p>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return <NoResults />;
  }

  const filteredResults = results.filter((item) => {
    if (activeFilter === 'all') return true;
    
    if (activeFilter === 'movie') {
      return 'title' in item && 'release_date' in item;
    }
    
    if (activeFilter === 'tv') {
      return 'name' in item && 'first_air_date' in item;
    }
    
    if (activeFilter === 'person') {
      return 'known_for' in item;
    }
    
    return false;
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {filteredResults.map((item) => {
        // Movie
        if ('title' in item && 'release_date' in item) {
          return <MovieCard key={`movie-${item.id}`} movie={item} />;
        }
        
        // TV Show
        if ('name' in item && 'first_air_date' in item) {
          return <TVCard key={`tv-${item.id}`} show={item} />;
        }
        
        // Person
        if ('known_for' in item) {
          return <PersonCard key={`person-${item.id}`} person={item} />;
        }
        
        return null;
      })}
    </div>
  );
};
