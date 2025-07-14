
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Dice6, Star, Calendar, Loader, RefreshCw } from 'lucide-react';
import { useLuckyPick } from '@/hooks/useLuckyPick';
import { buildImageUrl } from '@/utils/tmdb';
import { useNavigate } from 'react-router-dom';

interface LuckyButtonProps {
  variant?: 'default' | 'hero';
  className?: string;
}

export const LuckyButton: React.FC<LuckyButtonProps> = ({ variant = 'default', className = '' }) => {
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { getRandomItem, isLoading } = useLuckyPick();
  const navigate = useNavigate();

  const handleLuckyPick = async () => {
    const randomItem = await getRandomItem();
    if (randomItem) {
      setResult(randomItem);
      setShowResult(true);
    }
  };

  const handleGoToDetails = () => {
    if (result) {
      const { item, type } = result;
      if (type === 'movie') {
        navigate(`/filme/${item.id}`);
      } else if (type === 'tv') {
        navigate(`/serie/${item.id}`);
      } else if (type === 'person') {
        navigate(`/pessoa/${item.id}`);
      }
      setShowResult(false);
    }
  };

  const handleTryAgain = async () => {
    setResult(null);
    await handleLuckyPick();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'movie': return 'Filme';
      case 'tv': return 'Série';
      case 'person': return 'Pessoa';
      default: return 'Item';
    }
  };

  const getItemTitle = (item: any, type: string) => {
    if (type === 'movie') return item.title;
    if (type === 'tv') return item.name;
    if (type === 'person') return item.name;
    return 'Item';
  };

  const getItemImage = (item: any, type: string) => {
    if (type === 'person') return item.profile_path;
    return item.poster_path;
  };

  const getItemYear = (item: any, type: string) => {
    if (type === 'movie' && item.release_date) {
      return new Date(item.release_date).getFullYear();
    }
    if (type === 'tv' && item.first_air_date) {
      return new Date(item.first_air_date).getFullYear();
    }
    return null;
  };

  return (
    <>
      <Button
        onClick={handleLuckyPick}
        disabled={isLoading}
        variant={variant}
        className={`relative overflow-hidden group ${className}`}
      >
        {isLoading ? (
          <Loader className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Dice6 className="w-4 h-4 mr-2 group-hover:animate-bounce" />
        )}
        {isLoading ? 'Sorteando...' : 'Estou com Sorte!'}
      </Button>

      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-md bg-gradient-cinema border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-center text-primary flex items-center justify-center gap-2">
              <Dice6 className="w-5 h-5" />
              Seu {result?.type && getTypeLabel(result.type)} da Sorte!
            </DialogTitle>
          </DialogHeader>

          {result && (
            <div className="space-y-6">
              <Card className="bg-gradient-hero border-primary/20 overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-[2/3] relative bg-secondary/50 flex items-center justify-center">
                    {getItemImage(result.item, result.type) ? (
                      <img
                        src={buildImageUrl(getItemImage(result.item, result.type))}
                        alt={getItemTitle(result.item, result.type)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground">
                        <Star className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-lg text-primary text-center line-clamp-2">
                      {getItemTitle(result.item, result.type)}
                    </h3>
                    
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      {result.item.vote_average && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{result.item.vote_average.toFixed(1)}</span>
                        </div>
                      )}
                      
                      {getItemYear(result.item, result.type) && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{getItemYear(result.item, result.type)}</span>
                        </div>
                      )}
                    </div>

                    {result.item.overview && (
                      <p className="text-sm text-muted-foreground text-center line-clamp-3">
                        {result.item.overview}
                      </p>
                    )}

                    {result.item.known_for_department && (
                      <p className="text-sm text-muted-foreground text-center">
                        {result.item.known_for_department}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={handleTryAgain}
                  variant="outline"
                  className="flex-1"
                  disabled={isLoading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
                
                <Button
                  onClick={handleGoToDetails}
                  variant="default"
                  className="flex-1 bg-gradient-gold text-cinema-dark hover:opacity-90"
                >
                  Ver Detalhes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
