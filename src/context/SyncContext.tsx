import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

export type SyncMode = 'persistence' | 'suspended';
type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

export interface SyncLogEntry {
  id: string;
  service: string;
  status: 'success' | 'error' | 'start';
  timestamp: Date;
  details?: string;
  itemsCount?: number;
}

export interface SyncStats {
  local: Record<string, number>;
  remote: Record<string, number>;
  lastChecked: Date | null;
}

interface SyncContextData {
  status: SyncStatus;
  syncMode: SyncMode;
  lastSyncTime: Date | null;
  activeSyncs: Set<string>;
  errors: Map<string, any>;
  isSyncEnabled: boolean;
  syncHistory: SyncLogEntry[];
  scheduledSyncTime: string; // HH:mm
  isScheduledSyncEnabled: boolean;
  stats: SyncStats;
  cycleSyncMode: () => void;
  setSyncMode: (mode: SyncMode) => void;
  setScheduledSync: (enabled: boolean, time: string) => void;
  reportSyncStart: (service: string, itemsCount?: number) => void;
  reportSyncSuccess: (service: string, details?: string) => void;
  reportSyncError: (service: string, error: any) => void;
  registerSyncService: (service: string, syncFn: () => Promise<void>) => void;
  refreshStats: () => Promise<void>;
  clearHistory: () => void;
  triggerManualSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextData | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeSyncs, setActiveSyncs] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, any>>(new Map());
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => {
    const saved = localStorage.getItem('cine-explorer-last-sync');
    return saved ? new Date(saved) : null;
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // History and Scheduling
  const [syncHistory, setSyncHistory] = useState<SyncLogEntry[]>(() => {
    const saved = localStorage.getItem('cine-explorer-sync-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((entry: any) => ({ ...entry, timestamp: new Date(entry.timestamp) }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [scheduledSyncTime, setScheduledSyncTime] = useState(() => 
    localStorage.getItem('cine-explorer-sync-time') || '03:00'
  );
  const [isScheduledSyncEnabled, setIsScheduledSyncEnabled] = useState(() => 
    localStorage.getItem('cine-explorer-sync-enabled') === 'true'
  );

  // STATS INITIALIZATION - Force local counts correctly on startup
  const [stats, setStats] = useState<SyncStats>(() => {
    const local = { favorites: 0, watched: 0, watchlist: 0, custom_lists: 0 };
    try {
      local.favorites = JSON.parse(localStorage.getItem('cine-explorer-favorites') || '[]').length;
      local.watched = JSON.parse(localStorage.getItem('cine-explorer-watched') || '[]').length;
      local.watchlist = JSON.parse(localStorage.getItem('queroAssistir') || '[]').length;
      local.custom_lists = JSON.parse(localStorage.getItem('cine-explorer-custom-lists') || '[]').length;
    } catch (e) {
      console.error('Error in stats initial state:', e);
    }
    return {
      local,
      remote: { favorites: 0, watched: 0, watchlist: 0, custom_lists: 0 },
      lastChecked: new Date()
    };
  });
  
  // Initialize sync mode from localStorage
  // Default to 'persistence' (ON)
  const [syncMode, setSyncModeState] = useState<SyncMode>(() => {
    const savedMode = localStorage.getItem('cine-explorer-sync-mode');
    if (savedMode === 'persistence' || savedMode === 'suspended') {
      return savedMode;
    }
    // Legacy support: 'normal' becomes 'persistence'
    if (savedMode === 'normal') return 'persistence';
    
    // Legacy boolean flag support
    const legacyEnabled = localStorage.getItem('cine-explorer-sync-enabled');
    if (legacyEnabled === 'false') return 'suspended';
    
    // Default to persistence
    return 'persistence';
  });

  useEffect(() => {
    // Debug helper and safety timeout
    if (activeSyncs.size > 0) {
      // console.log('🔄 Active syncs:', Array.from(activeSyncs));
      
      // Safety timeout: clear all active syncs after 15 seconds if they get hung
      const timeout = setTimeout(() => {
        console.warn('⚠️ Sync timeout: Clearing hung sync states after 15s');
        setActiveSyncs(new Set());
      }, 15000);
      
      return () => clearTimeout(timeout);
    }
  }, [activeSyncs]);

  const registry = useRef<Map<string, () => Promise<void>>>(new Map());
  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      retryTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  // Update localStorage when mode changes
  const setSyncMode = (mode: SyncMode) => {
    setSyncModeState(mode);
    localStorage.setItem('cine-explorer-sync-mode', mode);
    // Update legacy flag for compatibility
    localStorage.setItem('cine-explorer-sync-enabled', mode !== 'suspended' ? 'true' : 'false');
    
    // Toast feedback
    const modeLabels = {
      persistence: 'Sincronização Ativada',
      suspended: 'Sincronização Suspensa'
    };
    
    toast({
      title: 'Modo de Sincronização Alterado',
      description: `${modeLabels[mode]}.`,
    });

    // If switching FROM persistence (to suspended), clear any pending retries
    if (mode !== 'persistence') {
      retryTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      retryTimeouts.current.clear();
    }
  };

  const cycleSyncMode = () => {
    // Toggle between persistence and suspended
    setSyncMode(syncMode === 'persistence' ? 'suspended' : 'persistence');
  };

  const registerSyncService = (service: string, syncFn: () => Promise<void>) => {
    registry.current.set(service, syncFn);
  };

  const addHistoryEntry = (entry: Omit<SyncLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: SyncLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };
    setSyncHistory(prev => {
      const updated = [newEntry, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem('cine-explorer-sync-history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setSyncHistory([]);
    localStorage.removeItem('cine-explorer-sync-history');
  };

  const setScheduledSync = (enabled: boolean, time: string) => {
    setIsScheduledSyncEnabled(enabled);
    setScheduledSyncTime(time);
    localStorage.setItem('scheduled-sync-enabled', enabled ? 'true' : 'false');
    localStorage.setItem('scheduled-sync-time', time);
    
    toast({
      title: enabled ? 'Sincronização Agendada' : 'Agendamento Desativado',
      description: enabled ? `Seus dados serão sincronizados diariamente às ${time}.` : 'A sincronização automática por horário foi desativada.',
    });
  };

  const reportSyncStart = (service: string, itemsCount?: number) => {
    if (syncMode === 'suspended') {
        console.log(`🚫 Sync blocked for ${service} (Suspended Mode)`);
        return;
    }

    addHistoryEntry({ service, status: 'start', itemsCount });
    
    // Clear any pending retry for this service
    if (retryTimeouts.current.has(service)) {
      clearTimeout(retryTimeouts.current.get(service));
      retryTimeouts.current.delete(service);
    }

    setActiveSyncs(prev => {
      const next = new Set(prev);
      next.add(service);
      return next;
    });
    setErrors(prev => {
      const next = new Map(prev);
      next.delete(service);
      return next;
    });
  };

  // Auto-refresh stats on mount and when sync status changes to idle
  useEffect(() => {
    refreshStats();
  }, []);

  const reportSyncSuccess = (service: string, details?: string) => {
    addHistoryEntry({ service, status: 'success', details });
    setActiveSyncs(prev => {
      const next = new Set(prev);
      next.delete(service);
      return next;
    });
    const now = new Date();
    setLastSyncTime(now);
    localStorage.setItem('cine-explorer-last-sync', now.toISOString());
  };

  const reportSyncError = (service: string, error: any) => {
    addHistoryEntry({ 
      service, 
      status: 'error', 
      details: typeof error === 'string' ? error : error.message || 'Erro desconhecido' 
    });
    console.error(`❌ Sync error: ${service}`, error);
    setActiveSyncs(prev => {
      const next = new Set(prev);
      next.delete(service);
      return next;
    });
    setErrors(prev => {
      const next = new Map(prev);
      next.set(service, error);
      return next;
    });

    // Schedule auto-retry ONLY if in Persistence Mode
    if (syncMode === 'persistence') {
      const syncFn = registry.current.get(service);
      if (syncFn) {
        console.log(`🔄 [Persistence Mode] Scheduling retry for ${service} in 1 minute...`);
        const timeout = setTimeout(() => {
          console.log(`🔄 [Persistence Mode] Auto-retrying service: ${service}`);
          // Re-trigger sync
          syncFn().catch(e => console.error(`Retry failed for ${service}`, e));
        }, 60000); // Retry after 60 seconds
        retryTimeouts.current.set(service, timeout);
      }
    } else {
        console.log(`ℹ️ Retry skipped (Current mode: ${syncMode})`);
    }
  };

  const getStatus = (): SyncStatus => {
    if (!isOnline) return 'offline';
    if (activeSyncs.size > 0) return 'syncing';
    if (errors.size > 0) return 'error';
    return 'idle';
  };

  const refreshStats = async () => {
    console.log('🔄 [SyncContext] refreshStats started');
    const localStats = { favorites: 0, watched: 0, watchlist: 0, custom_lists: 0 };

    try {
      localStats.favorites = JSON.parse(localStorage.getItem('cine-explorer-favorites') || '[]').length;
      localStats.watched = JSON.parse(localStorage.getItem('cine-explorer-watched') || '[]').length;
      localStats.watchlist = JSON.parse(localStorage.getItem('queroAssistir') || '[]').length;
      localStats.custom_lists = JSON.parse(localStorage.getItem('cine-explorer-custom-lists') || '[]').length;
      console.log('🔄 [SyncContext] Local stats:', localStats);
    } catch (e) {
      console.error('🔄 [SyncContext] Error reading local stats:', e);
    }

    // Update local stats immediately
    setStats(prev => ({ ...prev, local: localStats, lastChecked: new Date() }));

    if (!isOnline) return;

    try {
      console.log('🔄 [SyncContext] Fetching remote stats...');
      const { supabase: supabaseClient } = await import('@/integrations/supabase/client');
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (session?.user) {
        console.log('🔄 [SyncContext] Remote session found for user:', session.user.id);
        const [favs, watched, watchl, lists] = await Promise.all([
          supabaseClient.from('user_favorites').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id),
          supabaseClient.from('user_watched').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id),
          supabaseClient.from('user_watchlist').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id),
          supabaseClient.from('user_custom_lists').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id),
        ]);

        const remoteStats = {
          favorites: favs.count || 0,
          watched: watched.count || 0,
          watchlist: watchl.count || 0,
          custom_lists: lists.count || 0,
        };
        console.log('🔄 [SyncContext] Remote stats fetched:', remoteStats);

        setStats({
          local: localStats,
          remote: remoteStats,
          lastChecked: new Date()
        });
      } else {
        console.log('🔄 [SyncContext] No remote session found');
      }
    } catch (error) {
      console.error('🔄 [SyncContext] Error in remote refreshStats:', error);
    }
  };

  const triggerManualSync = async () => {
    console.log('🔄 [SyncContext] Manual sync triggered');
    if (syncMode === 'suspended') {
      setSyncMode('persistence');
    }

    toast({
      title: 'Sincronizando...',
      description: 'Atualizando seus dados com a nuvem.',
    });

    const services = Array.from(registry.current.keys());
    console.log('🔄 [SyncContext] Services to sync:', services);

    await Promise.all(
      services.map(async (service) => {
        const syncFn = registry.current.get(service);
        if (syncFn) {
          try {
            console.log(`🔄 [SyncContext] Starting sync for ${service}`);
            await syncFn();
            console.log(`🔄 [SyncContext] Sync success for ${service}`);
          } catch (e) {
            console.error(`🔄 [SyncContext] Sync failed for ${service}:`, e);
          }
        }
      })
    );

    console.log('🔄 [SyncContext] All services finished, refreshing stats');
    await refreshStats();
  };

  // Scheduled Sync Effect
  useEffect(() => {
    if (!isScheduledSyncEnabled) return;

    const checkSchedule = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime === scheduledSyncTime) {
        console.log('⏰ Scheduled sync triggered!');
        triggerManualSync();
      }
    };

    const interval = setInterval(checkSchedule, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isScheduledSyncEnabled, scheduledSyncTime]);

  return (
    <SyncContext.Provider
      value={{
        status: getStatus(),
        syncMode,
        lastSyncTime,
        activeSyncs,
        errors,
        isSyncEnabled: syncMode !== 'suspended',
        syncHistory,
        scheduledSyncTime,
        isScheduledSyncEnabled,
        stats,
        cycleSyncMode,
        setSyncMode,
        setScheduledSync,
        reportSyncStart,
        reportSyncSuccess,
        reportSyncError,
        registerSyncService,
        refreshStats,
        clearHistory,
        triggerManualSync
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSyncContext = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }
  return context;
};
