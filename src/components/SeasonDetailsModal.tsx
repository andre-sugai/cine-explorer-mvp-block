import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { getTVSeasonDetails } from '@/utils/tmdb';
import { EpisodeCard } from './EpisodeCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface SeasonDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tvId: number;
  seasonNumber: number | null;
  seasonName: string;
}

export const SeasonDetailsModal: React.FC<SeasonDetailsModalProps> = ({
  isOpen,
  onClose,
  tvId,
  seasonNumber,
  seasonName,
}) => {
  const { data: season, isLoading, error } = useQuery({
    queryKey: ['season-details', tvId, seasonNumber],
    queryFn: () => getTVSeasonDetails(tvId, seasonNumber!),
    enabled: isOpen && seasonNumber !== null,
  });

  const episodeCount = season?.episodes?.length || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader className="p-6 pb-4 border-b border-white/10">
          <DialogTitle className="text-2xl font-bold text-primary">
            {seasonName}
            {episodeCount > 0 && (
              <span className="text-sm text-muted-foreground ml-2">
                ({episodeCount} episódios)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-64 h-36 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar os episódios. Tente novamente mais tarde.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {season?.episodes?.map((episode: any) => (
                <EpisodeCard key={episode.id} episode={episode} tvId={tvId} />
              ))}
              {episodeCount === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum episódio encontrado para esta temporada.
                </p>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
