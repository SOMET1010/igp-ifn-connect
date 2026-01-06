import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface RetryIndicatorProps {
  /** Temps restant avant le prochain retry en ms */
  nextRetryIn: number | null;
  /** Délai initial total en ms (pour calculer le pourcentage) */
  initialDelay?: number;
  /** Numéro de la tentative actuelle */
  retryCount?: number;
  /** Nombre maximum de tentatives */
  maxRetries?: number;
  /** Classe CSS additionnelle */
  className?: string;
  /** Afficher l'icône de rafraîchissement animée */
  showIcon?: boolean;
}

export function RetryIndicator({
  nextRetryIn,
  initialDelay,
  retryCount = 0,
  maxRetries = 3,
  className,
  showIcon = true,
}: RetryIndicatorProps) {
  const [startDelay, setStartDelay] = useState<number | null>(null);

  // Capturer le délai initial quand nextRetryIn change
  useEffect(() => {
    if (nextRetryIn !== null && startDelay === null) {
      setStartDelay(initialDelay ?? nextRetryIn);
    } else if (nextRetryIn === null) {
      setStartDelay(null);
    }
  }, [nextRetryIn, initialDelay, startDelay]);

  if (nextRetryIn === null) {
    return null;
  }

  const totalDelay = startDelay ?? nextRetryIn;
  const progressPercent = Math.max(0, Math.min(100, (nextRetryIn / totalDelay) * 100));
  const secondsRemaining = Math.ceil(nextRetryIn / 1000);

  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-3 rounded-lg bg-muted/50 border border-border animate-fade-in',
        className
      )}
    >
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          {showIcon && (
            <RefreshCw className="h-4 w-4 animate-spin" />
          )}
          <span>
            Nouvelle tentative dans{' '}
            <span className="font-semibold text-foreground">
              {secondsRemaining}s
            </span>
          </span>
        </div>
        {maxRetries > 0 && (
          <span className="text-xs text-muted-foreground">
            Tentative {retryCount + 1}/{maxRetries}
          </span>
        )}
      </div>
      <Progress 
        value={progressPercent} 
        className="h-1.5 bg-muted"
      />
    </div>
  );
}
