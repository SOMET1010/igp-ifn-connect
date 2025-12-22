import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Banknote, BarChart3 } from "lucide-react";
import { AudioButton } from "@/components/shared/AudioButton";
import { ButtonPrimary, ButtonSecondary, BigNumber, StatusBanner, BottomNavIFN } from "@/components/ifn";
import { SalesChart } from "@/components/merchant/SalesChart";
import { ErrorState } from "@/components/shared/StateComponents";

interface MerchantData {
  full_name: string;
  activity_type: string;
  market_name?: string;
}

export default function MerchantDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [todayTotal, setTodayTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchData = async () => {
    if (!user) return;

    try {
      setError(null);
      const { data: merchantData, error: merchantError } = await supabase
        .from("merchants")
        .select("full_name, activity_type, market_id")
        .eq("user_id", user.id)
        .single();

      if (merchantError) throw merchantError;

      if (merchantData) {
        let marketName = "";
        if (merchantData.market_id) {
          const { data: market } = await supabase
            .from("markets")
            .select("name")
            .eq("id", merchantData.market_id)
            .single();
          marketName = market?.name || "";
        }

        setMerchant({
          full_name: merchantData.full_name,
          activity_type: merchantData.activity_type,
          market_name: marketName,
        });

        // Get today's sales
        const today = new Date().toISOString().split("T")[0];
        const { data: merchantForTx } = await supabase
          .from("merchants")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (merchantForTx) {
          const { data: transactions } = await supabase
            .from("transactions")
            .select("amount")
            .eq("merchant_id", merchantForTx.id)
            .gte("created_at", today);

          if (transactions) {
            const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
            setTodayTotal(total);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching merchant data:', err);
      setError('Impossible de charger les données. Vérifiez votre connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const pageAudioText = `${t("welcome")} ${merchant?.full_name || ""}. ${t("your_sales_today")}: ${todayTotal.toLocaleString()} FCFA.`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-gradient-forest text-primary-foreground p-6">
          <h1 className="text-2xl font-black">{t("merchant")}</h1>
        </header>
        <ErrorState
          message={error}
          onRetry={() => {
            setIsLoading(true);
            fetchData();
          }}
          isNetworkError
        />
        <BottomNavIFN />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Floating Audio Button */}
      <AudioButton 
        textToRead={pageAudioText}
        className="fixed bottom-28 right-4 z-50"
        size="lg"
      />

      {/* Header simple */}
      <header className="bg-gradient-forest text-primary-foreground p-6">
        <p className="text-lg opacity-90">🌍 {t("welcome")},</p>
        <h1 className="text-2xl font-black mt-1">
          {merchant?.full_name || t("merchant")}
        </h1>
        <p className="text-sm opacity-80 mt-1">
          {merchant?.activity_type}
          {merchant?.market_name && ` • ${merchant.market_name}`}
        </p>
      </header>

      <main className="p-4 space-y-6">
        {/* BigNumber - Ventes du jour */}
        <div className="py-6">
          <BigNumber 
            value={todayTotal}
            label={t("your_sales_today")}
            color="primary"
          />
        </div>

        {/* Bouton GÉANT Encaisser */}
        <ButtonPrimary 
          onClick={() => navigate("/marchand/encaisser")}
          className="h-24 text-2xl"
        >
          <Banknote className="w-10 h-10 mr-3" />
          {t("collect_payment")}
        </ButtonPrimary>

        {/* Bouton secondaire - Mon argent */}
        <ButtonSecondary 
          onClick={() => navigate("/marchand/argent")}
        >
          <BarChart3 className="w-6 h-6 mr-2" />
          {t("your_money")}
        </ButtonSecondary>

        {/* Sales Evolution Chart */}
        <SalesChart />

        {/* Status Banner - Offline first */}
        <StatusBanner 
          isOnline={isOnline}
          message={isOnline ? t("saved_offline") : t("offline_message")}
        />
      </main>

      <BottomNavIFN />
    </div>
  );
}
