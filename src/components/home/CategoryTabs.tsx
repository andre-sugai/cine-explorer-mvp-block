
import React from 'react';
import { Button } from '@/components/ui/button';
import { Film, Tv, Users, Camera } from 'lucide-react';

type ContentCategory = 'movies' | 'tv' | 'actors' | 'directors';

interface CategoryTabsProps {
  activeCategory: ContentCategory;
  onCategoryChange: (category: ContentCategory) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ 
  activeCategory, 
  onCategoryChange 
}) => {
  const categories = [
    { 
      id: 'movies' as ContentCategory, 
      label: 'Filmes', 
      icon: Film,
      description: 'Filmes populares'
    },
    { 
      id: 'tv' as ContentCategory, 
      label: 'Séries', 
      icon: Tv,
      description: 'Séries em alta'
    },
    { 
      id: 'actors' as ContentCategory, 
      label: 'Atores', 
      icon: Users,
      description: 'Atores famosos'
    },
    { 
      id: 'directors' as ContentCategory, 
      label: 'Diretores', 
      icon: Camera,
      description: 'Diretores renomados'
    }
  ];

  return (
    <section className="px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">
            Explore por Categoria
          </h2>
          <p className="text-muted-foreground">
            Descubra conteúdo popular em cada categoria
          </p>
        </div>
        
        {/* Category Navigation */}
        <div className="flex justify-center">
          <div className="
            flex gap-2 p-2 bg-secondary/30 rounded-lg border border-primary/20
            overflow-x-auto scrollbar-hide max-w-full
          ">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              
              return (
                <Button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  variant={isActive ? 'default' : 'ghost'}
                  className={`
                    flex items-center gap-3 px-6 py-3 rounded-md transition-all duration-200
                    whitespace-nowrap min-w-fit
                    ${isActive 
                      ? 'bg-gradient-gold text-cinema-dark shadow-glow font-semibold' 
                      : 'text-foreground hover:text-primary hover:bg-secondary/50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{category.label}</div>
                    <div className={`text-xs ${isActive ? 'text-cinema-dark/70' : 'text-muted-foreground'}`}>
                      {category.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
