import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMerchantDashboardData } from "@/hooks/useMerchantDashboardData";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useFirstSaleCelebration } from "@/hooks/useFirstSaleCelebration";
import { useSensoryFeedback } from "@/hooks/useSensoryFeedback";
import { useDailySession } from "@/features/merchant/hooks/useDailySession";
import { useMascotImage } from "@/hooks/useMascotImage";
import { useMarketBackground } from "@/hooks/useMarketBackground";
import { merchantNavItems } from "@/config/navigation";
import { EnhancedHeader } from "@/components/shared/EnhancedHeader";
import { UnifiedBottomNav } from "@/components/shared/UnifiedBottomNav";
import { MerchantDashboardSkeleton } from "@/components/merchant/MerchantDashboardSkeleton";
import { ErrorState } from "@/components/shared/StateComponents";
import { Confetti } from "@/components/shared/Confetti";
import { OnlineStatusIndicator } from "@/components/merchant/dashboard";

// Composants Afro-Futuristes
import { ImmersiveBackground } from "@/components/shared/ImmersiveBackground";
import { TantieMascot } from "@/components/shared/TantieMascot";
import { GlassCard } from "@/components/shared/GlassCard";
import { GiantActionButton } from "@/components/shared/GiantActionButton";
import { VoiceHeroButton } from "@/components/shared/VoiceHeroButton";

// Onboarding
import { OnboardingFlow, useOnboarding } from "@/features/onboarding";

import {
  OpenDayDialog,
  CloseDayDialog,
  DaySessionBanner,
} from "@/features/merchant/components/daily-session";

// Formater le montant
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR").format(amount);
};

/**
 * MerchantDashboard - Écran "Aujourd'hui" simplifié
 * 
 * Design UX inclusive :
 * - 1 action principale visible (VENDRE)
 * - 1 action secondaire maximum (Mes ventes)
 * - Pas de stats complexes au premier écran
 * - Voix automatique au chargement
 */
