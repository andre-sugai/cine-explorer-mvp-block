import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Dice6 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LuckyButton } from '@/components/LuckyButton';
import { getPopularMovies, getPopularTVShows } from '@/utils/tmdb';

export const SearchSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Busca filmes e séries populares e escolhe uma imagem aleatória
    const fetchRandomBg = async () => {
      try {
        const [movies, tvs] = await Promise.all([
          getPopularMovies(1),
          getPopularTVShows(1),
        ]);
        const all = [...(movies?.results || []), ...(tvs?.results || [])];
        const candidates = all.filter(
          (item) => item.backdrop_path || item.poster_path
        );
        if (candidates.length > 0) {
          const random =
            candidates[Math.floor(Math.random() * candidates.length)];
          setBgImage(
            `https://image.tmdb.org/t/p/original${
              random.backdrop_path || random.poster_path
            }`
          );
        }
      } catch (e) {
        setBgImage(null);
      }
    };
    fetchRandomBg();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/busca/${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <section
      className="relative py-20 px-4 overflow-hidden"
      style={
        bgImage
          ? {
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}
      }
    >
      {/* Overlay escuro */}
      {bgImage && (
        <div className="absolute inset-0 bg-black/70 pointer-events-none z-0" />
      )}
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Hero Title */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
            Explore o Mundo do
            <span className="bg-gradient-gold bg-clip-text text-transparent">
              {' '}
              Cinema
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Descubra filmes, séries, atores e diretores. Sua jornada
            cinematográfica começa aqui.
          </p>
        </div>

        {/* Centralized Search */}
        <div className="space-y-6">
          <Card
            className={
              `relative overflow-hidden transition-all duration-300 border-primary/20 ` +
              (isSearchFocused
                ? 'shadow-glow border-primary/40 scale-[1.02]'
                : 'shadow-cinema') +
              ' bg-gradient-cinema'
            }
          >
            <form onSubmit={handleSearch} className="p-2">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Busque por filmes, séries, atores ou diretores..."
                  className="
                    pl-16 pr-40 h-16 text-lg bg-secondary/50 border-none 
                    focus:bg-background focus:ring-2 focus:ring-primary/50
                    text-foreground placeholder:text-muted-foreground
                    transition-all duration-200
                  "
                />
                <Button
                  type="submit"
                  className="
                    absolute right-2 top-1/2 transform -translate-y-1/2 h-12 px-8
                    bg-gradient-gold hover:opacity-90 text-cinema-dark font-semibold
                    transition-all duration-200 hover:scale-105
                  "
                >
                  Pesquisar
                </Button>
              </div>
            </form>
          </Card>

          {/* Lucky Button substituído pelo componente LuckyButton */}
          <LuckyButton variant="default" className="w-full max-w-xs mx-auto" />

          <p className="text-sm text-muted-foreground">
            Use palavras-chave em português ou inglês para encontrar o que
            procura
          </p>
        </div>
      </div>
    </section>
  );
};
