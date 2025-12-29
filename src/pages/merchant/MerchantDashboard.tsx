import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Banknote, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMerchantDashboardData } from "@/hooks/useMerchantDashboardData";
import { useMerchantNotifications } from "@/hooks/useMerchantNotifications";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useFirstSaleCelebration } from "@/hooks/useFirstSaleCelebration";
import { useSensoryFeedback } from "@/hooks/useSensoryFeedback";
import { useDailySession } from "@/features/merchant/hooks/useDailySession";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/templates";
import { merchantNavItems } from "@/config/navigation";
import { AudioButton } from "@/components/shared/AudioButton";
import { UnifiedBigNumber } from "@/components/shared/UnifiedBigNumber";
import { SalesChart } from "@/components/merchant/SalesChart";
import { MerchantDashboardSkeleton } from "@/components/merchant/MerchantDashboardSkeleton";
import { ErrorState } from "@/components/shared/StateComponents";
import { Confetti } from "@/components/shared/Confetti";
import {
  MerchantQuickActions,
  MerchantToolsGrid,
  MerchantQuickGuide,
  OnlineStatusIndicator,
} from "@/components/merchant/dashboard";
import {
  OpenDayDialog,
  CloseDayDialog,
  DaySessionBanner,
} from "@/features/merchant/components/daily-session";

export default function MerchantDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const { isOnline } = useOnlineStatus();
  const { triggerTap, triggerMoney } = useSensoryFeedback();

  const [openDayDialogOpen, setOpenDayDialogOpen] = useState(false);
  const [closeDayDialogOpen, setCloseDayDialogOpen] = useState(false);

  const { data, isLoading, error, refetch } = useMerchantDashboardData();
  const notifications = useMerchantNotifications();
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
  const stockAlertCount = notifications.lowStockCount + notifications.outOfStockCount;

  const handleSignOut = async () => {
    await signOut();
    navigate('/marchand/login');
  };

  const pageAudioText = `${t("welcome")} ${merchant?.full_name || ""}. ${t("your_sales_today")}: ${todayTotal.toLocaleString()} FCFA.`;

  if (error) {
    return (
      <PageLayout
        title={t("merchant")}
        subtitle="Plateforme IFN – Espace Marchand"
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
      subtitle="Plateforme IFN – Espace Marchand"
      showSignOut
      onSignOut={handleSignOut}
      navItems={merchantNavItems}
      maxWidth="2xl"
    >
      {showConfetti && <Confetti duration={3000} particleCount={60} />}
      
      <AudioButton 
        textToRead={pageAudioText}
        className="fixed bottom-24 right-4 z-50"
        size="lg"
      />

      <div className="py-4 space-y-6">
        {isLoading ? (
          <MerchantDashboardSkeleton />
        ) : (
          <>
            {/* Bannière session journée */}
            <DaySessionBanner
              sessionStatus={sessionStatus}
              session={todaySession}
              onOpenDay={() => setOpenDayDialogOpen(true)}
              onCloseDay={() => setCloseDayDialogOpen(true)}
            />

            {/* Merchant info */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {merchant?.activity_type}
                {merchant?.market_name && ` • ${merchant.market_name}`}
              </p>
            </div>

            <UnifiedBigNumber label={t("your_sales_today")} value={todayTotal} unit="FCFA" />

            {/* CTA principaux - Design KPATA */}
            <Button 
              onClick={() => { triggerMoney(); navigate("/marchand/encaisser"); }} 
              className="btn-kpata-primary w-full"
              disabled={!isSessionOpen}
            >
              <Banknote className="w-6 h-6 mr-2" />
              {t("collect_payment")}
            </Button>

            <Button 
              onClick={() => { triggerTap(); navigate("/marchand/argent"); }} 
              className="btn-kpata-secondary w-full"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              {t("your_money")}
            </Button>

            <SalesChart data={data?.chartData} weeklyTotal={data?.weeklyTotal} trend={data?.trend} />

            <MerchantQuickActions
              stockAlertCount={stockAlertCount}
              outOfStockCount={notifications.outOfStockCount}
              cancelledInvoicesCount={notifications.cancelledInvoicesCount}
            />

            <MerchantToolsGrid
              pendingCreditsCount={notifications.pendingCreditsCount}
              overdueCreditsCount={notifications.overdueCreditsCount}
            />

            <MerchantQuickGuide />

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
