import React from 'react';
import { TriangleAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  isAdminUser,
  addToBlacklist,
  isInBlacklist,
  removeFromBlacklist,
} from '@/utils/adultContentFilter';
import { cn } from '@/lib/utils';

interface BlacklistButtonProps {
  title: string;
  type?: 'movie' | 'tv' | 'person';
  className?: string;
  iconClassName?: string;
}

export const BlacklistButton: React.FC<BlacklistButtonProps> = ({
  title,
  type = 'movie',
  className,
  iconClassName,
}) => {
  const { user } = useAuth();
  const isAdmin = isAdminUser(user?.email);
  const isBlacklisted = isInBlacklist(title);

  if (!isAdmin || type === 'person') return null;

  const handleAddToBlacklist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isBlacklisted) {
        removeFromBlacklist(title, user?.email);
        toast.success(`"${title}" foi removido da blacklist`, {
          description: 'O filme não será mais bloqueado pelo filtro',
        });
      } else {
        addToBlacklist(title, user?.email);
        toast.success(`"${title}" foi adicionado à blacklist`, {
          description: 'O filme será bloqueado pelo filtro de conteúdo adulto',
        });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao modificar blacklist'
      );
    }
  };

  return (
    <button
      onClick={handleAddToBlacklist}
      className={cn(
        "p-1.5 rounded-full transition-colors flex items-center justify-center backdrop-blur-sm",
        isBlacklisted
          ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-400"
          : "bg-black/40 text-white/70 hover:bg-red-500/20 hover:text-red-500",
        className
      )}
      title={
        isBlacklisted
          ? 'Remover da blacklist (admin)'
          : 'Adicionar à blacklist (admin)'
      }
    >
      <TriangleAlert className={cn("w-4 h-4", iconClassName)} />
    </button>
  );
};
