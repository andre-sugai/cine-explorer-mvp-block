import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  searchMulti,
  searchMovies,
  searchTVShows,
  searchPeople,
} from '@/utils/tmdb';
import { TMDBMovie, TMDBTVShow, TMDBPerson } from '@/utils/tmdb';
import { filterAdultContent } from '@/utils/adultContentFilter';
import { Layout } from '@/components/Layout';
import { SearchHeader } from '@/components/search/SearchHeader';
import {
  SearchFilters,
  FilterType,
  SortOption,
} from '@/components/search/SearchFilters';
import { SearchGrid } from '@/components/search/SearchGrid';
import { SearchPagination } from '@/components/search/SearchPagination';
import { SearchSkeleton } from '@/components/search/SearchSkeleton';
import { NoResults } from '@/components/search/NoResults';

const SearchResults: React.FC = () => {
  const { term } = useParams<{ term: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [currentPage, setCurrentPage] = useState(1);

  const decodedTerm = term ? decodeURIComponent(term) : '';

  // Sync URL params with state
  useEffect(() => {
    const filter = (searchParams.get('filter') as FilterType) || 'all';
    const sort = (searchParams.get('sort') as SortOption) || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');

    setActiveFilter(filter);
    setSortBy(sort);
    setCurrentPage(page);
  }, [searchParams]);

  const updateUrlParams = (
    updates: Partial<{ filter: FilterType; sort: SortOption; page: number }>
  ) => {
    const newParams = new URLSearchParams(searchParams);

    if (updates.filter) newParams.set('filter', updates.filter);
    if (updates.sort) newParams.set('sort', updates.sort);
    if (updates.page) newParams.set('page', updates.page.toString());

    setSearchParams(newParams);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', decodedTerm, activeFilter, currentPage],
    queryFn: async () => {
      if (!decodedTerm)
        return { results: [], total_pages: 0, total_results: 0 };

      console.log(
        `🔍 Buscando: "${decodedTerm}" | Filtro: ${activeFilter} | Página: ${currentPage}`
      );

      let response;
      switch (activeFilter) {
        case 'movie':
          response = await searchMovies(decodedTerm, currentPage);
          break;
        case 'tv':
          response = await searchTVShows(decodedTerm, currentPage);
          break;
        case 'person':
          response = await searchPeople(decodedTerm, currentPage);
          break;
        default:
          response = await searchMulti(decodedTerm, currentPage);
          break;
      }

      console.log(
        `📊 API retornou ${
          response?.results?.length || 0
        } resultados para "${decodedTerm}"`
      );

      // APENAS aplicar filtro de conteúdo adulto para busca específica de filmes
      // Para séries (tv), pessoas (person) e busca geral (all), não aplicar filtro
      if (activeFilter === 'movie' && response?.results) {
        const originalCount = response.results.length;
        response.results = filterAdultContent(response.results);
        console.log(
          `🎦 Filmes: ${originalCount} → ${response.results.length} após filtro adulto`
        );
      } else {
        console.log(
          `📺 Categoria "${activeFilter}": mantendo todos os ${
            response?.results?.length || 0
          } resultados (sem filtro)`
        );
      }

      return response;
    },
    enabled: !!decodedTerm,
  });

  const handleFilterChange = (filter: FilterType) => {
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
          const dateA =
            ('release_date' in a
              ? a.release_date
              : 'first_air_date' in a
              ? a.first_air_date
              : '') || '';
          const dateB =
            ('release_date' in b
              ? b.release_date
              : 'first_air_date' in b
              ? b.first_air_date
              : '') || '';
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

  // Calculate results count for filters
  const resultsCount = React.useMemo(() => {
    const results = data?.results || [];
    return {
      all: results.length,
      movie: results.filter((item) => 'title' in item && 'release_date' in item)
        .length,
      tv: results.filter((item) => 'name' in item && 'first_air_date' in item)
        .length,
      person: results.filter((item) => 'known_for' in item).length,
    };
  }, [data?.results]);

  if (!decodedTerm) {
    return (
      <Layout>
        <NoResults />
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <SearchHeader searchTerm={decodedTerm} totalResults={0} />
          <SearchSkeleton />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <NoResults />
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
        />

        {hasResults && (
          <>
            <SearchFilters
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              resultsCount={resultsCount}
            />

            <SearchGrid
              results={sortedResults}
              isLoading={false}
              error={null}
              activeFilter={activeFilter}
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

        {!hasResults && <NoResults />}
      </div>
    </Layout>
  );
};

export default SearchResults;
