import React, { useState } from 'react';
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
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { DataMigrationModal } from '@/components/auth/DataMigrationModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowMigrationModal(true);
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
      label: 'Quero Assistir',
      icon: Calendar,
      path: '/quero-assistir',
    },
    { id: 'watched', label: 'Vistos', icon: CheckCircle, path: '/vistos' },
    {
      id: 'recommendations',
      label: 'Recomendações',
      icon: Sparkles,
      path: '/recomendacoes',
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      path: '/configuracoes',
    },
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
            {navItems
              .filter((item) => item.id !== 'settings')
              .map((item, idx) => {
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
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuItem disabled>{user?.email}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  variant="outline"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Entrar
                </Button>
              )}

              {/* Settings Icon */}
              <Link to="/configuracoes">
                <Button
                  variant={isActive('/configuracoes') ? 'default' : 'ghost'}
                  size="sm"
                  className={`
                    p-2 transition-all duration-200
                    ${
                      isActive('/configuracoes')
                        ? 'bg-gradient-gold text-cinema-dark shadow-glow'
                        : 'text-foreground hover:text-primary hover:bg-secondary/50'
                    }
                  `}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
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
          </nav>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      <DataMigrationModal
        isOpen={showMigrationModal}
        onClose={() => setShowMigrationModal(false)}
        onMigrationComplete={() => setShowMigrationModal(false)}
      />
    </header>
  );
};
