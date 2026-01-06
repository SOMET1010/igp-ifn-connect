import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2 } from "lucide-react";
import { ImmersiveBackground } from "@/components/shared/ImmersiveBackground";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSensoryFeedback } from "@/hooks/useSensoryFeedback";
import { LANGUAGES } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { InclusivePhoneAuth } from "@/features/auth/components/InclusivePhoneAuth";
import { useVoiceQueue } from "@/shared/hooks/useVoiceQueue";

/**
 * MerchantVoiceEntry - Page d'authentification vocale marchande
 * 
 * Utilise InclusivePhoneAuth qui gère :
 * - 🎤 Transcription vocale ElevenLabs (numéro dicté)
 * - 📱 Clavier numérique tactile (fallback)
 * - 📩 WebOTP API pour auto-remplissage SMS
 * - 🔐 Trust Score invisible (Risk Gate)
 */
const MerchantVoiceEntry: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { triggerTap } = useSensoryFeedback();
  const { speak, stop } = useVoiceQueue();

  // Détection iframe
  const isInIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();

  // Si dans iframe, tenter d'ouvrir en nouvel onglet automatiquement
  useEffect(() => {
    if (isInIframe) {
      const fullUrl = window.location.href;
      // Tenter d'ouvrir en nouvel onglet (sera bloqué si popup bloqué)
      const newWindow = window.open(fullUrl, '_blank');
      if (!newWindow) {
        console.log('[MerchantVoiceEntry] Popup blocked, showing banner');
      }
    }
  }, [isInIframe]);

  // Message de bienvenue au chargement (seulement hors iframe)
  useEffect(() => {
    if (isInIframe) return; // Ne pas parler dans l'iframe
    
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

  // Langues affichées
  const displayLanguages = LANGUAGES.slice(0, 3);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ImmersiveBackground variant="warm-gradient" showWaxPattern showBlobs />

      {/* Header simple */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-lg border-b border-white/20 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {/* Bouton retour */}
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-sm"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5 text-charbon" />
          </button>

          {/* Titre */}
          <span className="text-sm font-nunito font-bold text-orange-sanguine">
            PNAVIM
          </span>

          {/* Langue */}
          <div className="flex gap-1">
            {displayLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  triggerTap();
                  setLanguage(lang.code);
                }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-base transition-all",
                  language === lang.code
                    ? "bg-orange-sanguine/20 scale-110"
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
        {/* Bandeau iframe bloquant */}
        {isInIframe && (
          <div className="w-full mb-6 p-4 bg-orange-sanguine/20 border border-orange-sanguine/40 rounded-2xl text-center">
            <p className="text-charbon font-semibold text-sm mb-2">
              🎤 Le micro est bloqué dans l'aperçu
            </p>
            <button
              onClick={() => window.open(window.location.href, '_blank')}
              className="px-4 py-2 bg-orange-sanguine text-white rounded-full font-bold text-sm"
            >
              Ouvrir en plein écran
            </button>
          </div>
        )}

        {/* Titre */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-nunito font-extrabold text-charbon leading-tight">
            Connexion Vocale
          </h1>
          <p className="text-charbon/60 mt-2 text-sm">
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

        {/* Bouton audio aide */}
        <button
          onClick={handleVoiceHelp}
          className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 text-charbon/70 border border-white/40"
        >
          <Volume2 className="w-5 h-5" />
          <span className="text-sm font-medium">Aide vocale</span>
        </button>
      </main>
    </div>
  );
};

export default MerchantVoiceEntry;
