import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/shared/contexts";
import { useLanguage } from "@/shared/contexts";
import { useMerchantDashboardData } from "@/features/merchant/hooks/useMerchantDashboardData";
import { useOnlineStatus, useSensoryFeedback, useMascotImage } from "@/shared/hooks";
import { useFirstSaleCelebration } from "@/features/sales";
import { useDailySession } from "@/features/merchant/hooks/useDailySession";
import { Confetti } from "@/shared/ui";
import { MerchantDashboardSkeleton } from "@/features/merchant/components/MerchantDashboardSkeleton";
import { MERCHANT_NAV_ITEMS } from "@/config/navigation-julaba";

// Jùlaba Design System
import {
  JulabaPageLayout,
  JulabaHeader,
  JulabaBottomNav,
  JulabaButton,
  JulabaCard,
  JulabaStatCard,
  JulabaTantie,
  JulabaVoiceButton,
  JulabaEmptyState,
} from "@/shared/ui/julaba";

// Onboarding
import { OnboardingFlow, useOnboarding } from "@/features/onboarding";

import {
  OpenDayDialog,
  CloseDayDialog,
} from "@/features/merchant/components/daily-session";

// Formater le montant
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR").format(amount);
};

/**
 * MerchantDashboard - Écran "Aujourd'hui" style Jùlaba
 * 
 * Design UX inclusive :
 * - 1 action principale visible (VENDRE)
 * - Pictogrammes > Texte
 * - Boutons géants 56px+
 * - Feedback sensoriel
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
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "processing">("idle");
  const [showBalance, setShowBalance] = useState(false);

  // Onboarding state
  const { needsOnboarding, isLoading: onboardingLoading, completeOnboarding } = useOnboarding();

  const { data, isLoading, error, refetch } = useMerchantDashboardData();
  const { showConfetti } = useFirstSaleCelebration(data?.todayTotal || 0);
  const { imageUrl: mascotImageUrl } = useMascotImage();
  
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
      <JulabaPageLayout>
        <JulabaHeader
          title={t("merchant")}
          showBack={false}
        />
        <main className="p-4">
          <JulabaEmptyState
            emoji="😕"
            title="Oups, problème !"
            description={error instanceof Error ? error.message : "Erreur de chargement"}
            action={{
              label: "Réessayer",
              emoji: "🔄",
              onClick: () => refetch(),
            }}
          />
        </main>
        <JulabaBottomNav items={MERCHANT_NAV_ITEMS} />
      </JulabaPageLayout>
    );
  }

  return (
    <JulabaPageLayout background="gradient">
      {showConfetti && <Confetti duration={3000} particleCount={60} />}

      {/* Header simplifié Jùlaba */}
      <JulabaHeader
        title={merchant?.full_name?.split(" ")[0] || t("merchant")}
        subtitle="Aujourd'hui"
        showBack={false}
        rightAction={{
          emoji: "🚪",
          onClick: handleSignOut,
          label: "Quitter",
        }}
      />

      <main className="px-4 py-4 space-y-5">
        {isLoading ? (
          <MerchantDashboardSkeleton />
        ) : (
          <>
            {/* 1. MASCOTTE TANTIE - Message contextuel */}
            <JulabaTantie
              message={getWelcomeMessage()}
              merchantName={merchant?.full_name?.split(" ")[0]}
              imageUrl={mascotImageUrl}
              variant="large"
              className="mb-2"
            />

            {/* 2. CARTE SESSION - État de la journée */}
            <JulabaCard accent="gold" className="p-4">
              {sessionStatus === "none" ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🌅</span>
                    <div>
                      <p className="font-bold text-foreground">Ouvre ta journée</p>
                      <p className="text-sm text-muted-foreground">Pour commencer à vendre</p>
                    </div>
                  </div>
                  <JulabaButton
                    variant="primary"
                    size="md"
                    onClick={() => setOpenDayDialogOpen(true)}
                  >
                    Ouvrir
                  </JulabaButton>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">✅</span>
                    <div>
                      <p className="font-bold text-foreground">Journée ouverte</p>
                      <p className="text-sm text-muted-foreground">
                        {todaySession?.opening_cash ? `Caisse: ${formatCurrency(todaySession.opening_cash)} FCFA` : "En cours..."}
                      </p>
                    </div>
                  </div>
                  <JulabaButton
                    variant="outline"
                    size="sm"
                    onClick={() => setCloseDayDialogOpen(true)}
                  >
                    Fermer
                  </JulabaButton>
                </div>
              )}
            </JulabaCard>

            {/* 3. BOUTON GÉANT VENDRE - Action principale */}
            <JulabaButton
              variant="hero"
              size="hero"
              emoji="🛒"
              onClick={handleVendre}
              disabled={!isSessionOpen}
              subtitle="Encaisser une vente"
            >
              VENDRE
            </JulabaButton>

            {/* 4. STATS DU JOUR */}
            <div className="grid grid-cols-2 gap-3">
              <JulabaStatCard
                emoji="💰"
                value={showBalance ? formatCurrency(todayTotal) : "••••••"}
                suffix="FCFA"
                label="Gagné aujourd'hui"
                iconBg="green"
                onClick={() => setShowBalance(!showBalance)}
              />
              <JulabaStatCard
                emoji="🧾"
                value={todayTransactions}
                label={todayTransactions > 1 ? "Ventes" : "Vente"}
                iconBg="orange"
                onClick={handleMesVentes}
              />
            </div>

            {/* 5. BOUTON COMMANDES VOCALES */}
            <div className="flex justify-center pt-4">
              <JulabaVoiceButton
                state={voiceState}
                onClick={handleVoiceCommand}
                label="Parle-moi"
              />
            </div>

            {/* 6. Indicateur de connexion */}
            {!isOnline && (
              <JulabaCard accent="orange" className="flex items-center gap-3 p-3">
                <span className="text-xl">📡</span>
                <p className="text-sm font-medium text-[hsl(27_100%_45%)]">
                  Pas de connexion - Mode hors-ligne
                </p>
              </JulabaCard>
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation Jùlaba */}
      <JulabaBottomNav items={MERCHANT_NAV_ITEMS} />

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
    </JulabaPageLayout>
  );
}
