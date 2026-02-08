
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TMDBContent } from "@/utils/tmdb";
import { CalendarItem } from "./CalendarItem";

interface CalendarDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  items: TMDBContent[];
}

export const CalendarDayModal: React.FC<CalendarDayModalProps> = ({
  isOpen,
  onClose,
  date,
  items
}) => {
  if (!date) return null;

  const formattedDate = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] bg-cinema-dark border-white/10 text-white p-0 flex flex-col">
        <DialogHeader className="p-6 border-b border-white/10 bg-black/40 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold capitalize text-primary">
            Lançamentos de {formattedDate}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {items.map((item) => (
              <CalendarItem key={item.id} item={item} />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
