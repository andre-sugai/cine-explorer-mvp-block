import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getAllGenres, TMDBGenre } from '@/utils/tmdb';
import { Label } from '@/components/ui/label';

export interface SlideshowConfig {
  type: 'all' | 'movie' | 'tv';
  genreId: string; // 'all' or numeric string
  duration: number; // 5, 7, 9
}

interface SlideshowSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: SlideshowConfig;
  onSave: (newConfig: SlideshowConfig) => void;
}

export const SlideshowSettingsModal: React.FC<SlideshowSettingsModalProps> = ({
  open,
  onOpenChange,
  config,
  onSave,
}) => {
  const [localConfig, setLocalConfig] = useState<SlideshowConfig>(config);
  const [genres, setGenres] = useState<TMDBGenre[]>([]);

  useEffect(() => {
    if (open) {
      setLocalConfig(config);
      
      const fetchGenres = async () => {
        try {
          const fetchedGenres = await getAllGenres();
          setGenres(fetchedGenres);
        } catch (e) {
          console.error(e);
        }
      };
      fetchGenres();
    }
  }, [open, config]);

  const handleSave = () => {
    onSave(localConfig);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] text-slate-100 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-yellow-500">Configurações do Slideshow</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold">Tipo de Conteúdo</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="radio" checked={localConfig.type === 'all'} onChange={() => setLocalConfig({...localConfig, type: 'all'})} className="accent-yellow-500" />
                Ambos
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="radio" checked={localConfig.type === 'movie'} onChange={() => setLocalConfig({...localConfig, type: 'movie'})} className="accent-yellow-500" />
                Filmes
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="radio" checked={localConfig.type === 'tv'} onChange={() => setLocalConfig({...localConfig, type: 'tv'})} className="accent-yellow-500" />
                Séries
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold">Gênero</Label>
            <select 
              className="bg-[#242424] border border-slate-700 rounded-md p-2 text-white outline-none focus:border-yellow-500 text-sm"
              value={localConfig.genreId}
              onChange={(e) => setLocalConfig({...localConfig, genreId: e.target.value})}
            >
              <option value="all">Qualquer Gênero</option>
              {genres.map(g => (
                <option key={g.id} value={g.id.toString()}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold">Tempo de Exibição</Label>
            <div className="flex gap-4">
              {[5, 7, 9].map(time => (
                <label key={time} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" checked={localConfig.duration === time} onChange={() => setLocalConfig({...localConfig, duration: time})} className="accent-yellow-500" />
                  {time} Segundos
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={handleSave} className="bg-yellow-500 text-black hover:bg-yellow-600 font-semibold">
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
