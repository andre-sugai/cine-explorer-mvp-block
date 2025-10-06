import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface QuickSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (term: string) => void;
}

const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [term, setTerm] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (open && inputRef.current) {
      // foco e seleção
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = term.trim();
    if (!value) return;
    onSubmit(value);
    onOpenChange(false);
    setTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] top-[40%] translate-y-[-50%] border-none bg-transparent shadow-none p-0">
        <form onSubmit={handleSubmit}>
          <Input
            ref={inputRef}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Digite para buscar e pressione Enter"
            autoFocus
            className="text-base"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickSearchModal;
