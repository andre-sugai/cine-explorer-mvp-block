
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Trash2, Download } from 'lucide-react';

interface WatchedControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  genreFilter: string;
  setGenreFilter: (genre: string) => void;
  yearFilter: string;
  setYearFilter: (year: string) => void;
  availableYears: number[];
  onClearAll: () => void;
  onExport: () => void;
  hasWatched: boolean;
}

export const WatchedControls: React.FC<WatchedControlsProps> = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  genreFilter,
  setGenreFilter,
  yearFilter,
  setYearFilter,
  availableYears,
  onClearAll,
  onExport,
  hasWatched
}) => {
  const genres = [
    { id: '28', name: 'Ação' },
    { id: '12', name: 'Aventura' },
    { id: '35', name: 'Comédia' },
    { id: '18', name: 'Drama' },
    { id: '27', name: 'Terror' },
    { id: '878', name: 'Ficção Científica' },
    { id: '53', name: 'Thriller' },
    { id: '10749', name: 'Romance' }
  ];

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar nos assistidos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-secondary/50 border-primary/20"
        />
      </div>

      {/* Filtros e Controles */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 bg-secondary/50 border-primary/20">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recente</SelectItem>
              <SelectItem value="oldest">Mais antigo</SelectItem>
              <SelectItem value="rating">Melhor nota</SelectItem>
              <SelectItem value="alphabetical">Alfabética</SelectItem>
              <SelectItem value="year">Ano de lançamento</SelectItem>
            </SelectContent>
          </Select>

          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="w-40 bg-secondary/50 border-primary/20">
              <SelectValue placeholder="Gênero" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {genres.map(genre => (
                <SelectItem key={genre.id} value={genre.id}>{genre.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-32 bg-secondary/50 border-primary/20">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasWatched && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onExport}
              className="text-primary border-primary/20 hover:bg-primary/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>

            <Button
              variant="outline"
              onClick={onClearAll}
              className="text-red-500 border-red-500/20 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar tudo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
