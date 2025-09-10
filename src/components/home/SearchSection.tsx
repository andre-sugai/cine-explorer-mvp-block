import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Dice6, Mic, MicOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LuckyButton } from '@/components/LuckyButton';
import { TrailerButton } from '@/components/TrailerButton';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { toast } from '@/hooks/use-toast';
import {
  getPopularMovies,
  getPopularTVShows,
  TMDBMovie,
  TMDBTVShow,
} from '@/utils/tmdb';
import { filterAdultContent } from '@/utils/adultContentFilter';

export const SearchSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [randomItem, setRandomItem] = useState<TMDBMovie | TMDBTVShow | null>(
    null
  );
  const navigate = useNavigate();

  // Hook para busca por voz
  const {
    isSupported: isVoiceSupported,
    isListening,
    startListening,
    stopListening,
    error: voiceError,
  } = useVoiceSearch();

  // Efeito para mostrar erros de voz
  useEffect(() => {
    if (voiceError) {
      toast({
        title: 'Erro na busca por voz',
        description: voiceError,
        variant: 'destructive',
      });
    }
  }, [voiceError]);

  useEffect(() => {
    // Busca filmes e séries populares e escolhe uma imagem aleatória
    const fetchRandomBg = async () => {
      try {
        const [movies, tvs] = await Promise.all([
          getPopularMovies(1),
          getPopularTVShows(1),
        ]);

        // Aplicar filtro de conteúdo adulto
        const filteredMovies = filterAdultContent(movies?.results || []);
        const filteredTVs = filterAdultContent(tvs?.results || []);

        const all = [...filteredMovies, ...filteredTVs];
        const candidates = all.filter(
          (item) => item.backdrop_path || item.poster_path
        );
        if (candidates.length > 0) {
          const random =
            candidates[Math.floor(Math.random() * candidates.length)];
          setRandomItem(random);
          setBgImage(
            `https://image.tmdb.org/t/p/original${
              random.backdrop_path || random.poster_path
            }`
          );
        }
      } catch (e) {
        setBgImage(null);
        setRandomItem(null);
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

  /**
   * Função para lidar com a busca por voz
   * Inicia o reconhecimento de fala e atualiza o campo de busca com o resultado
   */
  const handleVoiceSearch = () => {
    if (!isVoiceSupported) {
      toast({
        title: 'Navegador não suportado',
        description:
          'Seu navegador não suporta busca por voz. Tente usar Chrome, Edge ou Safari.',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    startListening((transcript) => {
      setSearchTerm(transcript);
      toast({
        title: 'Busca por voz',
        description: `"${transcript}" - Clique em Pesquisar para buscar`,
      });
    });
  };

  const handleRandomItemClick = () => {
    if (randomItem) {
      if ('title' in randomItem) {
        // It's a movie
        navigate(`/filme/${randomItem.id}`);
      } else if ('name' in randomItem && 'first_air_date' in randomItem) {
        // It's a TV show
        navigate(`/serie/${randomItem.id}`);
      }
    }
  };

  const getRandomItemDisplayName = () => {
    if (!randomItem) return '';

    const title = 'title' in randomItem ? randomItem.title : randomItem.name;
    const date =
      'release_date' in randomItem
        ? randomItem.release_date
        : randomItem.first_air_date;

    const year = date ? new Date(date).getFullYear() : '';
    return year ? `${title} (${year})` : title;
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

      {/* Nome do filme/série no canto inferior esquerdo */}
      {randomItem && (
        <div className="absolute bottom-4 left-4 z-20">
          <button
            onClick={handleRandomItemClick}
            className="
              px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm
              text-white text-sm font-medium hover:bg-black/80
              transition-all duration-200 hover:scale-105
              border border-white/20 hover:border-white/40
            "
          >
            {getRandomItemDisplayName()}
          </button>
        </div>
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
                    pl-16 pr-48 h-16 text-lg bg-secondary/50 border-none 
                    focus:bg-background focus:ring-2 focus:ring-primary/50
                    text-foreground placeholder:text-muted-foreground
                    transition-all duration-200
                  "
                />

                {/* Botão de busca por voz */}
                {isVoiceSupported && (
                  <Button
                    type="button"
                    onClick={handleVoiceSearch}
                    disabled={isListening}
                    className={`
                      absolute right-36 top-1/2 transform -translate-y-1/2 h-12 w-12 p-0
                      rounded-full transition-all duration-200
                      ${
                        isListening
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                          : 'bg-primary/20 hover:bg-primary/40 text-primary hover:text-primary'
                      }
                      ${
                        isListening
                          ? 'shadow-lg shadow-red-500/50'
                          : 'hover:scale-105'
                      }
                    `}
                    title={isListening ? 'Parar gravação' : 'Buscar por voz'}
                  >
                    {isListening ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </Button>
                )}

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

          {/* Botões de ação lado a lado */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <LuckyButton
              variant="default"
              className="w-full sm:w-auto min-w-[180px]"
            />
            <TrailerButton
              variant="default"
              className="w-full sm:w-auto min-w-[180px]"
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Use palavras-chave em português ou inglês para encontrar o que
            procura
            {isVoiceSupported && (
              <span className="block mt-1">
                🎤 Ou clique no ícone de microfone para buscar por voz
              </span>
            )}
          </p>
        </div>
      </div>
    </section>
  );
};
