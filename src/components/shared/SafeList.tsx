import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface SafeListProps<T> {
  items: T[] | null | undefined;
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  skeletonCount?: number;
  className?: string;
}

/**
 * SafeList - Affiche une liste avec gestion des états null/undefined/empty/loading/error
 * Jamais d'écran blanc, toujours un fallback humain.
 */
export function SafeList<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = "Aucun élément pour l'instant",
  emptyIcon,
  isLoading = false,
  error = null,
  onRetry,
  skeletonCount = 3,
  className = "",
}: SafeListProps<T>) {
  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-muted-foreground text-center mb-4">
          Erreur de chargement
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="w-3 h-3 mr-2" />
            Réessayer
          </Button>
        )}
      </div>
    );
  }

  // Empty state
  if (!items || items.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          {emptyIcon || <Inbox className="w-8 h-8 text-muted-foreground" />}
        </div>
        <p className="text-muted-foreground text-center">{emptyMessage}</p>
      </div>
    );
  }

  // Normal state
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => (
        <div key={keyExtractor ? keyExtractor(item, index) : index}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

export default SafeList;
