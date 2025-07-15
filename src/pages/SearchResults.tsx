
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchMulti, searchMovies, searchTVShows, searchPeople } from '@/utils/tmdb';
import { TMDBMovie, TMDBTVShow, TMDBPerson } from '@/utils/tmdb';
import { Layout } from '@/components/Layout';
import { SearchHeader } from '@/components/search/SearchHeader';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchGrid } from '@/components/search/SearchGrid';
import { SearchPagination } from '@/components/search/SearchPagination';
import { SearchSkeleton } from '@/components/search/SearchSkeleton';
import { NoResults } from '@/components/search/NoResults';

export type SearchFilter = 'all' | 'movies' | 'tv' | 'people';
export type SortOption = 'relevance' | 'date' | 'rating';

const SearchResults: React.FC = () => {
  const { term } = useParams<{ term: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [currentPage, setCurrentPage] = useState(1);

  const decodedTerm = term ? decodeURIComponent(term) : '';

  // Sync URL params with state
  useEffect(() => {
    const filter = searchParams.get('filter') as SearchFilter || 'all';
    const sort = searchParams.get('sort') as SortOption || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');

    setActiveFilter(filter);
    setSortBy(sort);
    setCurrentPage(page);
  }, [searchParams]);

  const updateUrlParams = (updates: Partial<{ filter: SearchFilter; sort: SortOption; page: number }>) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (updates.filter) newParams.set('filter', updates.filter);
    if (updates.sort) newParams.set('sort', updates.sort);
    if (updates.page) newParams.set('page', updates.page.toString());
    
    setSearchParams(newParams);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', decodedTerm, activeFilter, currentPage],
    queryFn: async () => {
      if (!decodedTerm) return { results: [], total_pages: 0, total_results: 0 };
      
      switch (activeFilter) {
        case 'movies':
          return await searchMovies(decodedTerm, currentPage);
        case 'tv':
          return await searchTVShows(decodedTerm, currentPage);
        case 'people':
          return await searchPeople(decodedTerm, currentPage);
        default:
          return await searchMulti(decodedTerm, currentPage);
      }
    },
    enabled: !!decodedTerm,
  });

  const handleFilterChange = (filter: SearchFilter) => {
    setCurrentPage(1);
    updateUrlParams({ filter, page: 1 });
  };

  const handleSortChange = (sort: SortOption) => {
    updateUrlParams({ sort });
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page });
  };

  // Sort results
  const sortedResults = React.useMemo(() => {
    if (!data?.results) return [];
    
    const results = [...data.results];
    
    switch (sortBy) {
      case 'date':
        return results.sort((a, b) => {
          const dateA = ('release_date' in a ? a.release_date : 'first_air_date' in a ? a.first_air_date : '') || '';
          const dateB = ('release_date' in b ? b.release_date : 'first_air_date' in b ? b.first_air_date : '') || '';
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
      case 'rating':
        return results.sort((a, b) => {
          // Only sort by vote_average if both items have it (movies and TV shows)
          const ratingA = ('vote_average' in a ? a.vote_average : 0) || 0;
          const ratingB = ('vote_average' in b ? b.vote_average : 0) || 0;
          return ratingB - ratingA;
        });
      case 'relevance':
      default:
        return results; // Keep original order
    }
  }, [data?.results, sortBy]);

  if (!decodedTerm) {
    return (
      <Layout>
        <NoResults 
          searchTerm=""
          message="Digite um termo de busca para começar"
        />
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <SearchHeader 
            searchTerm={decodedTerm}
            totalResults={0}
            isLoading={true}
          />
          <SearchSkeleton />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <NoResults 
          searchTerm={decodedTerm}
          message="Erro ao buscar resultados. Tente novamente."
        />
      </Layout>
    );
  }

  const hasResults = sortedResults.length > 0;

  return (
    <Layout>
      <div className="space-y-6">
        <SearchHeader 
          searchTerm={decodedTerm}
          totalResults={data?.total_results || 0}
          isLoading={false}
        />

        {hasResults && (
          <>
            <SearchFilters
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              results={data?.results || []}
            />

            <SearchGrid 
              results={sortedResults}
              searchTerm={decodedTerm}
            />

            {(data?.total_pages || 0) > 1 && (
              <SearchPagination
                currentPage={currentPage}
                totalPages={data?.total_pages || 1}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}

        {!hasResults && (
          <NoResults 
            searchTerm={decodedTerm}
            message="Nenhum resultado encontrado para sua busca"
          />
        )}
      </div>
    </Layout>
  );
};

export default SearchResults;
