import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { AudioButton } from "@/components/shared/AudioButton";
import { BigNumber, CardLarge, StatusBanner, BottomNavIFN } from "@/components/ifn";

interface MoneyData {
  totalSales: number;
  totalCMU: number;
  totalRSTI: number;
  netAmount: number;
}

export default function MerchantMoney() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState<MoneyData>({
    totalSales: 0,
    totalCMU: 0,
    totalRSTI: 0,
    netAmount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: merchantData } = await supabase
        .from("merchants")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (merchantData) {
        // Get this month's transactions
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        
        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount, cmu_deduction, rsti_deduction")
          .eq("merchant_id", merchantData.id)
          .gte("created_at", firstDay);

        if (transactions) {
          const totalSales = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
          const totalCMU = transactions.reduce((sum, t) => sum + Number(t.cmu_deduction || 0), 0);
          const totalRSTI = transactions.reduce((sum, t) => sum + Number(t.rsti_deduction || 0), 0);
          
          setData({
            totalSales,
            totalCMU,
            totalRSTI,
            netAmount: totalSales - totalCMU
          });
        }
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  const pageAudioText = `${t("your_money")}: ${data.netAmount.toLocaleString()} FCFA ${t("this_month")}.`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
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

      {/* Header */}
      <header className="bg-secondary text-secondary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/marchand")}
            className="text-secondary-foreground hover:bg-secondary-foreground/10 h-12 w-12"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">{t("your_money")}</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* BigNumber - Net du mois */}
        <div className="py-8">
          <BigNumber 
            value={data.netAmount}
            label={`Ce que tu as gagné ${t("this_month")}`}
            color="success"
          />
        </div>

        {/* Détails entrées/sorties */}
        <CardLarge className="space-y-5">
          {/* Ventes */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[hsl(142,76%,36%)]/10 flex items-center justify-center">
              <ArrowUpCircle className="w-7 h-7 text-[hsl(142,76%,36%)]" />
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground">{t("your_sales")}</p>
              <p className="text-2xl font-bold text-[hsl(142,76%,36%)]">
                +{data.totalSales.toLocaleString()} FCFA
              </p>
            </div>
          </div>

          {/* Santé (CMU) */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <ArrowDownCircle className="w-7 h-7 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground">{t("health_contribution")}</p>
              <p className="text-xl font-bold text-destructive">
                -{data.totalCMU.toLocaleString()} FCFA
              </p>
            </div>
          </div>

          {/* Épargne (RSTI) */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <ArrowUpCircle className="w-7 h-7 text-secondary" />
            </div>
            <div className="flex-1">
              <p className="text-muted-foreground">{t("savings")}</p>
              <p className="text-xl font-bold text-secondary">
                +{data.totalRSTI.toLocaleString()} FCFA
              </p>
            </div>
          </div>
        </CardLarge>

        {/* Badge protection santé */}
        <CardLarge className="flex items-center gap-4 bg-[hsl(142,76%,36%)]/5 border-[hsl(142,76%,36%)]/20">
          <div className="w-14 h-14 rounded-full bg-[hsl(142,76%,36%)]/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-[hsl(142,76%,36%)]" />
          </div>
          <p className="text-lg font-bold text-[hsl(142,76%,30%)]">
            🛡️ {t("your_health_protection")}
          </p>
        </CardLarge>

        {/* Status Banner */}
        <StatusBanner isOnline={isOnline} />
      </main>

      <BottomNavIFN />
    </div>
  );
}
