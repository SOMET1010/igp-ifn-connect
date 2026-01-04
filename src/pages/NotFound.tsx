import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapPinOff, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // TTS message on mount
  useEffect(() => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        "Ce chemin n'existe pas, on te ramène à l'accueil."
      );
      utterance.lang = "fr-FR";
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  }, []);

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown <= 0) {
      navigate("/", { replace: true });
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        {/* Pictogramme */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <MapPinOff className="w-12 h-12 text-muted-foreground" />
        </div>

        {/* Code 404 */}
        <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>

        {/* Message principal */}
        <p className="text-xl text-muted-foreground mb-2">Page introuvable</p>
        <p className="text-muted-foreground mb-6">
          Ce chemin n'existe pas, on te ramène à l'accueil.
        </p>

        {/* Countdown */}
        <p className="text-sm text-muted-foreground mb-6">
          Redirection automatique dans{" "}
          <span className="font-bold text-primary">{countdown}</span> secondes
        </p>

        {/* Action */}
        <Button onClick={handleGoHome} className="w-full gap-2">
          <Home className="w-4 h-4" />
          Retour accueil
        </Button>

        {/* Route tentée (mode dev) */}
        {import.meta.env.DEV && (
          <p className="mt-6 text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
            Route: {location.pathname}
          </p>
        )}
      </div>
    </div>
  );
};

export default NotFound;
