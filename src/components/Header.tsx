
import React from 'react';
import { Button } from '@/components/ui/button';
import { Film, Home, Heart, Calendar, CheckCircle, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'favorites', label: 'Favoritos', icon: Heart, path: '/favoritos' },
    { id: 'want-to-watch', label: 'Quero Assistir', icon: Calendar, path: '/quero-assistir' },
    { id: 'watched', label: 'Vistos', icon: CheckCircle, path: '/vistos' },
    { id: 'settings', label: 'Configurações', icon: Settings, path: '/configuracoes' }
  ];

  const isActive = (path: string) => currentPath === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-cinema backdrop-blur-sm border-b border-primary/20 shadow-cinema">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center shadow-glow">
              <Film className="w-6 h-6 text-cinema-dark" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Cine Explorer</h1>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link key={item.id} to={item.path}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    className={`
                      flex items-center gap-2 transition-all duration-200
                      ${active 
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
                      ${active 
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
    </header>
  );
};
