import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { getMovieImages, getTVShowImages, buildImageUrl } from '@/utils/tmdb';
import { Loader, Play, Square, X, Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movieId?: number;
  tvShowId?: number;
  title: string;
  type?: 'movie' | 'tv';
  prefetchedImages?: any[];
  initialIndex?: number;
  isPoster?: boolean;
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  open,
  onOpenChange,
  movieId,
  tvShowId,
  title,
  type,
  prefetchedImages,
  initialIndex = 0,
  isPoster = false,
}) => {
  const [images, setImages] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (prefetchedImages && prefetchedImages.length > 0) {
        setImages(prefetchedImages);
        setCurrentIndex(initialIndex);
      } else if (type && (movieId || tvShowId)) {
        const fetchImages = async () => {
          setLoading(true);
          try {
            let data;
            if (type === 'movie' && movieId) {
              data = await getMovieImages(movieId);
            } else if (type === 'tv' && tvShowId) {
              data = await getTVShowImages(tvShowId);
            }

            if (data) {
              const allImages = [
                ...(data.backdrops || []),
                ...(data.posters || []),
              ];
              setImages(allImages);
              setCurrentIndex(0);
            }
          } catch (error) {
            console.error('Erro ao carregar imagens:', error);
          } finally {
            setLoading(false);
          }
        };
        fetchImages();
      }
    } else {
      setIsPlaying(false);
      setIsFullscreen(false);
    }
  }, [open, movieId, tvShowId, type, prefetchedImages, initialIndex]);

  const handleNext = useCallback(() => {
    if (!images || images.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images]);

  const handlePrev = useCallback(() => {
    if (!images || images.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images]);

  // Slideshow logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && open) {
      interval = setInterval(handleNext, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, handleNext, open]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handleNext, handlePrev]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "bg-gradient-cinema border-primary/20 flex flex-col p-0 gap-0 overflow-hidden transition-all duration-300",
          isFullscreen 
            ? "w-screen h-screen max-w-none max-h-none rounded-none border-0" 
            : "max-w-[95vw] w-full h-[95vh] rounded-lg"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-6 pb-2 flex-shrink-0 relative z-50 bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-primary text-xl">Galeria: {title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {currentIndex + 1} de {images.length}
            </DialogDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className="border-primary/20 hover:bg-primary/10 hover:text-primary"
              title={isPlaying ? "Parar Slideshow" : "Iniciar Slideshow"}
            >
              {isPlaying ? (
                <Square className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="border-primary/20 hover:bg-primary/10 hover:text-primary"
              title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            
            <DialogClose asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex items-center justify-center p-6 relative overflow-hidden perspective-1000">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : images.length > 0 ? (
            <>
              {images.map((img, idx) => {
                const total = images.length;
                let diff = idx - currentIndex;
                
                if (total > 2) {
                  if (diff > total / 2) diff -= total;
                  else if (diff < -total / 2) diff += total;
                }

                let positionClasses = "z-0 scale-50 opacity-0 translate-x-0 pointer-events-none";
                let isVisible = false;

                if (diff === 0) {
                  positionClasses = "z-30 scale-100 translate-x-0 opacity-100 shadow-2xl shadow-black/80 ring-1 ring-white/20";
                  isVisible = true;
                } else if (diff === 1) {
                  positionClasses = "z-20 scale-[0.80] translate-x-[75%] md:translate-x-[85%] opacity-25 brightness-50 hover:opacity-100 hover:brightness-100 cursor-pointer shadow-xl";
                  isVisible = true;
                } else if (diff === -1) {
                  positionClasses = "z-20 scale-[0.80] -translate-x-[75%] md:-translate-x-[85%] opacity-25 brightness-50 hover:opacity-100 hover:brightness-100 cursor-pointer shadow-xl";
                  isVisible = true;
                }

                return (
                  <div
                    key={img.file_path + idx}
                    className={cn(
                      "absolute transition-all duration-500 ease-out flex items-center justify-center",
                      isFullscreen 
                        ? (isPoster ? "w-[75%] md:w-[35%] max-w-[550px] h-[95%]" : "w-[95%] md:w-[80%] h-[90%]")
                        : (isPoster ? "w-[75%] md:w-[45%] max-w-[600px] h-[90%]" : "w-[90%] md:w-[75%] max-w-[1000px] h-[85%]"),
                      positionClasses
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (diff === 1) handleNext();
                      if (diff === -1) handlePrev();
                    }}
                  >
                    {isVisible && (
                      <div className="w-full h-full rounded-2xl overflow-hidden bg-black/50 backdrop-blur-sm flex items-center justify-center relative">
                        <img
                          src={buildImageUrl(img.file_path, 'original')}
                          alt={`Imagem ${idx + 1}`}
                          className="max-w-full max-h-full object-contain transition-transform duration-700"
                          loading={diff === 0 ? "eager" : "lazy"}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-8 z-40 h-12 w-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/20 hidden md:flex"
                    onClick={handlePrev}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-8 z-40 h-12 w-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/20 hidden md:flex"
                    onClick={handleNext}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}
            </>
          ) : (
            <div className="text-muted-foreground">Nenhuma imagem encontrada.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
