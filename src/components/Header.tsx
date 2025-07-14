
import React from 'react';
import { Button } from '@/components/ui/button';
import { Film, Home, Heart, CheckCircle, Info, Settings } from 'lucide-react';
import { LuckyButton } from './LuckyButton';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'watched', label: 'Assistidos', icon: CheckCircle },
    { id: 'settings', label: 'Configurações', icon: Settings },
    { id: 'about', label: 'Sobre', icon: Info }
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-cinema backdrop-blur-sm border-b border-primary/20 shadow-cinema">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center shadow-glow">
              <Film className="w-6 h-6 text-cinema-dark" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Cine Explorer</h1>
          </div>

          {/* Lucky Button - Desktop */}
          <div className="hidden md:block">
            <LuckyButton variant="hero" />
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'default' : 'ghost'}
                  onClick={() => onTabChange(item.id)}
                  className={`
                    flex items-center gap-2 transition-all duration-200
                    ${activeTab === item.id 
                      ? 'bg-gradient-gold text-cinema-dark shadow-glow' 
                      : 'text-foreground hover:text-primary hover:bg-secondary/50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center gap-1">
            {/* Lucky Button - Mobile */}
            <div className="md:hidden mr-2">
              <LuckyButton className="px-2" />
            </div>
            
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onTabChange(item.id)}
                  className={`
                    p-2 transition-all duration-200
                    ${activeTab === item.id 
                      ? 'bg-gradient-gold text-cinema-dark shadow-glow' 
                      : 'text-foreground hover:text-primary hover:bg-secondary/50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
