import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface HeroHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  colorScheme?: 'primary' | 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'red';
  className?: string;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  title,
  description,
  icon: Icon,
  colorScheme = 'primary',
  className = '',
}) => {
  const schemeStyles = {
    primary: {
      blur1: 'bg-primary/10',
      blur2: 'bg-primary/5',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      textGradient: 'from-primary via-primary/80 to-primary/60'
    },
    purple: {
      blur1: 'bg-purple-500/10',
      blur2: 'bg-fuchsia-500/10',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      textGradient: 'from-purple-400 via-fuchsia-500 to-pink-500'
    },
    blue: {
      blur1: 'bg-blue-500/10',
      blur2: 'bg-cyan-500/10',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      textGradient: 'from-blue-400 via-sky-500 to-cyan-500'
    },
    green: {
      blur1: 'bg-green-500/10',
      blur2: 'bg-emerald-500/10',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
      textGradient: 'from-green-400 via-emerald-500 to-teal-500'
    },
    orange: {
      blur1: 'bg-orange-500/10',
      blur2: 'bg-amber-500/10',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
      textGradient: 'from-orange-400 via-amber-500 to-yellow-500'
    },
    pink: {
      blur1: 'bg-pink-500/10',
      blur2: 'bg-rose-500/10',
      iconBg: 'bg-pink-500/10',
      iconColor: 'text-pink-500',
      textGradient: 'from-pink-400 via-rose-500 to-red-500'
    },
    red: {
      blur1: 'bg-red-500/10',
      blur2: 'bg-rose-500/10',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500',
      textGradient: 'from-red-400 via-rose-500 to-orange-500'
    }
  };

  const currentScheme = schemeStyles[colorScheme];

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-card/30 border border-border p-8 md:p-12 text-center shadow-lg backdrop-blur-sm ${className}`}>
      {/* Efeitos de fundo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className={`absolute top-[-20%] left-[-10%] w-1/2 h-1/2 ${currentScheme.blur1} blur-[100px] rounded-full`}></div>
        <div className={`absolute bottom-[-20%] right-[-10%] w-1/2 h-1/2 ${currentScheme.blur2} blur-[100px] rounded-full`}></div>
      </div>

      <div className="space-y-4 max-w-3xl mx-auto flex flex-col items-center">
        {Icon && (
          <div className={`inline-flex items-center justify-center p-3 ${currentScheme.iconBg} rounded-full mb-2`}>
            <Icon className={`w-8 h-8 ${currentScheme.iconColor} animate-pulse`} />
          </div>
        )}
        <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${currentScheme.textGradient} pb-2`}>
          {title}
        </h1>
        {description && (
          <p className="text-lg text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
