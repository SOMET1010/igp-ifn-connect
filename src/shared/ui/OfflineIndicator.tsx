import { useOfflineSync } from '@/shared/hooks';
import { WifiOff, RefreshCw, CheckCircle, CloudOff } from 'lucide-react';
import { cn } from '@/shared/lib';

export function OfflineIndicator() {
  const { isOnline, pendingCount, isSyncing, syncWithServer } = useOfflineSync();

  // Don't show anything if online and no pending items
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-auto">
      <div
        className={cn(
          "rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 transition-all",
          !isOnline 
            ? "bg-destructive text-destructive-foreground" 
            : isSyncing 
              ? "bg-primary text-primary-foreground" 
              : "bg-amber-500 text-white"
        )}
      >
        {!isOnline ? (
          <>
            <WifiOff className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Mode hors-ligne</p>
              {pendingCount > 0 && (
                <p className="text-xs opacity-90">
                  {pendingCount} élément(s) en attente
                </p>
              )}
            </div>
            <CloudOff className="h-5 w-5 flex-shrink-0 opacity-75" />
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="h-5 w-5 flex-shrink-0 animate-spin" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Synchronisation...</p>
              <p className="text-xs opacity-90">
                {pendingCount} élément(s) restant(s)
              </p>
            </div>
          </>
        ) : pendingCount > 0 ? (
          <>
            <CloudOff className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">
                {pendingCount} élément(s) non synchronisé(s)
              </p>
            </div>
            <button
              onClick={() => syncWithServer()}
              className="px-3 py-1 bg-white/20 rounded-md text-xs font-medium hover:bg-white/30 transition-colors"
            >
              Synchroniser
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
