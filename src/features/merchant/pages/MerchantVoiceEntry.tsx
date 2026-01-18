/**
 * Page Connexion Vocale Marchand - /marchand/connexion
 * Refactorisée avec Design System Jùlaba
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ImmersiveBackground } from "@/shared/ui";
import { 
  JulabaPageLayout,
  JulabaHeader,
  JulabaCard,
  JulabaButton,
} from "@/shared/ui/julaba";
import { useLanguage } from "@/shared/contexts";
import { useSensoryFeedback } from "@/shared/hooks";
import { LANGUAGES } from "@/shared/lib";
import { cn } from "@/shared/lib";
import { InclusivePhoneAuth } from "@/features/auth/components/InclusivePhoneAuth";
import { useVoiceQueue } from "@/shared/hooks/useVoiceQueue";

const MerchantVoiceEntry: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { triggerTap } = useSensoryFeedback();
  const { speak, stop } = useVoiceQueue();

  // Détection iframe
  const isInIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();

  // Si dans iframe, tenter d'ouvrir en nouvel onglet
  useEffect(() => {
    if (isInIframe) {
      const fullUrl = window.location.href;
      const newWindow = window.open(fullUrl, '_blank');
      if (!newWindow) {
        console.log('[MerchantVoiceEntry] Popup blocked, showing banner');
      }
    }
  }, [isInIframe]);

  // Message de bienvenue au chargement
  useEffect(() => {
    if (isInIframe) return;
    
    const timer = setTimeout(() => {
      const message = language === "fr"
        ? "Bienvenue. Appuie sur le micro et dis ton numéro de téléphone."
        : "I ye téléphone numero fɔ";
      speak(message, { priority: 'high' });
    }, 600);

    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [language, speak, stop, isInIframe]);

  const handleBack = () => {
    triggerTap();
    stop();
    navigate("/");
  };

  const handleVoiceHelp = () => {
    triggerTap();
    speak("Appuie sur le gros bouton micro et dis ton numéro. Je vais t'aider.", { priority: 'high' });
  };

  const displayLanguages = LANGUAGES.slice(0, 3);

  return (
    <JulabaPageLayout background="warm" padding="none" withBottomNav={false}>
      <ImmersiveBackground variant="warm-gradient" showWaxPattern showBlobs />

      {/* Header Jùlaba */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-lg border-b border-white/20 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <JulabaButton
            variant="ghost"
            size="md"
            emoji="←"
            onClick={handleBack}
          />

          <span className="text-lg font-bold text-primary">
            🧡 PNAVIM
          </span>

          {/* Langues */}
          <div className="flex gap-1">
            {displayLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  triggerTap();
                  setLanguage(lang.code);
                }}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all",
                  language === lang.code
                    ? "bg-primary/20 scale-110 ring-2 ring-primary"
                    : "bg-white/50"
                )}
              >
                {lang.symbol}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="relative z-10 container max-w-lg mx-auto px-6 pt-24 pb-32 flex flex-col items-center">
        {/* Bandeau iframe */}
        {isInIframe && (
          <JulabaCard accent="orange" className="w-full mb-6 text-center">
            <p className="font-bold text-foreground mb-2">
              🎤 Le micro est bloqué dans l'aperçu
            </p>
            <JulabaButton
              variant="primary"
              emoji="🔗"
              onClick={() => window.open(window.location.href, '_blank')}
            >
              Ouvrir en plein écran
            </JulabaButton>
          </JulabaCard>
        )}

        {/* Titre */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-foreground leading-tight">
            🎤 Connexion Vocale
          </h1>
          <p className="text-muted-foreground mt-2">
            Dis ton numéro ou tape-le
          </p>
        </div>

        {/* Composant d'authentification inclusive */}
        <div className="w-full">
          <InclusivePhoneAuth
            redirectPath="/marchand"
            userType="merchant"
          />
        </div>

        {/* Bouton aide vocale */}
        <JulabaButton
          variant="ghost"
          emoji="❓"
          onClick={handleVoiceHelp}
          className="mt-8"
        >
          Aide vocale
        </JulabaButton>
      </main>
    </JulabaPageLayout>
  );
};

export default MerchantVoiceEntry;
