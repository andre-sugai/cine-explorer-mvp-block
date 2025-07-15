
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Film, Tv, User, Search, X } from 'lucide-react';

export type FilterType = 'all' | 'movie' | 'tv' | 'person';
export type SortOption = 'relevance' | 'popularity' | 'date' | 'rating';

interface SearchFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultsCount: Record<FilterType, number>;
  isSpecialSearch?: boolean;
}

const filterOptions = [
  { value: 'all' as FilterType, label: 'Todos', icon: Search },
  { value: 'movie' as FilterType, label: 'Filmes', icon: Film },
  { value: 'tv' as FilterType, label: 'Séries', icon: Tv },
  { value: 'person' as FilterType, label: 'Pessoas', icon: User },
];

const sortOptions = [
  { value: 'relevance' as SortOption, label: 'Relevância' },
  { value: 'popularity' as SortOption, label: 'Popularidade' },
  { value: 'date' as SortOption, label: 'Data' },
  { value: 'rating' as SortOption, label: 'Avaliação' },
];

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  resultsCount,
  isSpecialSearch
}) => {
  const hasActiveFilters = activeFilter !== 'all' || sortBy !== 'relevance';

  const clearFilters = () => {
    onFilterChange('all');
    onSortChange('relevance');
  };

  if (isSpecialSearch) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => {
          const Icon = option.icon;
          const count = resultsCount[option.value];
          const isActive = activeFilter === option.value;
          
          return (
            <Button
              key={option.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(option.value)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {option.label}
              {count > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
};
