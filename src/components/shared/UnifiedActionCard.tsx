import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationBadge, NotificationBadgeVariant } from './NotificationBadge';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useButtonFeedback } from '@/hooks/useButtonFeedback';

interface UnifiedActionCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'primary';
  compact?: boolean;
  badge?: number;
  badgeVariant?: NotificationBadgeVariant;
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
  const prefersReducedMotion = useReducedMotion();
  const { triggerHaptic } = useButtonFeedback();

  const handleClick = () => {
    triggerHaptic('light');
    onClick();
  };

  return (
    <motion.div
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card
        className={cn(
          'card-institutional cursor-pointer transition-shadow duration-200 hover:shadow-md',
          isPrimary && 'bg-primary/5 border-primary/20',
          className
        )}
        onClick={handleClick}
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
            {badge !== undefined && (
              <NotificationBadge
                count={badge}
                variant={badgeVariant}
                absolute
              />
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
    </motion.div>
  );
};
