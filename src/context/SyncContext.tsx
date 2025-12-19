import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

interface SyncContextData {
  status: SyncStatus;
  lastSyncTime: Date | null;
  activeSyncs: Set<string>;
  errors: Map<string, any>;
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

  const registerSyncService = (service: string, syncFn: () => Promise<void>) => {
    registry.current.set(service, syncFn);
  };

  const reportSyncStart = (service: string) => {
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

    // Schedule auto-retry if service is registered
    const syncFn = registry.current.get(service);
    if (syncFn) {
      console.log(`🔄 Scheduling retry for ${service} in 10s...`);
      const timeout = setTimeout(() => {
        console.log(`🔄 Auto-retrying specific service: ${service}`);
        syncFn().catch(e => console.error(`Retry failed for ${service}`, e));
      }, 10000); // Retry after 10 seconds
      retryTimeouts.current.set(service, timeout);
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
        lastSyncTime,
        activeSyncs,
        errors,
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
