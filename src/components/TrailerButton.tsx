import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { TrailerModal } from './TrailerModal';

interface TrailerButtonProps {
  variant?: 'default' | 'hero';
  className?: string;
}

export const TrailerButton: React.FC<TrailerButtonProps> = ({
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
        <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
        Trailers
      </Button>
      <TrailerModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
};