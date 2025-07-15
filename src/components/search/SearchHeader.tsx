
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchHeaderProps {
  searchTerm: string;
  totalResults: number;
  isSpecialSearch?: boolean;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({ 
  searchTerm, 
  totalResults, 
  isSpecialSearch 
}) => {
  const navigate = useNavigate();

  const getPageTitle = () => {
    if (isSpecialSearch) {
      switch (searchTerm) {
        case 'popular-movies': return 'Filmes Populares';
        case 'popular-tv': return 'Séries Populares';
        case 'popular-people': return 'Pessoas Populares';
        case 'popular-directors': return 'Diretores Populares';
        default: return 'Resultados';
      }
    }
    return `Resultados para "${searchTerm}"`;
  };

  return (
    <div className="mb-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            {getPageTitle()}
          </h1>
          {totalResults > 0 && (
            <p className="text-muted-foreground">
              {totalResults.toLocaleString()} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
