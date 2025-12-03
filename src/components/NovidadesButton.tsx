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

  // Calcular datas: mês atual e mês anterior
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11

  // Data de início: Primeiro dia do mês anterior
  // O construtor Date lida corretamente com underflow de mês (ex: mês -1 vira Dezembro do ano anterior)
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  
  // Data de fim: Último dia do mês atual
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  // Nomes dos meses
  const currentMonthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(now);
  
  const prevMonthDate = new Date(year, month - 1, 1);
  const prevMonthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(prevMonthDate);
  const prevYear = prevMonthDate.getFullYear();

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  let label;
  if (prevYear !== year) {
    label = `Novidades de ${capitalize(prevMonthName)}/${prevYear} e ${capitalize(currentMonthName)}/${year}`;
  } else {
    label = `Novidades de ${capitalize(prevMonthName)} e ${capitalize(currentMonthName)}/${year}`;
  }

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
