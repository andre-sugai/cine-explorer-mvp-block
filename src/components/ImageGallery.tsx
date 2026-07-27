import React, { useState } from 'react';
import { buildImageUrl } from '@/utils/tmdb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageGalleryModal } from './ImageGalleryModal';

interface ImageGalleryProps {
  images: any[];
  size?: string;
  alt?: string;
  maxThumbs?: number;
  onImageClick?: (index: number) => void;
  title?: string;
  isPoster?: boolean;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  size = 'w500',
  alt = 'Imagem',
  maxThumbs = 10,
  onImageClick,
  title = 'Galeria',
  isPoster = false,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const handleImageClick = (idx: number) => {
    if (onImageClick) {
      onImageClick(idx);
    } else {
      setInitialIndex(idx);
      setOpenModal(true);
    }
  };

  return (
    <>
      <Card className="bg-gradient-cinema border-primary/20 overflow-hidden mb-8">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x custom-scrollbar">
            {images.slice(0, maxThumbs).map((img, idx) => (
              <div
                key={img.file_path + idx}
                className={cn(
                  "relative flex-none group cursor-pointer rounded-lg overflow-hidden snap-start",
                  isPoster ? "w-40 md:w-48" : "w-64 md:w-80"
                )}
                onClick={() => handleImageClick(idx)}
              >
                <div className={cn("w-full bg-secondary/30 relative", isPoster ? "aspect-[2/3]" : "aspect-video")}>
                  <img
                    src={buildImageUrl(img.file_path, size)}
                    alt={alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {!onImageClick && (
        <ImageGalleryModal
          open={openModal}
          onOpenChange={setOpenModal}
          title={title}
          prefetchedImages={images}
          initialIndex={initialIndex}
          isPoster={isPoster}
        />
      )}
    </>
  );
};
