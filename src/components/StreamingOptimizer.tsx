import React, { useState } from 'react';
import { useWantToWatchContext } from '@/context/WantToWatchContext';
import { getWatchProviders } from '@/utils/tmdb';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Loader, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProviderStats {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  count: number;
  percentage: number;
  titles: string[];
}

export const StreamingOptimizer: React.FC = () => {
  const { wantToWatchList } = useWantToWatchContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<ProviderStats[]>([]);
  const [analyzedCount, setAnalyzedCount] = useState(0);

  const analyzeStreamings = async () => {
    setIsLoading(true);
    setStats([]);
    setAnalyzedCount(0);

    const providerCounts: { [key: number]: ProviderStats } = {};
    let processed = 0;

    // Processar em lotes para não bloquear a UI
    const batchSize = 5;
    for (let i = 0; i < wantToWatchList.length; i += batchSize) {
      const batch = wantToWatchList.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (item) => {
          try {
            // Fetch providers for this item
            const response = await fetch(
              `https://api.themoviedb.org/3/${item.type}/${item.id}/watch/providers?api_key=${localStorage.getItem('tmdb_api_key')}`
            );
            const data = await response.json();
            const brProviders = data.results?.BR?.flatrate || [];

            brProviders.forEach((provider: any) => {
              if (!providerCounts[provider.provider_id]) {
                providerCounts[provider.provider_id] = {
                  provider_id: provider.provider_id,
                  provider_name: provider.provider_name,
                  logo_path: provider.logo_path,
                  count: 0,
                  percentage: 0,
                  titles: [],
                };
              }
              providerCounts[provider.provider_id].count++;
              providerCounts[provider.provider_id].titles.push(item.title);
            });
          } catch (error) {
            console.error(`Error fetching providers for ${item.title}:`, error);
          }
        })
      );

      processed += batch.length;
      setAnalyzedCount(processed);
      // Pequeno delay para não estourar rate limit
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Calcular porcentagens e ordenar
    const totalItems = wantToWatchList.length;
    const sortedStats = Object.values(providerCounts)
      .map(stat => ({
        ...stat,
        percentage: Math.round((stat.count / totalItems) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    setStats(sortedStats);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={analyzeStreamings}
          className="bg-gradient-gold text-cinema-dark hover:opacity-90 shadow-glow font-semibold"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Otimizar Assinatura
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gradient-cinema border-primary/20 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Otimizador de Streaming
          </DialogTitle>
          <DialogDescription>
            Descubra qual serviço de streaming vale mais a pena para você com base na sua lista "Quero Assistir".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isLoading ? (
            <div className="text-center space-y-4">
              <Loader className="w-10 h-10 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">
                Analisando {analyzedCount} de {wantToWatchList.length} títulos...
              </p>
              <Progress value={(analyzedCount / wantToWatchList.length) * 100} className="w-full" />
            </div>
          ) : stats.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-primary">Recomendação</h4>
                  <p className="text-sm text-muted-foreground">
                    Com base na sua lista, assinar a <strong className="text-foreground">{stats[0].provider_name}</strong> te dará acesso a {stats[0].percentage}% dos filmes que você quer ver!
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {stats.map((stat, index) => (
                  <Card key={stat.provider_id} className="bg-black/20 border-primary/10 overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-2xl font-bold text-muted-foreground w-6">#{index + 1}</div>
                        <img 
                          src={`https://image.tmdb.org/t/p/original${stat.logo_path}`}
                          alt={stat.provider_name}
                          className="w-10 h-10 rounded-lg shadow-md"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="font-semibold">{stat.provider_name}</h3>
                            <span className="text-sm font-bold text-primary">{stat.count} títulos ({stat.percentage}%)</span>
                          </div>
                          <Progress value={stat.percentage} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="pl-14">
                        <p className="text-xs text-muted-foreground mb-1">Disponíveis neste serviço:</p>
                        <div className="flex flex-wrap gap-1">
                          {stat.titles.slice(0, 5).map((title, i) => (
                            <span key={i} className="text-xs bg-secondary/50 px-2 py-0.5 rounded-full border border-secondary">
                              {title}
                            </span>
                          ))}
                          {stat.titles.length > 5 && (
                            <span className="text-xs text-muted-foreground px-1 py-0.5">
                              +{stat.titles.length - 5} outros
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {wantToWatchList.length === 0 ? (
                <div className="space-y-2">
                  <AlertCircle className="w-10 h-10 mx-auto opacity-50" />
                  <p>Sua lista "Quero Assistir" está vazia.</p>
                  <p className="text-sm">Adicione filmes e séries para usar o otimizador!</p>
                </div>
              ) : (
                <p>Não foi possível encontrar informações de streaming para os itens da sua lista.</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
