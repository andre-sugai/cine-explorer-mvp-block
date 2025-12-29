import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSyncContext, SyncLogEntry } from '@/context/SyncContext';
import {
  RefreshCw,
  History,
  Settings,
  Database,
  Cloud,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SyncControlPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SyncControlPanel: React.FC<SyncControlPanelProps> = ({
  open,
  onOpenChange,
}) => {
  const {
    status,
    syncHistory,
    scheduledSyncTime,
    isScheduledSyncEnabled,
    stats,
    setScheduledSync,
    refreshStats,
    clearHistory,
    triggerManualSync,
    status: syncStatus,
  } = useSyncContext();

  const [localTime, setLocalTime] = useState(scheduledSyncTime);

  useEffect(() => {
    if (open) {
      refreshStats();
    }
  }, [open]);

  const handleSyncNow = async () => {
    await triggerManualSync();
  };

  const getStatusIcon = (status: SyncLogEntry['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'start':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    }
  };

  const getServiceLabel = (service: string) => {
    const labels: Record<string, string> = {
      favorites: 'Favoritos',
      watched: 'Vistos',
      watchlist: 'Quero Assistir',
      custom_lists: 'Listas',
      favorites_add: 'Novo Favorito',
      watched_add: 'Novo Visto',
      watchlist_add: 'Novo Quero Assistir',
      watched_bulk_add: 'Vistos (Massa)',
    };
    return labels[service] || service;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 overflow-hidden bg-cinema-dark border-primary/20">
        <DialogHeader className="p-6 border-b border-white/10">
          <DialogTitle className="text-xl flex items-center gap-2 text-primary">
            <Cloud className="w-6 h-6" />
            Controle de Sincronismo
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Gerencie a saúde dos seus dados entre o Local e a Nuvem.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="stats" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-2 border-b border-white/5">
            <TabsList className="bg-secondary/30 w-full justify-start gap-2 h-auto p-1 border border-white/5">
              <TabsTrigger value="stats" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-cinema-dark">
                <Database className="w-4 h-4" />
                Estatísticas
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-cinema-dark">
                <History className="w-4 h-4" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-cinema-dark">
                <Settings className="w-4 h-4" />
                Configurações
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              <TabsContent value="stats" className="mt-0 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-secondary/20 border border-white/5 space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Status Atual</span>
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${syncStatus === 'idle' ? 'bg-green-500 shadow-glow-green' : syncStatus === 'syncing' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'}`} />
                       <span className="font-medium capitalize">{syncStatus === 'idle' ? 'Sincronizado' : syncStatus === 'syncing' ? 'Sincronizando...' : 'Erro'}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/20 border border-white/5 space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Última Checagem</span>
                    <div className="flex items-center gap-2">
                       <Clock className="w-4 h-4 text-muted-foreground" />
                       <span className="font-medium text-sm">
                         {stats.lastChecked ? format(stats.lastChecked, 'HH:mm:ss', { locale: ptBR }) : 'Nunca'}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    Comparativo de Itens
                  </h4>
                  <div className="rounded-xl border border-white/10 overflow-hidden bg-secondary/10">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="text-left py-2 px-4 font-medium">Categoria</th>
                          <th className="text-center py-2 px-4 font-medium">Local</th>
                          <th className="text-center py-2 px-4 font-medium">Nuvem</th>
                          <th className="text-right py-2 px-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {Object.keys(stats.local).map((key) => (
                          <tr key={key}>
                            <td className="py-3 px-4 capitalize">{getServiceLabel(key)}</td>
                            <td className="py-3 px-4 text-center font-mono">{stats.local[key]}</td>
                            <td className="py-3 px-4 text-center font-mono">{stats.remote[key]}</td>
                            <td className="py-3 px-4 text-right">
                              {stats.local[key] === stats.remote[key] ? (
                                <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/5">Igual</Badge>
                              ) : (
                                <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/5">Divergente</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <Button 
                  onClick={handleSyncNow} 
                  disabled={syncStatus === 'syncing'} 
                  className="w-full bg-gradient-gold text-cinema-dark hover:shadow-glow font-bold"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  Sincronizar Agora
                </Button>
              </TabsContent>

              <TabsContent value="history" className="mt-0 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold">Logs Recentes</h4>
                  <Button variant="ghost" size="sm" onClick={clearHistory} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                </div>
                
                {syncHistory.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground space-y-2">
                    <History className="w-12 h-12 mx-auto opacity-20" />
                    <p>Nenhuma atividade registrada ainda.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {syncHistory.map((log) => (
                      <div key={log.id} className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between group transition-colors hover:bg-white/[0.08]">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(log.status)}
                          <div>
                            <p className="text-sm font-medium">
                              {getServiceLabel(log.service)}
                              {log.itemsCount !== undefined && <span className="text-xs text-muted-foreground ml-2">({log.itemsCount} itens)</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(log.timestamp, "dd MMM, HH:mm:ss", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        {log.details && (
                          <div className="hidden group-hover:block max-w-[200px] truncate text-[10px] text-muted-foreground bg-black/40 px-2 py-1 rounded">
                            {log.details}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="mt-0 space-y-6">
                 <div className="p-6 rounded-xl bg-secondary/10 border border-white/10 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="scheduled-sync" className="text-base">Sincronização Diária</Label>
                        <p className="text-sm text-muted-foreground">Executar sincronização automática em um horário fixo.</p>
                      </div>
                      <Switch 
                        id="scheduled-sync" 
                        checked={isScheduledSyncEnabled} 
                        onCheckedChange={(val) => setScheduledSync(val, localTime)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>

                    <div className={`space-y-3 transition-opacity ${!isScheduledSyncEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      <Label className="text-sm font-medium">Horário Preferencial</Label>
                      <div className="flex gap-4 items-center">
                        <Input 
                          type="time" 
                          value={localTime} 
                          onChange={(e) => setLocalTime(e.target.value)} 
                          className="bg-secondary/50 border-white/10 focus:ring-primary/50 w-[150px]"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setScheduledSync(isScheduledSyncEnabled, localTime)}
                          className="border-primary/20 hover:bg-primary/10"
                        >
                          Salvar Horário
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Nota: Requer que a aplicação esteja aberta no navegador para disparar.
                      </p>
                    </div>
                 </div>

                 <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
                    <h5 className="text-sm font-semibold text-amber-500 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Informação Importante
                    </h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      A sincronização manual e agendada prioriza os dados mais recentes baseados no timestamp. Se houver conflitos, os dados da nuvem geralmente prevalecem.
                    </p>
                 </div>
              </TabsContent>
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end">
             <Button variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-white/5">
               Fechar
             </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