export default function MerchantDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const { isOnline } = useOnlineStatus();
  const { triggerMoney } = useSensoryFeedback();
  const hasPlayedWelcome = useRef(false);

  const [openDayDialogOpen, setOpenDayDialogOpen] = useState(false);
  const [closeDayDialogOpen, setCloseDayDialogOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "playing">("idle");
  const [showBalance, setShowBalance] = useState(false);

  // Onboarding state
  const { needsOnboarding, isLoading: onboardingLoading, completeOnboarding } = useOnboarding();

  const { data, isLoading, error, refetch } = useMerchantDashboardData();
  const { showConfetti } = useFirstSaleCelebration(data?.todayTotal || 0);
  const { imageUrl: mascotImageUrl } = useMascotImage();
  const { imageUrl: marketBgUrl } = useMarketBackground();
  
  const {
    todaySession,
    sessionStatus,
    isSessionOpen,
    openSession,
    closeSession,
    isOpening,
    isClosing,
    getSummary,
  } = useDailySession();

  const merchant = data?.merchant;
  const todayTotal = data?.todayTotal || 0;
  const todayTransactions = data?.todayTransactions || 0;

  const handleSignOut = async () => {
    await signOut();
    navigate('/marchand/connexion');
  };

  const handleVendre = () => {
    triggerMoney();
    navigate("/marchand/vendre");
  };

  const handleMesVentes = () => {
    navigate("/marchand/argent?tab=historique");
  };

  const handleVoiceCommand = () => {
    setVoiceState(voiceState === "idle" ? "listening" : "idle");
  };

  // Message de bienvenue personnalisé pour Tantie
  const getWelcomeMessage = () => {
    if (sessionStatus === "none") {
      return "Bonjour {nom} ! Ouvre ta journée pour commencer à vendre 🌅";
    }
    if (todayTransactions > 0) {
      return `Super {nom} ! Tu as fait ${todayTransactions} vente${todayTransactions > 1 ? 's' : ''} aujourd'hui 💪`;
    }
    return "Bonjour {nom} ! Prêt·e pour les affaires ? 💪";
  };

  // Show onboarding for new users
  if (!onboardingLoading && needsOnboarding) {
    return (
      <OnboardingFlow 
        merchantName={merchant?.full_name?.split(" ")[0]}
        onComplete={completeOnboarding}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative">
        <ImmersiveBackground />
        <EnhancedHeader
          title={t("merchant")}
          subtitle="Espace Marchand"
          showSignOut
          onSignOut={handleSignOut}
        />
        <main className="p-4">
          <ErrorState
            message={error instanceof Error ? error.message : "Erreur de chargement"}
            onRetry={() => refetch()}
            isNetworkError={!isOnline}
          />
        </main>
        <UnifiedBottomNav items={merchantNavItems} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-24">
      {/* Fond immersif Afro-Futuriste */}
      <ImmersiveBackground 
        variant="market-blur" 
        backgroundImageUrl={marketBgUrl}
        showWaxPattern 
        showBlobs 
      />

      {showConfetti && <Confetti duration={3000} particleCount={60} />}

      {/* Header simplifié */}
      <EnhancedHeader
        title={merchant?.full_name || t("merchant")}
        subtitle="Aujourd'hui"
        showSignOut
        onSignOut={handleSignOut}
        variant="default"
      />

      <main className="px-4 py-4 space-y-5 max-w-lg mx-auto">
        {isLoading ? (
          <MerchantDashboardSkeleton />
        ) : (
          <>
            {/* 1. MASCOTTE TANTIE - Message contextuel */}
            <TantieMascot
              message={getWelcomeMessage()}
              merchantName={merchant?.full_name?.split(" ")[0]}
              imageUrl={mascotImageUrl}
              variant="large"
              className="mb-2"
            />

            {/* 2. CARTE SESSION - État de la journée */}
            <GlassCard borderColor="gold" padding="sm">
              <DaySessionBanner
                sessionStatus={sessionStatus}
                session={todaySession}
                onOpenDay={() => setOpenDayDialogOpen(true)}
                onCloseDay={() => setCloseDayDialogOpen(true)}
                inclusive
              />
            </GlassCard>

            {/* 3. BOUTON GÉANT VENDRE - Action principale */}
            <GiantActionButton
              emoji="🛒"
              title="VENDRE"
              subtitle="Encaisser une vente"
              variant="orange"
              onClick={handleVendre}
              disabled={!isSessionOpen}
            />

            {/* 4. BOUTON SECONDAIRE - Mes ventes du jour */}
            <GlassCard 
              onClick={handleMesVentes}
              className="flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">📜</span>
                <div>
                  <p className="font-semibold text-foreground">Mes ventes du jour</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{todayTransactions} vente{todayTransactions !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowBalance(!showBalance);
                      }}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {showBalance ? (
                        <>
                          <span>{formatCurrency(todayTotal)} FCFA</span>
                          <EyeOff className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>••••••</span>
                          <Eye className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </GlassCard>

            {/* 5. BOUTON COMMANDES VOCALES */}
            <div className="flex justify-center pt-2">
              <VoiceHeroButton
                state={voiceState}
                onClick={handleVoiceCommand}
                label="Commandes vocales"
                size="lg"
              />
            </div>

            {/* 6. Indicateur de connexion */}
            <OnlineStatusIndicator isOnline={isOnline} />
          </>
        )}
      </main>

      {/* Bottom Navigation - 3 items */}
      <UnifiedBottomNav items={merchantNavItems} />

      {/* Dialogs */}
      <OpenDayDialog
        open={openDayDialogOpen}
        onOpenChange={setOpenDayDialogOpen}
        onConfirm={(data) => {
          openSession(data);
          setOpenDayDialogOpen(false);
        }}
        isLoading={isOpening}
      />

      <CloseDayDialog
        open={closeDayDialogOpen}
        onOpenChange={setCloseDayDialogOpen}
        onConfirm={(data) => {
          closeSession(data);
          setCloseDayDialogOpen(false);
        }}
        getSummary={getSummary}
        isLoading={isClosing}
      />
    </div>
  );
}
