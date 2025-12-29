import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Banknote, Mic } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMerchantDashboardData } from "@/hooks/useMerchantDashboardData";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useFirstSaleCelebration } from "@/hooks/useFirstSaleCelebration";
import { useSensoryFeedback } from "@/hooks/useSensoryFeedback";
import { useDailySession } from "@/features/merchant/hooks/useDailySession";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/templates";
import { merchantNavItems } from "@/config/navigation";
import { AudioButton } from "@/components/shared/AudioButton";
import { UnifiedBigNumber } from "@/components/shared/UnifiedBigNumber";
import { MerchantDashboardSkeleton } from "@/components/merchant/MerchantDashboardSkeleton";
import { ErrorState } from "@/components/shared/StateComponents";
import { Confetti } from "@/components/shared/Confetti";
import { OnlineStatusIndicator } from "@/components/merchant/dashboard";
import { InclusiveToolsGrid } from "@/components/merchant/dashboard/InclusiveToolsGrid";
import {
  OpenDayDialog,
  CloseDayDialog,
  DaySessionBanner,
} from "@/features/merchant/components/daily-session";
import { 
  getDashboardScript, 
  formatAmountForSpeech 
} from "@/features/voice-auth/config/dashboardScripts";

export default function MerchantDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const { isOnline } = useOnlineStatus();
  const { triggerTap, triggerMoney } = useSensoryFeedback();
  const hasPlayedWelcome = useRef(false);

  const [openDayDialogOpen, setOpenDayDialogOpen] = useState(false);
  const [closeDayDialogOpen, setCloseDayDialogOpen] = useState(false);

  const { data, isLoading, error, refetch } = useMerchantDashboardData();
  const { showConfetti } = useFirstSaleCelebration(data?.todayTotal || 0);
  
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

  // Script audio contextuel pour le bouton flottant
  const getAssistantAudioText = (): string => {
    if (sessionStatus === "none") {
      return getDashboardScript("day_closed");
    }
    return getDashboardScript("assistant_prompt");
  };

  // Script audio pour le montant
  const getAmountAudioText = (): string => {
    return getDashboardScript("today_amount", { 
      amount: formatAmountForSpeech(todayTotal) 
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/marchand/login');
  };

  const handleEncaisser = () => {
    triggerMoney();
    navigate("/marchand/encaisser");
  };

  const handleAmountTap = () => {
    // L'audio sera joué via le composant AudioButton ou TTS externe
    console.log("Amount tapped, audio text:", getAmountAudioText());
  };

  if (error) {
    return (
      <PageLayout
        title={t("merchant")}
        subtitle="Espace Marchand"
        showSignOut
        onSignOut={handleSignOut}
        navItems={merchantNavItems}
        maxWidth="2xl"
      >
        <div className="py-4">
          <ErrorState
            message={error instanceof Error ? error.message : "Erreur de chargement"}
            onRetry={() => refetch()}
            isNetworkError={!isOnline}
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={merchant?.full_name || t("merchant")}
      subtitle="Espace Marchand"
      showSignOut
      onSignOut={handleSignOut}
      navItems={merchantNavItems}
      maxWidth="2xl"
    >
      {showConfetti && <Confetti duration={3000} particleCount={60} />}
      
      {/* Assistant vocal flottant */}
      <AudioButton 
        textToRead={getAssistantAudioText()}
        className="fixed bottom-24 right-4 z-50"
        size="lg"
      />

      <div className="py-4 space-y-6">
        {isLoading ? (
          <MerchantDashboardSkeleton />
        ) : (
          <>
            {/* 1. CARTE SESSION - État de la journée */}
            <DaySessionBanner
              sessionStatus={sessionStatus}
              session={todaySession}
              onOpenDay={() => setOpenDayDialogOpen(true)}
              onCloseDay={() => setCloseDayDialogOpen(true)}
              inclusive
            />

            {/* 2. MONTANT DU JOUR - XXL, interactif */}
            <UnifiedBigNumber 
              label={t("your_sales_today") || "Aujourd'hui"} 
              value={todayTotal} 
              unit="FCFA"
              sizeXXL
              onTap={handleAmountTap}
            />

            {/* 3. BOUTON HÉROS - ENCAISSER */}
            <Button 
              onClick={handleEncaisser} 
              className="btn-cashier-hero w-full flex items-center justify-center gap-3"
              disabled={!isSessionOpen}
            >
              <Banknote className="w-8 h-8" />
              <span className="text-xl">ENCAISSER</span>
            </Button>

            {/* 4. TUILES OUTILS INCLUSIVES - 2x2 grid */}
            <InclusiveToolsGrid />

            {/* 5. Indicateur de connexion discret */}
            <OnlineStatusIndicator isOnline={isOnline} />
          </>
        )}
      </div>

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
    </PageLayout>
  );
}
