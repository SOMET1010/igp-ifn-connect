import { Wrench, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const MaintenancePage = () => {
  // TTS message on mount
  useEffect(() => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        "On améliore l'application. Reviens dans quelques minutes."
      );
      utterance.lang = "fr-FR";
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        {/* Pictogramme */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Wrench className="w-12 h-12 text-primary" />
        </div>

        {/* Message principal */}
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Maintenance en cours
        </h1>
        <p className="text-muted-foreground mb-8">
          On améliore l'application pour toi. Reviens dans quelques minutes.
        </p>

        {/* Action */}
        <Button onClick={handleRefresh} className="w-full gap-2">
          <RefreshCw className="w-4 h-4" />
          Rafraîchir
        </Button>
      </div>
    </div>
  );
};

export default MaintenancePage;
