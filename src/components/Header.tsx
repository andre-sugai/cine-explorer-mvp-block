import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Film,
  Home,
  Heart,
  Calendar,
  CheckCircle,
  Settings,
  User,
  LogIn,
  Key,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ApiConfigModal } from '@/components/ApiConfigModal';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Verificar se usuário está "logado" (tem API key configurada)
  useEffect(() => {
    const checkLoginStatus = () => {
      const apiKey = localStorage.getItem('tmdb_api_key');
      setIsLoggedIn(!!apiKey);
    };

    checkLoginStatus();
    // Listener para mudanças no localStorage
    window.addEventListener('storage', checkLoginStatus);
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, []);

  // Fechar popup ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserPopup(false);
      }
    };

    if (showUserPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserPopup]);

  const handleApiComplete = (apiKey: string) => {
    localStorage.setItem('tmdb_api_key', apiKey);
    setShowApiModal(false);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('tmdb_api_key');
    setIsLoggedIn(false);
    setShowUserPopup(false);
    navigate('/');
  };

  const handleSettingsClick = () => {
    setShowUserPopup(false);
    navigate('/configuracoes');
  };

  const handleChangeApi = () => {
    setShowUserPopup(false);
    setShowApiModal(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/busca/${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'favorites', label: 'Favoritos', icon: Heart, path: '/favoritos' },
    {
      id: 'want-to-watch',
      label: 'Quer ver',
      icon: Calendar,
      path: '/quer-ver',
    },
    { id: 'watched', label: 'Vistos', icon: CheckCircle, path: '/vistos' },
  ];

  const isActive = (path: string) => currentPath === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-cinema backdrop-blur-sm border-b border-primary/20 shadow-cinema">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center shadow-glow">
              <Film className="w-6 h-6 text-cinema-dark" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Cine Explorer</h1>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <React.Fragment key={item.id}>
                  <Link to={item.path}>
                    <Button
                      variant={active ? 'default' : 'ghost'}
                      className={`
                        flex items-center gap-2 transition-all duration-200
                        ${
                          active
                            ? 'bg-gradient-gold text-cinema-dark shadow-glow'
                            : 'text-foreground hover:text-primary hover:bg-secondary/50'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                  {/* Insere o campo de busca logo após o botão 'Vistos' */}
                  {item.id === 'watched' && (
                    <form
                      onSubmit={handleSearch}
                      className={`
                        relative ml-4
                        transition-all duration-200
                        ${
                          isSearchFocused
                            ? 'shadow-glow border-primary/40 scale-[1.02]'
                            : ''
                        }
                      `}
                      style={{ minWidth: 220, maxWidth: 320 }}
                    >
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        placeholder="Buscar..."
                        className="pl-10 pr-3 h-10 text-base bg-secondary/50 border-none focus:bg-background focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                      />
                    </form>
                  )}
                </React.Fragment>
              );
            })}
            
            {/* Auth Section */}
            <div className="flex items-center gap-2 ml-2">
              {isLoggedIn ? (
                <div className="relative" ref={userMenuRef}>
                  <Button 
                    variant="ghost" 
                    className="relative h-8 w-8 rounded-full"
                    onClick={() => setShowUserPopup(!showUserPopup)}
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  
                  {/* Popup Menu */}
                  {showUserPopup && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-50 overflow-hidden">
                      <div className="py-1">
                        <button
                          onClick={handleSettingsClick}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Configurações
                        </button>
                        <button
                          onClick={handleChangeApi}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors"
                        >
                          <Key className="w-4 h-4" />
                          Alterar API
                        </button>
                        <div className="border-t border-border my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-destructive hover:text-destructive-foreground flex items-center gap-2 transition-colors"
                        >
                          <LogIn className="w-4 h-4 rotate-180" />
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button onClick={() => setShowApiModal(true)} variant="outline">
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </Button>
              )}
            </div>
          </nav>

          {/* Navigation - Mobile */}
          <nav className="md:hidden flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link key={item.id} to={item.path}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    size="sm"
                    className={`
                      p-2 transition-all duration-200
                      ${
                        active
                          ? 'bg-gradient-gold text-cinema-dark shadow-glow'
                          : 'text-foreground hover:text-primary hover:bg-secondary/50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                </Link>
              );
            })}
            
            {/* Auth Section Mobile */}
            <div className="flex items-center gap-1 ml-1">
              {isLoggedIn ? (
                <div className="relative" ref={userMenuRef}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-2"
                    onClick={() => setShowUserPopup(!showUserPopup)}
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  
                  {/* Mobile Popup Menu */}
                  {showUserPopup && (
                    <div className="absolute right-0 top-full mt-2 w-44 bg-background border border-border rounded-md shadow-lg z-50 overflow-hidden">
                      <div className="py-1">
                        <button
                          onClick={handleSettingsClick}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Configurações
                        </button>
                        <button
                          onClick={handleChangeApi}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors"
                        >
                          <Key className="w-4 h-4" />
                          Alterar API
                        </button>
                        <div className="border-t border-border my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-destructive hover:text-destructive-foreground flex items-center gap-2 transition-colors"
                        >
                          <LogIn className="w-4 h-4 rotate-180" />
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button onClick={() => setShowApiModal(true)} variant="ghost" size="sm" className="p-2">
                  <LogIn className="h-4 w-4" />
                </Button>
              )}
            </div>
          </nav>
        </div>
      </div>
      
      <ApiConfigModal 
        open={showApiModal} 
        onComplete={handleApiComplete} 
      />
    </header>
  );
};
