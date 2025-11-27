import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { TrailerModal } from './TrailerModal';

interface NovidadesButtonProps {
  variant?: 'default' | 'hero';
  className?: string;
}

export const NovidadesButton: React.FC<NovidadesButtonProps> = ({
  variant = 'default',
  className = '',
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = () => {
    setModalOpen(true);
  };

  // Calcular datas do mês atual
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11

  // Primeiro dia do mês
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  
  // Último dia do mês
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  // Nome do mês em português
  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(now);
  const label = `Novidades de ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}/${year}`;

  const filters = {
    startDate,
    endDate,
    label,
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant={variant}
        className={`relative overflow-hidden group ${className} bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-none text-white`}
      >
        <Sparkles className="w-4 h-4 mr-2 group-hover:animate-pulse" />
        Novidades
      </Button>
      <TrailerModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        filters={filters}
      />
    </>
  );
};
