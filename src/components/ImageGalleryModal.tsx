import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { getMovieImages, getTVShowImages } from '@/utils/tmdb';
import { Loader, Play, Square, X, Maximize2, Minimize2 } from 'lucide-react';
import { FeaturedGallery } from '@/components/FeaturedGallery';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movieId?: number;
  tvShowId?: number;
  title: string;
  type: 'movie' | 'tv';
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  open,
  onOpenChange,
  movieId,
  tvShowId,
  title,
  type,
}) => {
  const [images, setImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
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
            // Combinar backdrops e posters, priorizando backdrops
            const allImages = [
              ...(data.backdrops || []),
              ...(data.posters || []),
            ];
            setImages(allImages);
            if (allImages.length > 0) {
              setSelectedImage(allImages[0]);
            }
          }
        } catch (error) {
          console.error('Erro ao carregar imagens:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchImages();
    } else {
      setImages([]);
      setSelectedImage(null);
      setIsPlaying(false);
      setIsFullscreen(false);
    }
  }, [open, movieId, tvShowId, type]);

  const handleNext = () => {
    if (!images || images.length === 0) return;
    const currentIndex = images.findIndex(
      (img) => img.file_path === selectedImage?.file_path
    );
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  };

  const handlePrev = () => {
    if (!images || images.length === 0) return;
    const currentIndex = images.findIndex(
      (img) => img.file_path === selectedImage?.file_path
    );
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prevIndex]);
  };

  // Slideshow logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(handleNext, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, images, selectedImage]);

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
  }, [open, images, selectedImage]);

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
        <DialogHeader className="flex flex-row items-center justify-between p-6 pb-2 flex-shrink-0">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-primary text-xl">Galeria: {title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Imagens oficiais e posters
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

        <div className="flex-1 min-h-0 flex flex-col p-6 pt-2 gap-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <FeaturedGallery 
              images={images} 
              title={title} 
              selectedImage={selectedImage}
              onSelectImage={setSelectedImage}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
