import React from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isNetworkError?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Erreur de chargement",
  message = "Impossible de charger les données. Veuillez réessayer.",
  onRetry,
  isNetworkError = false,
  className
}: ErrorStateProps) {
  const Icon = isNetworkError ? WifiOff : AlertCircle;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center space-y-4",
      className
    )}>
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
        <Icon className="w-8 h-8 text-destructive" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      </div>

      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Réessayer
        </Button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  message,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center space-y-4",
      className
    )}>
      {icon && (
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-3xl">
          {icon}
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {message && (
          <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
        )}
      </div>

      {action}
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
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
