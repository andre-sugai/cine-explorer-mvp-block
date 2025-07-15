
import React, { useState, useEffect } from 'react';
import { ApiConfigModal } from './ApiConfigModal';
import { Layout } from './Layout';
import { HomePage } from './HomePage';
import { FavoritesPage } from './FavoritesPage';
import { WatchedPage } from './WatchedPage';
import { SettingsPage } from './SettingsPage';
import { AboutPage } from './AboutPage';
import { useLocation } from 'react-router-dom';

const TMDB_API_KEY = 'tmdb_api_key';

export const CineExplorer: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiModal, setShowApiModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Verificar se já existe uma chave API salva
    const savedApiKey = localStorage.getItem(TMDB_API_KEY);
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setShowApiModal(false);
    } else {
      setShowApiModal(true);
    }
    
    setIsLoading(false);
  }, []);

  const handleApiKeyComplete = (newApiKey: string) => {
    // Salvar a chave API no localStorage
    localStorage.setItem(TMDB_API_KEY, newApiKey);
    setApiKey(newApiKey);
    setShowApiModal(false);
  };

  const renderCurrentPage = () => {
    const path = location.pathname;
    
    // Roteamento baseado no pathname
    if (path === '/') return <HomePage />;
    if (path === '/favoritos') return <FavoritesPage />;
    if (path === '/vistos') return <WatchedPage />;
    if (path === '/configuracoes') return <SettingsPage />;
    if (path === '/sobre') return <AboutPage />;
    
    // Default para home se rota não encontrada
    return <HomePage />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-gold rounded-lg flex items-center justify-center shadow-glow mb-4 mx-auto">
            <svg className="w-8 h-8 text-cinema-dark animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-primary font-semibold">Carregando Cine Explorer...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal de configuração da API */}
      <ApiConfigModal 
        open={showApiModal} 
        onComplete={handleApiKeyComplete}
      />

      {/* Layout principal com header fixo e breadcrumbs */}
      {apiKey && (
        <Layout>
          {renderCurrentPage()}
        </Layout>
      )}
    </>
  );
};
