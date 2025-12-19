import React from 'react';
import { Cloud, CloudOff, RefreshCw, AlertCircle, Repeat } from 'lucide-react';
import { useSyncContext, SyncMode } from '@/context/SyncContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const SyncIndicator: React.FC = () => {
  const { status, lastSyncTime, activeSyncs, errors, syncMode, cycleSyncMode } = useSyncContext();

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
        // Icon depends on Mode
        if (syncMode === 'suspended') {
            return <CloudOff className="w-4 h-4 text-muted-foreground/50" />;
        }
        // Persistence (Default On)
        return <Cloud className="w-4 h-4 text-green-500" />;
    }
  };

  const getLabel = () => {
    // Override label for special statuses
    if (status === 'syncing') {
        const translateService = (s: string) => {
            const map: Record<string, string> = {
              'watched': 'histórico',
              'favorites': 'favoritos',
              'watchlist': 'quero assistir',
              'custom_lists': 'listas'
            };
            return map[s] || s;
        };
        const syncingServices = Array.from(activeSyncs).map(translateService).join(', ');
        return `Sincronizando ${syncingServices}...`;
    }

    if (status === 'error') {
        if (errors.size > 0) {
          const translateServiceError = (s: string) => {
            const map: Record<string, string> = {
              'watched': 'histórico',
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
          
          if (syncMode === 'persistence') {
              return `Erro ao sincronizar (${failedServices}). Tentando novamente em 1 min...`;
          }
          return `Erro ao sincronizar: ${failedServices}`;
        }
        return 'Erro na sincronização';
    }

    if (status === 'offline') {
        return 'Modo offline - Alterações salvas localmente';
    }

    // Idle status labels based on mode
    switch (syncMode) {
        case 'suspended':
            return 'Sincronização suspensa. Clique para ativar.';
        case 'persistence':
        default:
            return 'Sincronização Ativa (Modo Persistência)';
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

  const getModeColor = () => {
      if (status === 'syncing') return 'bg-primary/10';
      if (status === 'error') return 'bg-destructive/10 hover:bg-destructive/20';
      
      switch (syncMode) {
          case 'suspended': return 'hover:bg-accent opacity-70';
          case 'persistence': return 'bg-orange-500/10 hover:bg-orange-500/20';
          default: return 'hover:bg-accent';
      }
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button 
            onClick={cycleSyncMode}
            className={`
              flex items-center justify-center w-8 h-8 rounded-full 
              transition-all duration-300 cursor-pointer
              ${getModeColor()}
            `}
          >
            {getIcon()}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[300px]">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-sm">{getLabel()}</span>
            <span className="text-xs text-muted-foreground">
                Basta clicar para alternar entre os modos: Normal, Persistência e Suspenso.
            </span>
            {status === 'error' && getErrorDetails()}
            {lastSyncTime && (
                <span className="text-xs text-muted-foreground border-t pt-1 mt-1 border-border">
                {formatLastSync()}
                </span>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
