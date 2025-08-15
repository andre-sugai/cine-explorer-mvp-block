import React, { useState, useEffect } from 'react';
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
  Menu,
  Search,
  X,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    profileImage?: string;
    nickname?: string;
  }>({});
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const isMobile = useIsMobile();

  /**
   * Carrega o perfil do usuário do localStorage
   */
  useEffect(() => {
    if (isAuthenticated) {
      const savedProfile = localStorage.getItem('user_profile');
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          setUserProfile(parsedProfile);
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
        }
      }
    }
  }, [isAuthenticated]);

  /**
   * Escuta mudanças no localStorage para atualizar o perfil em tempo real
   */
  useEffect(() => {
    const handleStorageChange = () => {
      if (isAuthenticated) {
        const savedProfile = localStorage.getItem('user_profile');
        if (savedProfile) {
          try {
            const parsedProfile = JSON.parse(savedProfile);
            setUserProfile(parsedProfile);
          } catch (error) {
            console.error('Erro ao carregar perfil:', error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowMigrationModal(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/busca/${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsMobileMenuOpen(false);
    }
  };

  const handleNavigation = (path: string) => {
    setIsMobileMenuOpen(false);
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
            <h1 className="hidden md:block text-2xl font-bold text-primary">
              Cine Explorer
            </h1>
          </Link>

          {/* Campo de busca centralizado - Mobile */}
          <div className="md:hidden flex-1 flex justify-center px-4">
            <form onSubmit={handleSearch} className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="pl-10 pr-3 h-9 text-sm bg-secondary/50 border-none focus:bg-background focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
              />
            </form>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item, idx) => {
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

            {/* Campo de busca separado da navegação */}
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
                        {userProfile.profileImage ? (
                          <AvatarImage
                            src={userProfile.profileImage}
                            alt="Foto de perfil"
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="bg-gradient-gold text-cinema-dark font-medium">
                          {userProfile.nickname
                            ? userProfile.nickname.charAt(0).toUpperCase()
                            : user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuItem disabled>{user?.email}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/configuracoes">
                        <Settings className="mr-2 h-4 w-4" />
                        Configurações
                      </Link>
                    </DropdownMenuItem>
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
            </div>
          </nav>

          {/* Mobile Menu Hamburger */}
          <div className="md:hidden flex items-center">
            {/* Menu Hamburger */}
            <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-foreground hover:text-primary hover:bg-secondary/50"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-[80vh]">
                <DrawerHeader className="border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <DrawerTitle className="text-lg font-bold text-primary">
                      Menu
                    </DrawerTitle>
                    <DrawerClose asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 text-foreground hover:text-primary"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto p-4">
                  {/* Navigation Items */}
                  <nav className="space-y-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);

                      return (
                        <Link
                          key={item.id}
                          to={item.path}
                          onClick={() => handleNavigation(item.path)}
                        >
                          <Button
                            variant={active ? 'default' : 'ghost'}
                            className={`
                              w-full justify-start gap-3 h-12 text-base transition-all duration-200
                              ${
                                active
                                  ? 'bg-gradient-gold text-cinema-dark shadow-glow'
                                  : 'text-foreground hover:text-primary hover:bg-secondary/50'
                              }
                            `}
                          >
                            <Icon className="w-5 h-5" />
                            {item.label}
                          </Button>
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Auth Section Mobile */}
                  <div className="mt-6 pt-6 border-t border-border/50">
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                          <Avatar className="h-10 w-10">
                            {userProfile.profileImage ? (
                              <AvatarImage
                                src={userProfile.profileImage}
                                alt="Foto de perfil"
                                className="object-cover"
                              />
                            ) : null}
                            <AvatarFallback className="bg-gradient-gold text-cinema-dark font-medium">
                              {userProfile.nickname
                                ? userProfile.nickname.charAt(0).toUpperCase()
                                : user?.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {userProfile.nickname || user?.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {userProfile.nickname
                                ? 'Usuário logado'
                                : user?.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }}
                          variant="outline"
                          className="w-full justify-start gap-3 h-12"
                        >
                          <LogOut className="w-5 h-5" />
                          Sair
                        </Button>
                        <Link
                          to="/configuracoes"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Button
                            variant="outline"
                            className="w-full justify-start gap-3 h-12"
                          >
                            <Settings className="w-5 h-5" />
                            Configurações
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          setShowAuthModal(true);
                          setIsMobileMenuOpen(false);
                        }}
                        variant="outline"
                        className="w-full justify-start gap-3 h-12"
                      >
                        <LogIn className="w-5 h-5" />
                        Entrar
                      </Button>
                    )}
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
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
