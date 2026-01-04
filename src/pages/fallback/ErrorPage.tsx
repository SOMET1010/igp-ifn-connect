import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface ErrorPageProps {
  error?: Error | null;
  resetError?: () => void;
}

const ErrorPage = ({ error, resetError }: ErrorPageProps) => {
  const navigate = useNavigate();

  // TTS message on mount
  useEffect(() => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        "Quelque chose n'a pas marché. On te ramène."
      );
      utterance.lang = "fr-FR";
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  }, []);

  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        {/* Pictogramme */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-12 h-12 text-destructive" />
        </div>

        {/* Message principal */}
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Une erreur s'est produite
        </h1>
        <p className="text-muted-foreground mb-4">
          Quelque chose n'a pas marché. On te ramène à l'accueil.
        </p>

        {/* Détails de l'erreur (mode dev) */}
        {error && import.meta.env.DEV && (
          <div className="mb-6 p-3 bg-muted rounded-lg text-left">
            <p className="text-xs font-mono text-muted-foreground break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button onClick={handleRetry} className="w-full gap-2">
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </Button>
          <Button
            variant="outline"
            onClick={handleGoHome}
            className="w-full gap-2"
          >
            <Home className="w-4 h-4" />
            Retour accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
