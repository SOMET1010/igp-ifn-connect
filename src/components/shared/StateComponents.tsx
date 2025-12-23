import React, { forwardRef } from 'react';
import { AlertCircle, RefreshCw, WifiOff, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isNetworkError?: boolean;
  className?: string;
}

export const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(({
  title = "Erreur de chargement",
  message = "Impossible de charger les données. Veuillez réessayer.",
  onRetry,
  isNetworkError = false,
  className
}, ref) => {
  const IconComponent = isNetworkError ? WifiOff : AlertCircle;

  return (
    <div 
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center space-y-4",
        className
      )}
    >
      <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
        <IconComponent className="h-6 w-6 text-destructive" />
      </div>
      
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
      </div>

      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Réessayer
        </Button>
      )}
    </div>
  );
});

ErrorState.displayName = 'ErrorState';

interface EmptyStateProps {
  Icon?: LucideIcon;
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'card';
}

export function EmptyState({
  Icon,
  icon,
  title,
  message,
  actionLabel,
  onAction,
  action,
  className,
  variant = 'default'
}: EmptyStateProps) {
  const content = (
    <>
      {Icon && (
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      {!Icon && icon && (
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-2xl">
          {icon}
        </div>
      )}
      
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {message && (
          <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
        )}
      </div>

      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionLabel}
        </Button>
      )}
      {action}
    </>
  );

  if (variant === 'card') {
    return (
      <Card className={cn(
        "flex flex-col items-center justify-center p-8 text-center space-y-4 card-institutional",
        className
      )}>
        {content}
      </Card>
    );
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center space-y-4",
      className
    )}>
      {content}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Chargement...",
  className
}: LoadingStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 space-y-4",
      className
    )}>
      <div className="w-10 h-10 border-3 border-muted border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
