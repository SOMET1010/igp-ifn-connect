/**
 * OfflineBadge - Badge indicateur hors ligne
 */

import { WifiOff, Wifi, CloudOff, RefreshCw } from 'lucide-react';
import { cn } from '@/shared/lib';

interface OfflineBadgeProps {
  isOffline: boolean;
  pendingCount?: number;
  isSyncing?: boolean;
  className?: string;
}

export function OfflineBadge({ 
  isOffline, 
  pendingCount = 0, 
  isSyncing = false,
  className 
}: OfflineBadgeProps) {
  if (!isOffline && pendingCount === 0 && !isSyncing) {
    return null;
  }
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
      isOffline 
        ? "bg-muted text-muted-foreground" 
        : isSyncing 
          ? "bg-primary/10 text-primary"
          : "bg-amber-100 text-amber-800",
      className
    )}>
      {isSyncing ? (
        <>
          <RefreshCw size={12} className="animate-spin" />
          <span>Synchronisation...</span>
        </>
      ) : isOffline ? (
        <>
          <WifiOff size={12} />
          <span>Hors ligne</span>
          {pendingCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-background rounded-full">
              {pendingCount}
            </span>
          )}
        </>
      ) : pendingCount > 0 ? (
        <>
          <CloudOff size={12} />
          <span>{pendingCount} en attente</span>
        </>
      ) : (
        <>
          <Wifi size={12} />
          <span>En ligne</span>
        </>
      )}
    </div>
  );
}
