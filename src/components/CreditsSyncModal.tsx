import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useWatchedContext } from '@/context/WatchedContext';
import { getMovieDetails, getTVShowDetails } from '@/utils/tmdb';
import { PlayCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { safeLocalStorageSetItem } from '@/utils/storage';

export const CreditsSyncModal: React.FC = () => {
  const { watched } = useWatchedContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  
  // Encontrar itens que não têm créditos ou duração (runtime)
  const itemsWithoutData = watched.filter(w => (!w.cast || (!w.runtime && w.type === 'movie')) && (w.type === 'movie' || w.type === 'tv'));

  const startSync = async () => {
    setIsSyncing(true);
    setProgress(0);
    setIsOpen(true);
    
    let successCount = 0;
    let failCount = 0;
    
    // Atualizar no contexto não é bom em loop fechado porque recria a referência,
    // então vamos montar a lista atualizada e enviar no final, mas para progresso mostramos na UI.
    const updatedWatched = [...watched];
    const itemsToUpdate = [];
    
    for (let i = 0; i < itemsWithoutData.length; i++) {
      const item = itemsWithoutData[i];
      setStatusText(`Buscando dados extras para: ${item.title}...`);
      
      try {
        let details;
        if (item.type === 'movie') {
          details = await getMovieDetails(item.id);
        } else if (item.type === 'tv') {
          details = await getTVShowDetails(item.id);
        }
        
        if (details) {
          let cast = updatedWatched.find(w => w.id === item.id)?.cast;
          let directors = updatedWatched.find(w => w.id === item.id)?.directors;
          
          if (details.credits) {
            cast = details.credits.cast.slice(0, 5).map((c: any) => ({ id: c.id, name: c.name }));
            directors = details.credits.crew.filter((c: any) => c.job === 'Director').slice(0, 3).map((c: any) => ({ id: c.id, name: c.name }));
          }

          const runtime = item.type === 'movie' ? details.runtime : undefined;
          
          const index = updatedWatched.findIndex(w => w.id === item.id && w.type === item.type);
          if (index !== -1) {
            updatedWatched[index] = { 
              ...updatedWatched[index], 
              ...(cast ? { cast } : {}), 
              ...(directors ? { directors } : {}),
              ...(runtime ? { runtime } : {})
            };
            itemsToUpdate.push(updatedWatched[index]);
          }
          successCount++;
        }
      } catch (err) {
        console.error('Falha ao buscar creditos de', item.title, err);
        failCount++;
      }
      
      setProgress(Math.round(((i + 1) / itemsWithoutData.length) * 100));
      
      // Delay to avoid rate limit (TMDB allows 40 req / 10 sec, so we delay 250ms per request = 40 req per 10s)
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setStatusText('Salvando no banco de dados...');
    
    // Atualizar localStorage
    safeLocalStorageSetItem('cine-explorer-watched', JSON.stringify(updatedWatched));
    
    // Atualizar Supabase se houver usuário
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && itemsToUpdate.length > 0) {
      try {
        // Enviar os atualizados em chunks para o supabase para não dar payload too large
        const CHUNK_SIZE = 100;
        for (let i = 0; i < itemsToUpdate.length; i += CHUNK_SIZE) {
          const chunk = itemsToUpdate.slice(i, i + CHUNK_SIZE);
          const rowsToUpdate = chunk.map(w => ({
            item_data: w as any
          }));
          
          for (const row of chunk) {
            await supabase.from('user_watched')
              .update({ item_data: row as any })
              .eq('user_id', session.user.id)
              .eq('item_id', row.id)
              .eq('item_type', row.type);
          }
        }
      } catch (e) {
        console.error('Erro salvando no supabase', e);
      }
    }
    
    setStatusText(`Concluído! ${successCount} atualizados. Recarregue a página para ver os gráficos.`);
    setIsSyncing(false);
    toast.success('Dados sincronizados com sucesso!');
  };

  if (itemsWithoutData.length === 0) {
    return null; // Nada para sincronizar
  }

  return (
    <>
      <Card className="bg-primary/5 border-primary/20 mb-8">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Sincronização de Histórico Antigo
            </h3>
            <p className="text-sm text-muted-foreground">
              Você tem {itemsWithoutData.length} títulos antigos sem dados avançados (Atores, Diretores, Duração oficial).
              Sincronize para habilitar o Desafio da Bexiga de Aço e o Ranking de Atores.
            </p>
          </div>
          <Button onClick={startSync} className="gap-2 shrink-0">
            <PlayCircle className="h-4 w-4" />
            Sincronizar Agora
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={(open) => !isSyncing && setIsOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sincronizando Histórico...</DialogTitle>
            <DialogDescription>
              Baixando informações de elenco do TMDB. Isso pode demorar alguns minutos dependendo da quantidade de itens. Não feche a página.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{statusText}</span>
              <span className="font-bold">{progress}%</span>
            </div>
          </div>
          
          {!isSyncing && progress === 100 && (
            <div className="flex justify-center mt-4">
              <Button onClick={() => window.location.reload()} className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Atualizar Página
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
