import React from 'react';
import { Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useSyncContext } from '@/context/SyncContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const SyncIndicator: React.FC = () => {
  const { status, lastSyncTime, activeSyncs, errors } = useSyncContext();

  const getIcon = () => {
    switch (status) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-primary animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'offline':
        return <CloudOff className="w-4 h-4 text-muted-foreground" />;
      case 'idle':
      default:
        return <Cloud className="w-4 h-4 text-green-500" />;
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'syncing':
        const translateService = (s: string) => {
          const map: Record<string, string> = {
            'watched': 'Vistos',
            'favorites': 'Favoritos',
            'favorites_add': 'Adicionando aos Favoritos',
            'watchlist': 'Quero Assistir',
            'watchlist_add': 'Adicionando a Quero Assistir',
            'custom_lists': 'Listas',
            'custom_lists_add': 'Atualizando Listas'
          };
          return map[s] || s;
        };
        const services = Array.from(activeSyncs).map(translateService).join(', ');
        return `Sincronizando: ${services}...`;
      case 'error':
        if (errors.size > 0) {
          const translateServiceError = (s: string) => {
             const map: Record<string, string> = {
              'watched': 'vistos',
              'favorites': 'favoritos',
              'favorites_add': 'adição aos favoritos',
              'watchlist': 'quero assistir',
              'watchlist_add': 'adição a quero assistir',
              'custom_lists': 'listas',
              'custom_lists_add': 'atualização de listas'
            };
            return map[s] || s;
          };
          const failedServices = Array.from(errors.keys()).map(translateServiceError).join(', ');
          return `Erro ao sincronizar: ${failedServices}`;
        }
        return 'Erro na sincronização';
      case 'offline':
        return 'Modo offline - Alterações salvas localmente';
      case 'idle':
      default:
        return 'Tudo sincronizado e salvo na nuvem';
    }
  };

  const getFriendlyErrorMessage = (error: any) => {
    const message = error?.message || '';
    
    if (message.includes('statement timeout') || message.includes('canceling statement')) {
      return 'O servidor demorou muito para responder (Timeout). Tente novamente.';
    }
    
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      return 'Erro de conexão com a internet.';
    }

    if (message.includes('JWT expired')) {
      return 'Sua sessão expirou. Por favor, faça login novamente.';
    }
    
    return message || 'Erro desconhecido';
  };

  const getErrorDetails = () => {
    if (errors.size === 0) return null;
    return (
      <div className="mt-1 text-xs text-destructive bg-destructive/10 p-1 rounded">
        {Array.from(errors.entries()).map(([service, error]) => (
          <div key={service}>
            <strong className="capitalize">{service}:</strong> {getFriendlyErrorMessage(error)}
          </div>
        ))}
      </div>
    );
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Nunca sincronizado nesta sessão';
    return `Última sincronização: ${lastSyncTime.toLocaleTimeString()}`;
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-full 
            transition-all duration-300 cursor-help
            ${status === 'error' ? 'bg-destructive/10 hover:bg-destructive/20' : 'hover:bg-accent'}
            ${status === 'syncing' ? 'bg-primary/5' : ''}
          `}>
            {getIcon()}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[300px]">
          <div className="flex flex-col gap-1">
            <span className="font-semibold">{getLabel()}</span>
            {status === 'error' && getErrorDetails()}
            <span className="text-xs text-muted-foreground border-t pt-1 mt-1 border-border">
              {formatLastSync()}
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
