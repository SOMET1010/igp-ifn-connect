import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { useSensoryFeedback } from '@/shared/hooks';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  icon?: LucideIcon;
}

interface FilterChipsProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  options,
  value,
  onChange,
  className,
}) => {
  const { triggerLight } = useSensoryFeedback();

  const handleSelect = (optionValue: string) => {
    triggerLight();
    onChange(optionValue);
  };

  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-1 scrollbar-hide', className)}>
      {options.map((option) => {
        const isActive = value === option.value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={cn(
              // Base styles KPATA
              'px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap',
              'border-2 flex items-center gap-1.5',
              // Transitions et animations
              'transition-all duration-150',
              'hover:scale-[1.02] active:scale-95',
              // États
              isActive
                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:bg-muted/50'
            )}
          >
            {Icon && (
              <Icon className={cn(
                'w-4 h-4 shrink-0 transition-colors',
                isActive ? 'text-primary-foreground' : 'text-muted-foreground'
              )} />
            )}
            {option.label}
            {typeof option.count === 'number' && (
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full font-bold',
                isActive 
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};