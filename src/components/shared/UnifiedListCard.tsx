import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge, StatusType } from './StatusBadge';

export type EntityType = 'merchant' | 'agent' | 'cooperative' | 'admin' | 'user' | 'order' | 'product';

interface UnifiedListCardProps {
  // Contenu principal
  title: string;
  subtitle?: string;
  description?: string;
  
  // Avatar / Icône
  avatar?: React.ReactNode;
  avatarFallback?: string;
  
  // Statut
  status?: StatusType;
  statusLabel?: string;
  
  // Métadonnées (icônes + texte)
  metadata?: Array<{
    icon: React.ElementType;
    text: string;
    className?: string;
  }>;
  
  // Type d'entité pour couleur d'accent
  entityType?: EntityType;
  
  // Actions
  onClick?: () => void;
  actions?: React.ReactNode;
  showChevron?: boolean;
  
  // Style
  className?: string;
  compact?: boolean;
  highlighted?: boolean;
}

const entityColors: Record<EntityType, string> = {
  merchant: 'border-l-secondary',
  agent: 'border-l-primary',
  cooperative: 'border-l-accent',
  admin: 'border-l-[hsl(270,70%,50%)]',
  user: 'border-l-muted-foreground',
  order: 'border-l-primary',
  product: 'border-l-secondary',
};

const avatarBgColors: Record<EntityType, string> = {
  merchant: 'bg-secondary/15 text-secondary',
  agent: 'bg-primary/15 text-primary',
  cooperative: 'bg-accent/15 text-accent-foreground',
  admin: 'bg-[hsl(270,70%,50%)]/15 text-[hsl(270,70%,50%)]',
  user: 'bg-muted text-muted-foreground',
  order: 'bg-primary/15 text-primary',
  product: 'bg-secondary/15 text-secondary',
};

export const UnifiedListCard: React.FC<UnifiedListCardProps> = ({
  title,
  subtitle,
  description,
  avatar,
  avatarFallback,
  status,
  statusLabel,
  metadata,
  entityType = 'user',
  onClick,
  actions,
  showChevron = true,
  className,
  compact = false,
  highlighted = false,
}) => {
  const isClickable = !!onClick;

  return (
    <Card
      className={cn(
        'overflow-hidden border-l-4 transition-all duration-200',
        entityColors[entityType],
        isClickable && 'cursor-pointer hover:shadow-md hover:border-l-primary active:scale-[0.99]',
        highlighted && 'ring-2 ring-primary/20 shadow-md',
        className
      )}
      onClick={onClick}
    >
      <CardContent className={cn('p-4', compact && 'p-3')}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          {(avatar || avatarFallback) && (
            <div
              className={cn(
                'flex-shrink-0 rounded-xl flex items-center justify-center font-bold',
                compact ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base',
                avatarBgColors[entityType]
              )}
            >
              {avatar || avatarFallback?.slice(0, 2).toUpperCase()}
            </div>
          )}

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className={cn(
                  'font-semibold text-foreground truncate',
                  compact ? 'text-sm' : 'text-base'
                )}>
                  {title}
                </h3>
                {subtitle && (
                  <p className={cn(
                    'text-muted-foreground truncate',
                    compact ? 'text-xs' : 'text-sm'
                  )}>
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Status badge */}
              {status && (
                <StatusBadge 
                  status={status} 
                  label={statusLabel}
                  size={compact ? 'sm' : 'md'}
                />
              )}
            </div>

            {/* Description */}
            {description && (
              <p className={cn(
                'text-muted-foreground mt-1 line-clamp-2',
                compact ? 'text-xs' : 'text-sm'
              )}>
                {description}
              </p>
            )}

            {/* Métadonnées */}
            {metadata && metadata.length > 0 && (
              <div className={cn(
                'flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground',
                compact ? 'mt-2 text-xs' : 'mt-3 text-sm'
              )}>
                {metadata.map((item, index) => (
                  <div key={index} className={cn('flex items-center gap-1.5', item.className)}>
                    <item.icon className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
                    <span className="truncate">{item.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {actions && (
              <div className={cn('mt-3', compact && 'mt-2')}>
                {actions}
              </div>
            )}
          </div>

          {/* Chevron */}
          {isClickable && showChevron && !actions && (
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 self-center" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
