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
        className={`relative overflow-hidden group ${className}`}
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
