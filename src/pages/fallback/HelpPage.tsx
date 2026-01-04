import { HelpCircle, Phone, MessageCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const HelpPage = () => {
  const navigate = useNavigate();

  // TTS message on mount
  useEffect(() => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(
        "Comment on peut t'aider ?"
      );
      utterance.lang = "fr-FR";
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        {/* Pictogramme */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <HelpCircle className="w-12 h-12 text-primary" />
        </div>

        {/* Message principal */}
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Besoin d'aide ?
        </h1>
        <p className="text-muted-foreground mb-8">
          Comment on peut t'aider ? Choisis une option ci-dessous.
        </p>

        {/* Options d'aide */}
        <div className="flex flex-col gap-3">
          <Button
            variant="default"
            className="w-full gap-2 justify-start"
            onClick={() => window.open("tel:+22500000000", "_self")}
          >
            <Phone className="w-5 h-5" />
            Appeler le support
          </Button>
          
          <Button
            variant="outline"
            className="w-full gap-2 justify-start"
            onClick={() => navigate("/marchand/assistant-vocal")}
          >
            <MessageCircle className="w-5 h-5" />
            Aide vocale
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate("/")}
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

export default HelpPage;
