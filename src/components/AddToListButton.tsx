import React from 'react';
import { ListPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCustomListsContext } from '@/context/CustomListsContext';

interface AddToListButtonProps {
  id: number;
  title: string;
  poster_path?: string;
  type: 'movie' | 'tv';
  className?: string;
}

export const AddToListButton: React.FC<AddToListButtonProps> = ({
  id,
  title,
  poster_path,
  type,
  className,
}) => {
  const { lists, addItemToList } = useCustomListsContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`p-1.5 rounded-full transition-colors flex items-center justify-center backdrop-blur-sm bg-black/40 text-white/70 hover:bg-primary/90 hover:text-white ${className}`}
          title="Adicionar a uma lista"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <ListPlus className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover border-primary/20">
        <DropdownMenuLabel>Adicionar à lista...</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {lists.length > 0 ? (
          lists.map((list) => (
            <DropdownMenuItem
              key={list.id}
              onClick={(e) => {
                e.stopPropagation();
                addItemToList(list.id, {
                  id,
                  title,
                  poster_path,
                  type,
                });
              }}
            >
              {list.name}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>Nenhuma lista criada</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
