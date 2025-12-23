import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedActionCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'primary';
  compact?: boolean;
  badge?: number;
  badgeVariant?: 'default' | 'warning' | 'destructive';
  className?: string;
}

export const UnifiedActionCard: React.FC<UnifiedActionCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  variant = 'default',
  compact = false,
  badge,
  badgeVariant = 'default',
  className,
}) => {
  const isPrimary = variant === 'primary';

  return (
    <Card
      className={cn(
        'card-institutional cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98]',
        isPrimary && 'bg-primary/5 border-primary/20',
        className
      )}
      onClick={onClick}
    >
      <CardContent className={cn('flex items-center gap-3', compact ? 'p-3' : 'p-4')}>
        <div className="relative">
          <div
            className={cn(
              'rounded-xl flex items-center justify-center shrink-0',
              compact ? 'w-10 h-10' : 'w-12 h-12',
              isPrimary ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}
          >
            <Icon className={cn(compact ? 'h-5 w-5' : 'h-6 w-6')} />
          </div>
          {badge !== undefined && badge > 0 && (
            <span
              className={cn(
                'absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-xs font-bold px-1',
                badgeVariant === 'destructive' && 'bg-destructive text-destructive-foreground animate-pulse shadow-glow-destructive',
                badgeVariant === 'warning' && 'bg-orange-500 text-white animate-bounce-gentle shadow-glow-warning',
                badgeVariant === 'default' && 'bg-primary text-primary-foreground'
              )}
            >
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('font-medium text-foreground truncate', compact && 'text-sm')}>{title}</p>
          {description && (
            <p className={cn('text-muted-foreground truncate', compact ? 'text-xs' : 'text-sm')}>{description}</p>
          )}
        </div>
        {!compact && <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />}
      </CardContent>
    </Card>
  );
};
