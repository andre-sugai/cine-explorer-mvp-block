
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SearchPaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const SearchPagination: React.FC<SearchPaginationProps> = ({
  totalPages,
  currentPage,
  onPageChange
}) => {
  const maxPages = Math.min(totalPages, 500);

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Anterior
      </Button>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Página {currentPage} de {maxPages}
        </span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= maxPages}
        className="flex items-center gap-2"
      >
        Próxima
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
