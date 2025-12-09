import React from 'react';
import { Button } from '@/components/ui/button';
import { Film, Tv, Users, Camera, Calendar, Library, PlayCircle } from 'lucide-react';

type ContentCategory =
  | 'watching'
  | 'movies'
  | 'tv'
  | 'actors'
  | 'directors'
  | 'cinema'
  | 'collections';

interface CategoryTabsProps {
  activeCategory: ContentCategory;
  onCategoryChange: (category: ContentCategory) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  const [indicatorStyle, setIndicatorStyle] = React.useState({
    left: 0,
    width: 0,
  });
  const buttonsRef = React.useRef<(HTMLButtonElement | null)[]>([]);

  const categories = [
    {
      id: 'movies' as ContentCategory,
      label: 'Filmes',
      icon: Film,
      description: 'Populares nos streamings',
    },
    {
      id: 'tv' as ContentCategory,
      label: 'Séries',
      icon: Tv,
      description: 'Em alta nos streamings',
    },
    {
      id: 'cinema' as ContentCategory,
      label: 'Cinema',
      icon: Calendar,
      description: 'Filmes em cartaz',
    },
    {
      id: 'actors' as ContentCategory,
      label: 'Atores',
      icon: Users,
      description: 'Atores famosos',
    },
    {
      id: 'directors' as ContentCategory,
      label: 'Diretores',
      icon: Camera,
      description: 'Diretores renomados',
    },
    {
      id: 'collections' as ContentCategory,
      label: 'Coleções',
      icon: Library,
      description: 'Séries de filmes',
    },
    {
      id: 'watching' as ContentCategory,
      label: 'Continuar',
      icon: PlayCircle,
      description: 'Séries que estou vendo',
    },
  ];

  React.useEffect(() => {
    const activeIndex = categories.findIndex(
      (cat) => cat.id === activeCategory
    );
    const activeButton = buttonsRef.current[activeIndex];

    if (activeButton) {
      const parent = activeButton.parentElement;
      if (parent) {
        setIndicatorStyle({
          left: activeButton.offsetLeft,
          width: activeButton.offsetWidth,
        });
      }
    }
  }, [activeCategory]);

  return (
    <section className="px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">
            Explore por Categoria
          </h2>
          <p className="text-muted-foreground">
            Descubra conteúdo popular em cada categoria
          </p>
        </div>

        {/* Category Navigation */}
        <div className="w-full">
          <div className="relative grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 p-2 bg-secondary/30 rounded-lg border border-primary/20">
            {/* Indicador deslizante */}
            <div
              className="absolute bg-gradient-gold rounded-md shadow-glow transition-all duration-500 ease-in-out pointer-events-none"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                top: '8px',
                bottom: '8px',
                zIndex: 0,
              }}
            />

            {categories.map((category, index) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;

              return (
                <Button
                  key={category.id}
                  ref={(el) => (buttonsRef.current[index] = el)}
                  onClick={() => onCategoryChange(category.id)}
                  variant="ghost"
                  className={`
                    relative z-10 flex flex-col items-center justify-center gap-1 p-3 rounded-md 
                    transition-colors duration-300 ease-in-out
                    h-auto min-h-[70px]
                    hover:bg-transparent focus:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0
                    ${
                      isActive
                        ? 'text-cinema-dark font-semibold'
                        : 'text-foreground hover:text-primary'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <div className="font-medium text-sm">{category.label}</div>
                  </div>
                  <div
                    className={`text-xs ${
                      isActive ? 'text-cinema-dark/70' : 'text-muted-foreground'
                    }`}
                  >
                    {category.description}
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
