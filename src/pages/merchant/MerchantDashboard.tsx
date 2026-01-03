import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Mic } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMerchantDashboardData } from "@/hooks/useMerchantDashboardData";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useFirstSaleCelebration } from "@/hooks/useFirstSaleCelebration";
import { useSensoryFeedback } from "@/hooks/useSensoryFeedback";
import { useDailySession } from "@/features/merchant/hooks/useDailySession";
import { useMascotImage } from "@/hooks/useMascotImage";
import { useMarketBackground } from "@/hooks/useMarketBackground";
import { Button } from "@/components/ui/button";
import { merchantNavItems } from "@/config/navigation";
import { EnhancedHeader } from "@/components/shared/EnhancedHeader";
import { UnifiedBottomNav } from "@/components/shared/UnifiedBottomNav";
import { MerchantDashboardSkeleton } from "@/components/merchant/MerchantDashboardSkeleton";
import { ErrorState } from "@/components/shared/StateComponents";
import { Confetti } from "@/components/shared/Confetti";
import { OnlineStatusIndicator } from "@/components/merchant/dashboard";

// Nouveaux composants Afro-Futuristes
import { ImmersiveBackground } from "@/components/shared/ImmersiveBackground";
import { TantieMascot } from "@/components/shared/TantieMascot";
import { GlassCard } from "@/components/shared/GlassCard";
import { HeroActionCard } from "@/components/shared/HeroActionCard";
import { DashboardStatCard } from "@/components/merchant/dashboard/DashboardStatCard";
import { VoiceHeroButton } from "@/components/shared/VoiceHeroButton";

import {
  OpenDayDialog,
  CloseDayDialog,
  DaySessionBanner,
} from "@/features/merchant/components/daily-session";
import { 
  getDashboardScript, 
  formatAmountForSpeech 
} from "@/features/voice-auth/config/dashboardScripts";

// Formater le montant
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR").format(amount);
};

export default function MerchantDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const { isOnline } = useOnlineStatus();
  const { triggerTap, triggerMoney } = useSensoryFeedback();
  const hasPlayedWelcome = useRef(false);

  const [openDayDialogOpen, setOpenDayDialogOpen] = useState(false);
  const [closeDayDialogOpen, setCloseDayDialogOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "playing">("idle");

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/marchand/login');
  };

  const handleEncaisser = () => {
    triggerMoney();
    navigate("/marchand/encaisser");
  };

  const handleHistorique = () => {
    triggerTap();
    navigate("/marchand/historique");
  };

  const handleVoiceCommand = () => {
    setVoiceState(voiceState === "idle" ? "listening" : "idle");
    // Intégration TTS ici
  };

  // Message de bienvenue personnalisé pour Tantie
  const welcomeMessage = sessionStatus === "none"
    ? "Bonjour {nom} ! N'oublie pas d'ouvrir ta journée 🌅"
    : "Bonjour {nom} ! Prêt pour les affaires aujourd'hui ? 💪";

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
      {/* Fond immersif Afro-Futuriste avec image de marché */}
      <ImmersiveBackground 
        variant="market-blur" 
        backgroundImageUrl={marketBgUrl}
        showWaxPattern 
        showBlobs 
      />

      {showConfetti && <Confetti duration={3000} particleCount={60} />}

      {/* Header avec fond transparent pour voir le gradient */}
      <EnhancedHeader
        title={merchant?.full_name || t("merchant")}
        subtitle="Espace Marchand"
        showSignOut
        onSignOut={handleSignOut}
        variant="default"
      />

      <main className="px-4 py-4 space-y-5 max-w-2xl mx-auto">
        {isLoading ? (
          <MerchantDashboardSkeleton />
        ) : (
          <>
            {/* 1. MASCOTTE TANTIE SAGESSE */}
            <TantieMascot
              message={welcomeMessage}
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

            {/* 3. STATISTIQUES EN CARTES GLASS */}
            <div className="grid grid-cols-3 gap-3">
              <DashboardStatCard
                label="Ventes"
                value={formatCurrency(todayTotal)}
                emoji="📊"
                borderColor="orange"
              />
              <DashboardStatCard
                label="Solde"
                value={formatCurrency(0)}
                emoji="🏦"
                borderColor="green"
              />
              <DashboardStatCard
                label="Alertes"
                value="0"
                emoji="🔔"
                borderColor="gold"
              />
            </div>

            {/* 4. CARTES ACTION HÉROS - VENDRE & HISTORIQUE */}
            <div className="space-y-4">
              <HeroActionCard
                title="VENDRE"
                subtitle="Encaisser une vente"
                emoji="🛒"
                variant="orange"
                onClick={handleEncaisser}
                disabled={!isSessionOpen}
              />
              
              <HeroActionCard
                title="HISTORIQUE"
                subtitle="Voir mes ventes"
                emoji="📜"
                variant="violet"
                onClick={handleHistorique}
              />
            </div>

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

      {/* Bottom Navigation */}
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
