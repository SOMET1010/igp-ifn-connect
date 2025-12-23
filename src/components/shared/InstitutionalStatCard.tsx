import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardVariant = 'default' | 'warning' | 'success';

interface InstitutionalStatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  subtitle?: string;
  onClick?: () => void;
  variant?: StatCardVariant;
}

const variantStyles: Record<StatCardVariant, string> = {
  default: '',
  warning: 'border-amber-500/50 bg-amber-500/5',
  success: 'border-green-500/50 bg-green-500/5'
};

const subtitleVariantStyles: Record<StatCardVariant, string> = {
  default: 'text-muted-foreground',
  warning: 'text-amber-600 dark:text-amber-400 font-medium',
  success: 'text-green-600 dark:text-green-400 font-medium'
};

export const InstitutionalStatCard: React.FC<InstitutionalStatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  onClick,
  variant = 'default'
}) => {
  return (
    <Card 
      className={cn(
        'card-institutional transition-colors',
        onClick && 'cursor-pointer hover:border-primary/50',
        variantStyles[variant]
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
        <p className="text-2xl font-bold text-foreground mt-2">
          {value}
        </p>
        {subtitle && (
          <p className={cn('text-xs mt-1', subtitleVariantStyles[variant])}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
