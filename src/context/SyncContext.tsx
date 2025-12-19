import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export type SyncMode = 'persistence' | 'suspended';
type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

interface SyncContextData {
  status: SyncStatus;
  syncMode: SyncMode;
  lastSyncTime: Date | null;
  activeSyncs: Set<string>;
  errors: Map<string, any>;
  isSyncEnabled: boolean;
  cycleSyncMode: () => void;
  setSyncMode: (mode: SyncMode) => void;
  reportSyncStart: (service: string) => void;
  reportSyncSuccess: (service: string) => void;
  reportSyncError: (service: string, error: any) => void;
  registerSyncService: (service: string, syncFn: () => Promise<void>) => void;
}

const SyncContext = createContext<SyncContextData | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeSyncs, setActiveSyncs] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, any>>(new Map());
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
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
      console.log('🔄 Active syncs:', Array.from(activeSyncs));
      
      // Safety timeout: clear all active syncs after 15 seconds if they get hung
      const timeout = setTimeout(() => {
        console.warn('⚠️ Sync timeout: Clearing hung sync states after 15s');
        setActiveSyncs(new Set());
      }, 15000);
      
      return () => clearTimeout(timeout);
    }
  }, [activeSyncs]);

  const registry = React.useRef<Map<string, () => Promise<void>>>(new Map());
  const retryTimeouts = React.useRef<Map<string, NodeJS.Timeout>>(new Map());

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

  const reportSyncStart = (service: string) => {
    if (syncMode === 'suspended') {
        console.log(`🚫 Sync blocked for ${service} (Suspended Mode)`);
        return;
    }

    console.log(`📡 Sync started: ${service}`);
    
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

  const reportSyncSuccess = (service: string) => {
    console.log(`✅ Sync success: ${service}`);
    setActiveSyncs(prev => {
      const next = new Set(prev);
      next.delete(service);
      return next;
    });
    setLastSyncTime(new Date());
  };

  const reportSyncError = (service: string, error: any) => {
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

  return (
    <SyncContext.Provider
      value={{
        status: getStatus(),
        syncMode,
        lastSyncTime,
        activeSyncs,
        errors,
        isSyncEnabled: syncMode !== 'suspended',
        cycleSyncMode,
        setSyncMode,
        reportSyncStart,
        reportSyncSuccess,
        reportSyncError,
        registerSyncService,
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
