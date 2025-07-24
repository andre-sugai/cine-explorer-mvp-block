import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Upload, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFavoritesContext } from '@/context/FavoritesContext';
import { useWantToWatchContext } from '@/context/WantToWatchContext';
import { useWatchedContext } from '@/context/WatchedContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DataMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMigrationComplete: () => void;
}

interface LocalData {
  favorites: any[];
  watchlist: any[];
  watched: any[];
}

export const DataMigrationModal: React.FC<DataMigrationModalProps> = ({
  isOpen,
  onClose,
  onMigrationComplete,
}) => {
  const { user } = useAuth();
  const { favorites } = useFavoritesContext();
  const { wantToWatchList } = useWantToWatchContext();
  const { watched } = useWatchedContext();
  
  const [localData, setLocalData] = useState<LocalData>({ favorites: [], watchlist: [], watched: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalData({
        favorites,
        watchlist: wantToWatchList,
        watched,
      });
    }
  }, [isOpen, favorites, wantToWatchList, watched]);

  const getTotalItems = () => {
    return localData.favorites.length + localData.watchlist.length + localData.watched.length;
  };

  const migrateData = async () => {
    if (!user) return;

    setIsLoading(true);
    setProgress(0);
    
    try {
      const totalItems = getTotalItems();
      let processedItems = 0;

      // Migrar favoritos
      if (localData.favorites.length > 0) {
        setCurrentStep(`Migrando ${localData.favorites.length} favoritos...`);
        
        for (const favorite of localData.favorites) {
          try {
            await supabase
              .from('user_favorites')
              .insert({
                user_id: user.id,
                item_id: favorite.id,
                item_type: favorite.type,
                item_data: favorite,
              });
            
            processedItems++;
            setProgress((processedItems / totalItems) * 100);
          } catch (error) {
            console.error('Error migrating favorite:', error);
          }
        }
      }

      // Migrar lista de desejos
      if (localData.watchlist.length > 0) {
        setCurrentStep(`Migrando ${localData.watchlist.length} itens da lista de desejos...`);
        
        for (const item of localData.watchlist) {
          try {
            await supabase
              .from('user_watchlist')
              .insert({
                user_id: user.id,
                item_id: item.id,
                item_type: item.type,
                item_data: item,
              });
            
            processedItems++;
            setProgress((processedItems / totalItems) * 100);
          } catch (error) {
            console.error('Error migrating watchlist item:', error);
          }
        }
      }

      // Migrar assistidos
      if (localData.watched.length > 0) {
        setCurrentStep(`Migrando ${localData.watched.length} itens assistidos...`);
        
        for (const item of localData.watched) {
          try {
            await supabase
              .from('user_watched')
              .insert({
                user_id: user.id,
                item_id: item.id,
                item_type: item.type,
                item_data: item,
                watched_date: item.watchedAt,
              });
            
            processedItems++;
            setProgress((processedItems / totalItems) * 100);
          } catch (error) {
            console.error('Error migrating watched item:', error);
          }
        }
      }

      setCurrentStep('Migração concluída com sucesso!');
      setIsComplete(true);
      
      toast({
        title: "Dados migrados com sucesso!",
        description: `${totalItems} itens foram sincronizados com sua conta.`,
      });

      // Aguardar um pouco antes de fechar
      setTimeout(() => {
        onMigrationComplete();
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: "Erro na migração",
        description: "Ocorreu um erro durante a migração dos dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const skipMigration = () => {
    onMigrationComplete();
    handleClose();
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsComplete(false);
      setProgress(0);
      setCurrentStep('');
      onClose();
    }
  };

  const totalItems = getTotalItems();

  if (totalItems === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            Sincronização de Dados
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Encontramos dados salvos localmente em seu dispositivo:
            </p>
            
            <div className="bg-muted rounded-lg p-4 space-y-2">
              {localData.favorites.length > 0 && (
                <div className="flex justify-between">
                  <span>Favoritos:</span>
                  <span className="font-medium">{localData.favorites.length}</span>
                </div>
              )}
              {localData.watchlist.length > 0 && (
                <div className="flex justify-between">
                  <span>Quero Assistir:</span>
                  <span className="font-medium">{localData.watchlist.length}</span>
                </div>
              )}
              {localData.watched.length > 0 && (
                <div className="flex justify-between">
                  <span>Assistidos:</span>
                  <span className="font-medium">{localData.watched.length}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total:</span>
                <span>{totalItems}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Deseja sincronizar esses dados com sua conta na nuvem?
            </p>
          </div>

          {isLoading && (
            <div className="space-y-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {currentStep}
              </p>
            </div>
          )}

          {!isComplete && !isLoading && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={skipMigration}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Não, manter apenas local
              </Button>
              <Button
                onClick={migrateData}
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                Sim, sincronizar
              </Button>
            </div>
          )}

          {isComplete && (
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <p className="text-green-600 font-medium">
                Dados sincronizados com sucesso!
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};