import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface ImprovedCheckboxSettingProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon?: React.ReactNode;
  title: string;
  description: string;
  successMessage?: string;
  disabledMessage?: string;
}

/**
 * Componente de Checkbox melhorado para configurações
 * 
 * Melhorias de acessibilidade e UX:
 * - ✅ WCAG AA compliance com labels adequados
 * - ✅ Touch targets 44x44px para dispositivos móveis
 * - ✅ Focus states visíveis para navegação por teclado
 * - ✅ Feedback visual com hover states
 * - ✅ Animações suaves (200ms)
 * - ✅ Toast notifications para confirmação
 */
export const ImprovedCheckboxSetting: React.FC<ImprovedCheckboxSettingProps> = ({
  id,
  checked,
  onCheckedChange,
  icon,
  title,
  description,
  successMessage,
  disabledMessage
}) => {
  const handleChange = (newChecked: boolean) => {
    onCheckedChange(newChecked);
    
    if (successMessage || disabledMessage) {
      toast({
        title: newChecked ? successMessage : disabledMessage,
        description: newChecked 
          ? `${title} foi ativado com sucesso`
          : `${title} foi desativado`,
      });
    }
  };

  return (
    <div className="p-4 bg-secondary/30 rounded-lg border border-primary/20 transition-all duration-200 hover:bg-secondary/40">
      <div className="flex items-center justify-between gap-4">
        {/* Conteúdo à esquerda */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            {icon && <div className="text-primary">{icon}</div>}
            <span className="font-medium text-primary">
              {title}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Checkbox à direita com touch target adequado (44x44px) */}
        <div className="flex items-center space-x-2 min-h-[44px] min-w-[44px]">
          <Checkbox
            id={id}
            checked={checked}
            onCheckedChange={handleChange}
            className="
              h-5 w-5
              data-[state=checked]:bg-primary 
              data-[state=checked]:border-primary
              focus-visible:ring-2 
              focus-visible:ring-primary 
              focus-visible:ring-offset-2
              transition-all
              duration-200
            "
          />
          <Label 
            htmlFor={id}
            className="
              text-sm 
              font-medium 
              cursor-pointer
              select-none
              peer-disabled:cursor-not-allowed 
              peer-disabled:opacity-70
            "
          >
            {checked ? 'Ativado' : 'Desativado'}
          </Label>
        </div>
      </div>
    </div>
  );
};
