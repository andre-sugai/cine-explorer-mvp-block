
import { useState } from 'react';
import { useFavorites } from './useFavorites';
import { useWatched } from './useWatched';

interface BackupData {
  exportDate: string;
  version: string;
  favorites: any[];
  watched: any[];
  apiKey: string | null;
  settings: Record<string, any>;
}

export const useDataManager = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { favorites, clearAllFavorites } = useFavorites();
  const { watched, clearAllWatched } = useWatched();

  const exportData = async (): Promise<void> => {
    setIsExporting(true);
    
    try {
      const apiKey = localStorage.getItem('tmdb_api_key');
      const settings = {}; // Pode ser expandido para incluir outras configurações
      
      const backupData: BackupData = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        favorites,
        watched,
        apiKey,
        settings
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cine-explorer-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (file: File, mergeData: boolean = false): Promise<void> => {
    setIsImporting(true);
    
    try {
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);
      
      // Validar estrutura do arquivo
      if (!backupData.exportDate || !backupData.favorites || !backupData.watched) {
        throw new Error('Arquivo de backup inválido');
      }

      // Se não for para mesclar, limpar dados existentes
      if (!mergeData) {
        clearAllFavorites();
        clearAllWatched();
      }

      // Importar favoritos
      if (backupData.favorites && backupData.favorites.length > 0) {
        const existingFavorites = mergeData ? favorites : [];
        const allFavorites = mergeData ? 
          [...existingFavorites, ...backupData.favorites.filter(newFav => 
            !existingFavorites.some(existing => 
              existing.id === newFav.id && existing.type === newFav.type
            )
          )] : 
          backupData.favorites;
        
        localStorage.setItem('cine-explorer-favorites', JSON.stringify(allFavorites));
      }

      // Importar assistidos
      if (backupData.watched && backupData.watched.length > 0) {
        const existingWatched = mergeData ? watched : [];
        const allWatched = mergeData ? 
          [...existingWatched, ...backupData.watched.filter(newWatch => 
            !existingWatched.some(existing => 
              existing.id === newWatch.id && existing.type === newWatch.type
            )
          )] : 
          backupData.watched;
        
        localStorage.setItem('cine-explorer-watched', JSON.stringify(allWatched));
      }

      // Importar chave da API se disponível e não existir uma
      if (backupData.apiKey && !localStorage.getItem('tmdb_api_key')) {
        localStorage.setItem('tmdb_api_key', backupData.apiKey);
      }

      // Forçar recarregamento da página para atualizar os hooks
      window.location.reload();
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  const validateBackupFile = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const isValid = data.exportDate && 
                         Array.isArray(data.favorites) && 
                         Array.isArray(data.watched);
          resolve(isValid);
        } catch {
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  };

  return {
    exportData,
    importData,
    validateBackupFile,
    isImporting,
    isExporting
  };
};
