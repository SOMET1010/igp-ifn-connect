import { cn } from "@/shared/lib";
import { XCircle, RefreshCw } from "lucide-react";
import { ButtonPrimary } from "./ButtonPrimary";
import { ButtonSecondary } from "./ButtonSecondary";

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
  retryLabel?: string;
  backLabel?: string;
  className?: string;
}

const ErrorScreen = ({
  title = "Oups, ça n'a pas marché",
  message = "Réessaie, on est là pour toi.",
  onRetry,
  onBack,
  retryLabel = "Réessayer",
  backLabel = "Retour",
  className
}: ErrorScreenProps) => {
  return (
    <div className={cn(
      "fixed inset-0 z-50 flex flex-col items-center justify-center",
      "bg-destructive text-destructive-foreground p-6",
      className
    )}>
      {/* Error icon */}
      <div className="animate-pulse mb-6">
        <XCircle className="w-24 h-24 sm:w-32 sm:h-32" strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">
        {title}
      </h1>

      {/* Message */}
      <p className="text-lg sm:text-xl opacity-90 text-center max-w-sm">
        {message}
      </p>

      {/* Actions */}
      <div className="mt-8 w-full max-w-xs space-y-3">
        {onRetry && (
          <ButtonPrimary
            onClick={onRetry}
            className="bg-white text-destructive hover:bg-white/90"
          >
            <RefreshCw className="w-6 h-6 mr-2" />
            {retryLabel}
          </ButtonPrimary>
        )}
        
        {onBack && (
          <ButtonSecondary
            onClick={onBack}
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            {backLabel}
          </ButtonSecondary>
        )}
      </div>
    </div>
  );
};

export { ErrorScreen };
