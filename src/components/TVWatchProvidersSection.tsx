import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { getTVWatchProviders } from '@/utils/tmdb';

interface TVWatchProvidersSectionProps {
  tvId: number;
}

/**
 * Seção "Onde Assistir" para detalhes de séries.
 *
 * Busca provedores de streaming (JustWatch via TMDB) para a série informada
 * e exibe-os por categoria: streaming (flatrate), aluguel (rent) e compra (buy).
 *
 * Argumentos:
 * - tvId: ID da série no TMDB.
 *
 * Retorno:
 * - Componente React que renderiza título, loading skeleton, mensagem de indisponibilidade
 *   e grids de provedores com logo/nome e link de referência quando disponível.
 */
const TVWatchProvidersSection: React.FC<TVWatchProvidersSectionProps> = ({
  tvId,
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tv-watch-providers', tvId],
    queryFn: async () => await getTVWatchProviders(tvId),
    enabled: !!tvId,
    staleTime: 1000 * 60 * 5,
  });

  const hasAnyProvider = !!(
    (data && (data as any).flatrate && (data as any).flatrate.length > 0) ||
    (data && (data as any).rent && (data as any).rent.length > 0) ||
    (data && (data as any).buy && (data as any).buy.length > 0)
  );

  const ProviderGrid: React.FC<{ providers: any[] }> = ({ providers }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {providers.map((provider) => (
        <div
          key={provider.provider_id}
          className="rounded-lg p-3 bg-secondary/50 hover:bg-secondary/70 transition-colors flex flex-col items-center text-center min-h-[120px]"
        >
          {provider.logo_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w154${provider.logo_path}`}
              alt={provider.provider_name}
              className="h-12 w-12 object-contain mb-2"
              loading="lazy"
            />
          ) : (
            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center mb-2">
              <span className="text-xs text-muted-foreground">
                {provider.provider_name?.[0] || '?'}
              </span>
            </div>
          )}
          <span className="text-xs text-foreground line-clamp-2">
            {provider.provider_name}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="bg-gradient-cinema border-primary/20">
      <CardHeader>
        <CardTitle className="text-primary">Onde Assistir</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Aviso sobre disponibilidade */}
        <Alert variant="default" className="border-blue-500/50 bg-blue-500/10">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-sm text-muted-foreground">
            A disponibilidade de séries em streamings pode mudar frequentemente. 
            Os dados são fornecidos por JustWatch e podem não refletir mudanças recentes.
          </AlertDescription>
        </Alert>

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg p-3 bg-secondary/50 min-h-[120px]"
              >
                <Skeleton className="h-12 w-12 mx-auto mb-2" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && (isError || !hasAnyProvider) && (
          <div className="rounded-lg p-4 bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground">
              Esta série não está disponível em nenhum streaming no Brasil no
              momento. Verifique outras opções de aluguel ou compra.
            </p>
          </div>
        )}

        {!isLoading && !isError && hasAnyProvider && (
          <div className="space-y-6">
            {(data as any).flatrate && (data as any).flatrate.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">📺 Streaming</h4>
                <ProviderGrid providers={(data as any).flatrate} />
              </div>
            )}

            {(data as any).rent && (data as any).rent.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">💰 Aluguel</h4>
                <ProviderGrid providers={(data as any).rent} />
              </div>
            )}

            {(data as any).buy && (data as any).buy.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">🛒 Compra</h4>
                <ProviderGrid providers={(data as any).buy} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TVWatchProvidersSection;
