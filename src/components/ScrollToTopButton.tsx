
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';

export const ScrollToTopButton: React.FC = () => {
  const { showButton, scrollToTop } = useScrollToTop();

  if (!showButton) return null;

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-gold text-cinema-dark shadow-glow hover:opacity-90 transition-all duration-300 animate-fade-in md:bottom-8 md:right-8"
      size="icon"
      aria-label="Voltar ao topo"
    >
      <ArrowUp className="w-5 h-5 font-bold" />
    </Button>
  );
};
