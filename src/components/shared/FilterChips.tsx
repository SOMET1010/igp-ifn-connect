import React from 'react';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
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
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-1 scrollbar-hide', className)}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              'border flex items-center gap-1.5',
              isActive
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
            )}
          >
            {option.label}
            {typeof option.count === 'number' && (
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full',
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
