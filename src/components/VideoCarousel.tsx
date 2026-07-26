import React, { useState, useEffect, useCallback } from 'react';
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Video {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
}

interface VideoCarouselProps {
  videos: Video[];
}

export const VideoCarousel: React.FC<VideoCarouselProps> = ({ videos }) => {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  // Filtra apenas vídeos do YouTube e os ordena (Trailers primeiro)
  const youtubeVideos = videos
    .filter(v => v.site === 'YouTube')
    .sort((a, b) => {
      if (a.type === 'Trailer' && b.type !== 'Trailer') return -1;
      if (a.type !== 'Trailer' && b.type === 'Trailer') return 1;
      return 0;
    });

  const currentIndex = activeVideo ? youtubeVideos.findIndex(v => v.id === activeVideo.id) : -1;

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setActiveVideo(youtubeVideos[currentIndex - 1]);
    } else {
      setActiveVideo(youtubeVideos[youtubeVideos.length - 1]);
    }
  }, [currentIndex, youtubeVideos]);

  const handleNext = useCallback(() => {
    if (currentIndex < youtubeVideos.length - 1) {
      setActiveVideo(youtubeVideos[currentIndex + 1]);
    } else {
      setActiveVideo(youtubeVideos[0]);
    }
  }, [currentIndex, youtubeVideos]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeVideo) return;
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideo, handlePrevious, handleNext]);

  if (!youtubeVideos || youtubeVideos.length === 0) return null;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-cinema border-primary/20 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Play className="w-5 h-5" />
            Vídeos e Trailers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x custom-scrollbar">
            {youtubeVideos.map(video => (
              <div
                key={video.id}
                className="relative flex-none w-64 group cursor-pointer rounded-lg overflow-hidden snap-start"
                onClick={() => setActiveVideo(video)}
              >
                {/* Thumbnail */}
                <div className="aspect-video w-full bg-secondary/30 relative">
                  <img
                    src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                    alt={video.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Overlay Escuro */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                  
                  {/* Ícone de Play Glassmorphism */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:bg-primary/80 group-hover:border-primary transition-all duration-300">
                      <Play className="w-5 h-5 text-white ml-1" />
                    </div>
                  </div>
                  
                  {/* Pílula do Tipo de Vídeo */}
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10 uppercase tracking-wider">
                    {video.type}
                  </div>
                </div>
                
                {/* Título do Vídeo */}
                <div className="mt-2 text-sm text-foreground font-medium line-clamp-2 px-1">
                  {video.name}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal do Player */}
      <Dialog open={!!activeVideo} onOpenChange={(open) => !open && setActiveVideo(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-[85vw] h-[85vh] p-0 bg-transparent border-0 shadow-none flex flex-col items-center justify-center overflow-hidden outline-none">
          <DialogTitle className="sr-only">Player de Vídeo</DialogTitle>
          <DialogDescription className="sr-only">Assistindo a {activeVideo?.name}</DialogDescription>
          
          {/* Botão de Fechar */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 z-50 rounded-full h-12 w-12 bg-black/20 backdrop-blur-md border border-white/10"
            onClick={() => setActiveVideo(null)}
          >
            <X className="w-6 h-6" />
          </Button>

          <div className="relative w-full flex-1 flex items-center justify-center perspective-1000">
            {youtubeVideos.map((video, idx) => {
              const total = youtubeVideos.length;
              let diff = idx - currentIndex;
              
              if (total > 2) {
                if (diff > total / 2) diff -= total;
                else if (diff < -total / 2) diff += total;
              }

              let positionClasses = "z-0 scale-50 opacity-0 translate-x-0 pointer-events-none";
              let isVisible = false;

              if (diff === 0) {
                positionClasses = "z-30 scale-100 translate-x-0 opacity-100";
                isVisible = true;
              } else if (diff === 1) {
                positionClasses = "z-20 scale-[0.80] translate-x-[75%] md:translate-x-[85%] opacity-40 hover:opacity-100 cursor-pointer";
                isVisible = true;
              } else if (diff === -1) {
                positionClasses = "z-20 scale-[0.80] -translate-x-[75%] md:-translate-x-[85%] opacity-40 hover:opacity-100 cursor-pointer";
                isVisible = true;
              }

              return (
                <div
                  key={video.id}
                  className={`absolute w-[85%] md:w-[65%] max-w-[900px] aspect-video transition-all duration-500 ease-out ${positionClasses}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (diff === 1) handleNext();
                    if (diff === -1) handlePrevious();
                  }}
                >
                  {diff === 0 ? (
                    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/20 bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.key}?autoplay=1`}
                        title={video.name}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : isVisible ? (
                    <div className="w-full h-full rounded-2xl overflow-hidden ring-1 ring-white/10 relative shadow-xl shadow-black/50 group/thumb bg-black">
                      <img
                        src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                        alt={video.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/60 group-hover/thumb:bg-black/30 transition-colors duration-500 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover/thumb:bg-white/30 group-hover:scale-110 transition-all duration-300">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                        <p className="text-white font-medium line-clamp-1">{video.name}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}

            {/* Setas Manuais de Navegação (Para reforçar no Desktop) */}
            {youtubeVideos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-black/50 z-40 h-16 w-16 rounded-full bg-black/20 backdrop-blur-sm border border-white/10"
                  onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                >
                  <ChevronLeft className="w-10 h-10" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-black/50 z-40 h-16 w-16 rounded-full bg-black/20 backdrop-blur-sm border border-white/10"
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                >
                  <ChevronRight className="w-10 h-10" />
                </Button>
              </>
            )}
          </div>
          
          <div className="mt-6 mb-2 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 text-center z-50 min-w-[300px] max-w-[80%] mx-auto">
            <h3 className="text-xl font-bold text-white line-clamp-1">{activeVideo?.name}</h3>
            <p className="text-sm text-primary font-medium mt-1">{activeVideo?.type}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoCarousel;
