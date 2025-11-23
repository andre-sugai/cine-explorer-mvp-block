import React, { useState, useEffect, useRef } from 'react';
import { buildImageUrl } from '@/utils/tmdb';
import { cn } from '@/lib/utils';

interface FeaturedGalleryProps {
  images: any[];
  title: string;
  className?: string;
  selectedImage: any;
  onSelectImage: (image: any) => void;
}

export const FeaturedGallery: React.FC<FeaturedGalleryProps> = ({
  images,
  title,
  className,
  selectedImage,
  onSelectImage,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<(HTMLButtonElement | null)[]>([]);



  // Scroll para centralizar a miniatura selecionada
  useEffect(() => {
    if (selectedImage && scrollContainerRef.current) {
      const index = images.findIndex(img => img.file_path === selectedImage.file_path);
      const thumbnail = thumbnailsRef.current[index];
      
      if (thumbnail) {
        const container = scrollContainerRef.current;
        const scrollLeft = thumbnail.offsetLeft - (container.offsetWidth / 2) + (thumbnail.offsetWidth / 2);
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedImage, images]);



  if (!images || images.length === 0) {
    return (
      <div className="flex justify-center items-center h-full text-muted-foreground">
        Nenhuma imagem encontrada.
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4 h-full", className)}>
      {/* Imagem em Destaque */}
      <div className="relative flex-1 min-h-0 w-full bg-black/50 rounded-lg overflow-hidden flex items-center justify-center border border-primary/20 shadow-lg group">
        {selectedImage && (
          <img
            src={buildImageUrl(selectedImage.file_path, 'original')}
            alt={title}
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>

      {/* Lista de Thumbnails com Scroll Horizontal */}
      <div className="relative flex-shrink-0 h-20">
        <div 
          ref={scrollContainerRef}
          className="absolute inset-0 flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent items-center"
        >
          {images.map((img, idx) => (
            <button
              key={img.file_path + idx}
              ref={(el) => (thumbnailsRef.current[idx] = el)}
              onClick={(e) => {
                e.stopPropagation();
                onSelectImage(img);
              }}
              className={cn(
                "relative flex-shrink-0 w-24 h-16 rounded-md overflow-hidden transition-all duration-200",
                "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary",
                selectedImage?.file_path === img.file_path 
                  ? "ring-2 ring-primary scale-105 shadow-[0_0_10px_rgba(255,215,0,0.5)]" 
                  : "opacity-70 hover:opacity-100"
              )}
            >
              <img
                src={buildImageUrl(img.file_path, 'w200')}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
