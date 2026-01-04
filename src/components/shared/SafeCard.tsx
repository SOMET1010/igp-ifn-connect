import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface SafeCardProps {
  title: string;
  value: unknown;
  fallbackValue?: string;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  icon?: ReactNode;
  className?: string;
}

/**
 * SafeCard - Affiche une valeur avec gestion des états null/undefined/loading/error
 * Jamais d'écran blanc, toujours un fallback humain.
 */
export function SafeCard({
  title,
  value,
  fallbackValue = "Non renseigné",
  isLoading = false,
  error = null,
  onRetry,
  icon,
  className = "",
}: SafeCardProps) {
  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={`border-destructive/50 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive mb-2">Erreur de chargement</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="w-3 h-3 mr-1" />
              Réessayer
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Compute display value
  const displayValue =
    value === null || value === undefined || value === ""
      ? fallbackValue
      : String(value);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-foreground">{displayValue}</p>
      </CardContent>
    </Card>
  );
}

export default SafeCard;
