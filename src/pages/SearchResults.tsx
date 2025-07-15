
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  searchMulti, 
  searchMovies, 
  searchTVShows, 
  searchPeople, 
  getPopularMovies,
  getPopularTVShows,
  getPopularPeople,
  type TMDBMovie,
  type TMDBTVShow,
  type TMDBPerson 
} from '@/utils/tmdb';
import { SearchHeader } from '@/components/search/SearchHeader';
import { SearchFilters, FilterType, SortOption } from '@/components/search/SearchFilters';
import { SearchGrid } from '@/components/search/SearchGrid';
import { SearchPagination } from '@/components/search/SearchPagination';

type SearchResult = TMDBMovie | TMDBTVShow | TMDBPerson;

const SearchResults: React.FC = () => {
  const { term } = useParams<{ term: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  const decodedTerm = term ? decodeURIComponent(term) : '';
  const isSpecialSearch = decodedTerm.startsWith('popular-');

  // Query for multi-search (general search)
  const multiSearchQuery = useQuery({
    queryKey: ['search-multi', decodedTerm, currentPage],
    queryFn: () => searchMulti(decodedTerm, currentPage),
    enabled: !!decodedTerm && !isSpecialSearch,
  });

  // Queries for special searches (popular content)
  const moviesQuery = useQuery({
    queryKey: ['search-movies', decodedTerm, currentPage],
    queryFn: () => isSpecialSearch && decodedTerm === 'popular-movies' 
      ? getPopularMovies(currentPage) 
      : searchMovies(decodedTerm, currentPage),
    enabled: !!decodedTerm && (isSpecialSearch ? decodedTerm === 'popular-movies' : true),
  });

  const tvQuery = useQuery({
    queryKey: ['search-tv', decodedTerm, currentPage],
    queryFn: () => isSpecialSearch && decodedTerm === 'popular-tv' 
      ? getPopularTVShows(currentPage) 
      : searchTVShows(decodedTerm, currentPage),
    enabled: !!decodedTerm && (isSpecialSearch ? decodedTerm === 'popular-tv' : true),
  });

  const peopleQuery = useQuery({
    queryKey: ['search-people', decodedTerm, currentPage],
    queryFn: () => isSpecialSearch && decodedTerm === 'popular-people' 
      ? getPopularPeople(currentPage) 
      : searchPeople(decodedTerm, currentPage),
    enabled: !!decodedTerm && (isSpecialSearch ? decodedTerm === 'popular-people' : true),
  });

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
    setActiveFilter('all');
    setSortBy('relevance');
  }, [decodedTerm]);

  // Combine and process results
  const { allResults, isLoading, error, totalPages, resultsCount } = useMemo(() => {
    let results: SearchResult[] = [];
    let loading = false;
    let err = null;
    let pages = 0;

    if (isSpecialSearch) {
      // Handle special searches
      if (decodedTerm === 'popular-movies') {
        loading = moviesQuery.isLoading;
        err = moviesQuery.error;
        results = moviesQuery.data?.results || [];
        pages = moviesQuery.data?.total_pages || 0;
      } else if (decodedTerm === 'popular-tv') {
        loading = tvQuery.isLoading;
        err = tvQuery.error;
        results = tvQuery.data?.results || [];
        pages = tvQuery.data?.total_pages || 0;
      } else if (decodedTerm === 'popular-people') {
        loading = peopleQuery.isLoading;
        err = peopleQuery.error;
        results = peopleQuery.data?.results || [];
        pages = peopleQuery.data?.total_pages || 0;
      }
    } else {
      // Handle general search
      loading = multiSearchQuery.isLoading;
      err = multiSearchQuery.error;
      results = multiSearchQuery.data?.results || [];
      pages = multiSearchQuery.data?.total_pages || 0;
    }

    // Sort results
    const sortedResults = [...results].sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return (b.popularity || 0) - (a.popularity || 0);
        case 'date':
          const dateA = ('release_date' in a ? a.release_date : 'first_air_date' in a ? a.first_air_date : '') || '';
          const dateB = ('release_date' in b ? b.release_date : 'first_air_date' in b ? b.first_air_date : '') || '';
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        case 'rating':
          return (b.vote_average || 0) - (a.vote_average || 0);
        case 'relevance':
        default:
          return 0; // Keep original order
      }
    });

    // Count results by type
    const counts: Record<FilterType, number> = {
      all: results.length,
      movie: results.filter(item => 'title' in item && 'release_date' in item).length,
      tv: results.filter(item => 'name' in item && 'first_air_date' in item).length,
      person: results.filter(item => 'known_for' in item).length,
    };

    return {
      allResults: sortedResults,
      isLoading: loading,
      error: err,
      totalPages: pages,
      resultsCount: counts
    };
  }, [
    multiSearchQuery.data,
    moviesQuery.data,
    tvQuery.data,
    peopleQuery.data,
    multiSearchQuery.isLoading,
    moviesQuery.isLoading,
    tvQuery.isLoading,
    peopleQuery.isLoading,
    multiSearchQuery.error,
    moviesQuery.error,
    tvQuery.error,
    peopleQuery.error,
    isSpecialSearch,
    decodedTerm,
    sortBy
  ]);

  if (!decodedTerm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Termo de busca não encontrado
          </h1>
          <p className="text-muted-foreground">
            Por favor, tente uma nova busca.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchHeader 
        searchTerm={decodedTerm}
        totalResults={resultsCount.all}
        isSpecialSearch={isSpecialSearch}
      />

      <SearchFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        resultsCount={resultsCount}
        isSpecialSearch={isSpecialSearch}
      />

      <SearchGrid
        results={allResults}
        isLoading={isLoading}
        error={error}
        activeFilter={activeFilter}
      />

      {!isLoading && allResults.length > 0 && totalPages > 1 && (
        <SearchPagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default SearchResults;
