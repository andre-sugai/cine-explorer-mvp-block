import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

// Define the shape of our settings
export interface UserSettings {
  tmdb_api_key?: string;
  adult_content_filter?: boolean;
  my_streamings?: string[];
  user_profile?: {
    nickname: string;
    bio: string;
    profileImage: string;
    socialMedia: {
      instagram?: string;
      twitter?: string;
      facebook?: string;
      linkedin?: string;
      youtube?: string;
      website?: string;
    };
  };
  // Add other settings here as needed
  [key: string]: any;
}

interface SettingsContextData {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextData | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount and when auth changes
  useEffect(() => {
    loadSettings();
  }, [isAuthenticated, user]);

  const loadSettings = async () => {
    setIsLoading(true);
    
    // 1. Load from localStorage first (always available)
    const localSettings = loadFromLocalStorage();
    setSettings(localSettings);

    // 2. If logged in and sync enabled, load from Supabase
    const isSyncEnabled = localStorage.getItem('cine-explorer-sync-enabled') !== 'false';
    
    if (isAuthenticated && user && isSyncEnabled) {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('settings')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error loading settings from Supabase:', error);
        }

        if (data?.settings) {
          // Merge: Supabase settings overwrite local ones, but we keep local ones that aren't in Supabase
          // Actually, for settings, we probably want Supabase to be the source of truth if it exists
          const remoteSettings = data.settings as UserSettings;
          const mergedSettings = { ...localSettings, ...remoteSettings };
          
          setSettings(mergedSettings);
          
          // Update localStorage to match
          saveToLocalStorage(mergedSettings);
        } else {
          // If no settings in Supabase, push local settings
          if (Object.keys(localSettings).length > 0) {
            await saveToSupabase(localSettings);
          }
        }
      } catch (error) {
        console.error('Error syncing settings:', error);
      }
    }
    
    setIsLoading(false);
  };

  const loadFromLocalStorage = (): UserSettings => {
    const loadedSettings: UserSettings = {};
    
    // Map individual localStorage keys to our settings object
    const apiKey = localStorage.getItem('tmdb_api_key');
    if (apiKey) loadedSettings.tmdb_api_key = apiKey;

    const adultFilter = localStorage.getItem('adult_content_filter');
    if (adultFilter) loadedSettings.adult_content_filter = adultFilter === 'true';

    const streamings = localStorage.getItem('my_streamings');
    if (streamings) {
      try {
        loadedSettings.my_streamings = JSON.parse(streamings);
      } catch (e) {
        console.error('Error parsing my_streamings:', e);
      }
    }

    const profile = localStorage.getItem('user_profile');
    if (profile) {
      try {
        loadedSettings.user_profile = JSON.parse(profile);
      } catch (e) {
        console.error('Error parsing user_profile:', e);
      }
    }

    return loadedSettings;
  };

  const saveToLocalStorage = (newSettings: UserSettings) => {
    if (newSettings.tmdb_api_key !== undefined) {
      localStorage.setItem('tmdb_api_key', newSettings.tmdb_api_key);
    }
    
    if (newSettings.adult_content_filter !== undefined) {
      localStorage.setItem('adult_content_filter', String(newSettings.adult_content_filter));
    }
    
    if (newSettings.my_streamings !== undefined) {
      localStorage.setItem('my_streamings', JSON.stringify(newSettings.my_streamings));
    }
    
    if (newSettings.user_profile !== undefined) {
      localStorage.setItem('user_profile', JSON.stringify(newSettings.user_profile));
    }
  };

  const saveToSupabase = async (newSettings: UserSettings) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({ 
          user_id: user.id, 
          settings: newSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving settings to Supabase:', error);
      toast({
        title: 'Erro na sincronização',
        description: 'Não foi possível salvar suas configurações na nuvem.',
        variant: 'destructive',
      });
    }
  };

  const updateSetting = async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    
    // 1. Optimistic update
    setSettings(newSettings);
    saveToLocalStorage(newSettings);

    // 2. Sync to Supabase
    const isSyncEnabled = localStorage.getItem('cine-explorer-sync-enabled') !== 'false';
    if (isAuthenticated && user && isSyncEnabled) {
      await saveToSupabase(newSettings);
    }
  };

  const updateSettings = async (newValues: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...newValues };
    
    // 1. Optimistic update
    setSettings(newSettings);
    saveToLocalStorage(newSettings);

    // 2. Sync to Supabase
    const isSyncEnabled = localStorage.getItem('cine-explorer-sync-enabled') !== 'false';
    if (isAuthenticated && user && isSyncEnabled) {
      await saveToSupabase(newSettings);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        updateSettings,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettingsContext(): SettingsContextData {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext deve ser usado dentro de um SettingsProvider');
  }
  return context;
}
