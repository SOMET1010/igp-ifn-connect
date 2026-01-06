import React from 'react';
import { cn } from '@/shared/lib';
import { LucideIcon } from 'lucide-react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  count?: number;
  countLabel?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  children?: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: 'bg-gradient-to-br from-muted/50 to-background',
  primary: 'bg-gradient-to-br from-primary/10 via-primary/5 to-background',
  secondary: 'bg-gradient-to-br from-secondary/10 via-secondary/5 to-background',
  accent: 'bg-gradient-to-br from-accent/20 via-accent/10 to-background',
};

const iconBgStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/15 text-primary',
  secondary: 'bg-secondary/15 text-secondary',
  accent: 'bg-accent/20 text-accent-foreground',
};

export const PageHero: React.FC<PageHeroProps> = ({
  title,
  subtitle,
  count,
  countLabel = 'élément(s)',
  icon: Icon,
  variant = 'default',
  children,
  className,
}) => {
  return (
    <div className={cn(
      'px-4 py-5 border-b border-border',
      variantStyles[variant],
      className
    )}>
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center',
              iconBgStyles[variant]
            )}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>

          {typeof count === 'number' && (
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-bold text-foreground">{count}</div>
              <div className="text-xs text-muted-foreground">{countLabel}</div>
            </div>
          )}
        </div>

        {/* Filtres ou actions supplémentaires */}
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
