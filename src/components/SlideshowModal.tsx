import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getPopularMovies, getTrendingMovies, getPopularTVShows, getMoviesByGenre, getTVShowsByGenre } from '@/utils/tmdb';
import { SlideshowConfig } from './SlideshowSettingsModal';

interface SlideshowModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SlideshowConfig;
}

interface SlideItem {
  id: number;
  title: string;
  backdrop_path: string;
  media_type: 'movie' | 'tv';
}

export const SlideshowModal: React.FC<SlideshowModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [items, setItems] = useState<SlideItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch movies
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        const randomPages = Array.from({length: 5}, () => Math.floor(Math.random() * 50) + 1);
        const promises = [];
        
        // Fetch Movies
        if (config.type === 'all' || config.type === 'movie') {
          if (config.genreId !== 'all') {
             promises.push(...randomPages.map(page => getMoviesByGenre(Number(config.genreId), page)));
          } else {
             promises.push(...randomPages.map(page => getPopularMovies(page)));
             promises.push(getTrendingMovies('week'));
          }
        }
        
        // Fetch TV Shows
        if (config.type === 'all' || config.type === 'tv') {
          if (config.genreId !== 'all') {
             promises.push(...randomPages.map(page => getTVShowsByGenre(Number(config.genreId), page)));
          } else {
             promises.push(...randomPages.map(page => getPopularTVShows(page)));
          }
        }
        
        const results = await Promise.all(promises);
        let combined: any[] = [];
        results.forEach(res => {
          if (res?.results) {
            combined = [...combined, ...res.results];
          }
        });
        
        // Idiomas asiáticos mais comuns no TMDB (Japonês, Coreano, Chinês, Mandarim, Cantonês, Tailandês, Hindi, Indonésio, Tagalo, Vietnamita)
        const asianLangs = ['ja', 'ko', 'zh', 'cn', 'th', 'hi', 'id', 'tl', 'vi'];

        // Filter valid horizontal images and exclude Asian movies
        let validItems = combined.filter(item => 
          item && 
          item.backdrop_path && 
          !asianLangs.includes(item.original_language)
        );
        
        // Shuffle the large pool
        validItems = validItems.sort(() => Math.random() - 0.5);
        
        // Deduplicate
        const unique = Array.from(new Map(validItems.map(item => [item.id, item])).values());
        
        if (isMounted) {
          setItems(unique.map(m => ({
            id: m.id,
            title: m.title || m.original_title || m.name || m.original_name || 'Desconhecido',
            backdrop_path: m.backdrop_path,
            media_type: m.title ? 'movie' : 'tv'
          })));
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erro ao carregar imagens pro slideshow:", error);
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchMovies();
    
    return () => { isMounted = false; };
  }, [isOpen, config]);

  // Request fullscreen when opening
  useEffect(() => {
    if (isOpen && containerRef.current && items.length > 0) {
      const container = containerRef.current;
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(err => console.log('Erro tela cheia:', err));
      }
    }
  }, [isOpen, items]);

  // Exit fullscreen when closing
  useEffect(() => {
    if (!isOpen && document.fullscreenElement) {
      document.exitFullscreen().catch(e => console.log(e));
    }
  }, [isOpen]);

  // Interval logic based on config duration
  useEffect(() => {
    if (!isOpen || items.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, config.duration * 1000);
    
    return () => clearInterval(interval);
  }, [isOpen, items, config.duration]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-3 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      {isLoading ? (
        <div className="text-white text-xl animate-pulse">Carregando galeria...</div>
      ) : items.length > 0 ? (
        <>
          {items.map((item, index) => {
            const isActive = index === currentIndex;
            const isNext = index === (currentIndex + 1) % items.length;
            const isPrev = index === (currentIndex - 1 + items.length) % items.length;
            
            // Only render active, next (for preloading), and prev (for crossfading)
            if (!isActive && !isNext && !isPrev) return null;

            return (
              <div 
                key={`${item.id}-${index}`}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <img 
                  src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Movie Title Tag */}
                <div className="absolute bottom-10 left-10 z-20">
                  <div 
                    onClick={() => {
                      onClose();
                      navigate(`/${item.media_type === 'movie' ? 'filme' : 'serie'}/${item.id}`);
                    }}
                    className="px-6 py-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl cursor-pointer hover:bg-black/80 hover:scale-105 transition-all duration-300"
                  >
                    <h2 className="text-white text-2xl md:text-4xl font-bold tracking-tight">
                      {item.title}
                    </h2>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <div className="text-white">Nenhuma imagem encontrada.</div>
      )}
    </div>,
    document.body
  );
};
