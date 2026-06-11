import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Swords } from 'lucide-react';
import { ModalArena } from './ModalArena';

interface ArenaButtonProps {
  variant?: 'default' | 'hero';
  className?: string;
}

export const ArenaButton: React.FC<ArenaButtonProps> = ({
  variant = 'default',
  className = '',
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = () => {
    setModalOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant={variant}
        className={`relative overflow-hidden group ${className} bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 hover:from-red-700 hover:via-orange-600 hover:to-yellow-600 border-none text-white font-semibold transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(239,68,68,0.35)]`}
      >
        <Swords className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
        Arena
      </Button>
      <ModalArena 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
      />
    </>
  );
};
