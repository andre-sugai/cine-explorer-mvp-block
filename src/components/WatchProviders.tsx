
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Tv, DollarSign, ShoppingCart } from 'lucide-react';

interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface WatchProvidersData {
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

interface WatchProvidersProps {
  providers: WatchProvidersData | null;
  loading: boolean;
}

const WatchProviders: React.FC<WatchProvidersProps> = ({ providers, loading }) => {
  if (loading) {
    return (
      <Card className="bg-gradient-cinema border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">Onde Assistir</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasAnyProvider = providers && (
    (providers.flatrate && providers.flatrate.length > 0) ||
    (providers.rent && providers.rent.length > 0) ||
    (providers.buy && providers.buy.length > 0)
  );

  return (
    <Card className="bg-gradient-cinema border-primary/20">
      <CardHeader>
        <CardTitle className="text-primary">Onde Assistir</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAnyProvider ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30 border border-secondary/50">
            <AlertCircle className="w-6 h-6 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-foreground font-medium mb-1">
                Não está disponível em streamings
              </p>
              <p className="text-muted-foreground text-sm">
                Este filme não está disponível em nenhum streaming no Brasil no momento.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {providers?.flatrate && providers.flatrate.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tv className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-foreground">Streaming</h4>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {providers.flatrate.map((provider) => (
                    <div
                      key={provider.provider_id}
                      className="flex flex-col items-center p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="w-12 h-12 mb-2 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                        <img
                          src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                          alt={provider.provider_name}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="text-xs text-center text-muted-foreground font-medium">
                        {provider.provider_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {providers?.rent && providers.rent.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-foreground">Aluguel</h4>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {providers.rent.map((provider) => (
                    <div
                      key={provider.provider_id}
                      className="flex flex-col items-center p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="w-12 h-12 mb-2 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                        <img
                          src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                          alt={provider.provider_name}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="text-xs text-center text-muted-foreground font-medium">
                        {provider.provider_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {providers?.buy && providers.buy.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-foreground">Compra</h4>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {providers.buy.map((provider) => (
                    <div
                      key={provider.provider_id}
                      className="flex flex-col items-center p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="w-12 h-12 mb-2 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                        <img
                          src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                          alt={provider.provider_name}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="text-xs text-center text-muted-foreground font-medium">
                        {provider.provider_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-secondary/30">
          <p className="text-xs text-muted-foreground text-center">
            Dados fornecidos por JustWatch via TMDB
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WatchProviders;
