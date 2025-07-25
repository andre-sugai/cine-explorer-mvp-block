import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Film,
  Home,
  Heart,
  CheckCircle,
  Settings,
  User,
  LogIn,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ApiConfigModal } from '@/components/ApiConfigModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [showApiModal, setShowApiModal] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Verificar se API key está configurada
  useEffect(() => {
    const apiKey = localStorage.getItem('tmdb_api_key');
    setHasApiKey(!!apiKey);
  }, []);

  // Escutar mudanças no localStorage para atualizar estado
  useEffect(() => {
    const handleStorageChange = () => {
      const apiKey = localStorage.getItem('tmdb_api_key');
      setHasApiKey(!!apiKey);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleApiComplete = (apiKey: string) => {
    localStorage.setItem('tmdb_api_key', apiKey);
    setHasApiKey(true);
    setShowApiModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('tmdb_api_key');
    setHasApiKey(false);
  };

  // Menu principal: Home, Favoritos, Vistos
  const mainNavItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'favorites', label: 'Favoritos', icon: Heart, path: '/favoritos' },
    { id: 'watched', label: 'Vistos', icon: CheckCircle, path: '/vistos' },
  ];

  const isActive = (path: string) => currentPath === path;

  return (
    <TooltipProvider>
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

            {/* Menu principal - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              {/* Navegação principal */}
              <nav className="flex items-center gap-2">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link key={item.id} to={item.path}>
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
                  );
                })}
              </nav>

              {/* Botão Login/User */}
              {hasApiKey ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48" align="end">
                    <DropdownMenuItem onClick={() => setShowApiModal(true)}>
                      Alterar API
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setShowApiModal(true)} variant="outline">
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </Button>
              )}

              {/* Ícone Configurações */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/configuracoes">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`
                        p-2 transition-all duration-200
                        ${
                          isActive('/configuracoes')
                            ? 'bg-gradient-gold text-cinema-dark shadow-glow'
                            : 'text-muted-foreground hover:text-primary hover:bg-secondary/50'
                        }
                      `}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Configurações</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Menu principal - Mobile */}
            <div className="md:hidden flex items-center gap-1">
              {/* Navegação principal */}
              {mainNavItems.map((item) => {
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

              {/* Botão Login/User - Mobile */}
              {hasApiKey ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="p-2 text-primary bg-primary/10"
                  onClick={() => setShowApiModal(true)}
                >
                  <User className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowApiModal(true)} 
                  variant="outline" 
                  size="sm"
                  className="p-2"
                >
                  <LogIn className="w-4 h-4" />
                </Button>
              )}

              {/* Ícone Configurações - Mobile */}
              <Link to="/configuracoes">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`
                    p-2 transition-all duration-200
                    ${
                      isActive('/configuracoes')
                        ? 'bg-gradient-gold text-cinema-dark shadow-glow'
                        : 'text-muted-foreground hover:text-primary hover:bg-secondary/50'
                    }
                  `}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <ApiConfigModal 
          open={showApiModal} 
          onComplete={handleApiComplete} 
        />
      </header>
    </TooltipProvider>
  );
};
