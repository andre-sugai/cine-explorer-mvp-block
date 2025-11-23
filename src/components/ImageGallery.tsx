import React, { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { buildImageUrl } from '@/utils/tmdb';

interface ImageGalleryProps {
  images: { file_path: string }[];
  size?: string;
  alt?: string;
  maxThumbs?: number;
  onImageClick?: (index: number) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  size = 'w500',
  alt = 'Imagem',
  maxThumbs = 10,
  onImageClick,
}) => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-4 overflow-x-auto pb-2">
        {images.slice(0, maxThumbs).map((img, idx) => (
          <img
            key={img.file_path + idx}
            src={buildImageUrl(img.file_path, size)}
            alt={alt}
            className="rounded-lg shadow-cinema h-40 object-cover cursor-pointer transition-transform hover:scale-105"
            loading="lazy"
            onClick={() => {
              if (onImageClick) {
                onImageClick(idx);
              } else {
                setIndex(idx);
                setOpen(true);
              }
            }}
          />
        ))}
      </div>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={images.map((img) => ({
          src: buildImageUrl(img.file_path, 'original'),
        }))}
        index={index}
        on={{ view: ({ index }) => setIndex(index) }}
        styles={{ container: { backgroundColor: 'rgba(0,0,0,0.95)' } }}
      />
    </>
  );
};
