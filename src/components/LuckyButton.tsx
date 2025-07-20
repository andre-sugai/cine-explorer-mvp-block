import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dice6, Loader } from 'lucide-react';
import { ModalLuckyPick } from './ModalLuckyPick';

interface LuckyButtonProps {
  variant?: 'default' | 'hero';
  className?: string;
}

/**
 * LuckyButton
 * Botão que abre o modal de sorteio cinematográfico (ModalLuckyPick).
 *
 * Props:
 * - variant: estilo do botão
 * - className: classes adicionais
 */
export const LuckyButton: React.FC<LuckyButtonProps> = ({
  variant = 'default',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isLoading}
        variant={variant}
        className={`relative overflow-hidden group ${className}`}
      >
        {isLoading ? (
          <Loader className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Dice6 className="w-4 h-4 mr-2 group-hover:animate-bounce" />
        )}
        {isLoading ? 'Sorteando...' : 'Estou com Sorte!'}
      </Button>
      <ModalLuckyPick open={open} onOpenChange={setOpen} />
    </>
  );
};
