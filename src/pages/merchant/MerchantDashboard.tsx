import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/shared/BottomNav";
import { AudioButton } from "@/components/shared/AudioButton";
import { Pictogram } from "@/components/shared/Pictogram";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Home, 
  Wallet, 
  User,
  Banknote,
  TrendingUp,
  Shield,
  ArrowRight,
  Loader2,
  Package,
  AlertTriangle,
  CreditCard,
  QrCode,
  Gift,
  Leaf
} from "lucide-react";

interface MerchantData {
  full_name: string;
  cmu_number: string;
  rsti_balance: number;
  activity_type: string;
}

export default function MerchantDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [stockAlerts, setStockAlerts] = useState(0);
  const [unpaidCredits, setUnpaidCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const navItems = [
    { icon: Home, label: t("home"), href: "/marchand" },
    { icon: Package, label: t("stock"), href: "/marchand/stock" },
    { icon: Wallet, label: t("collect"), href: "/marchand/encaisser" },
    { icon: User, label: t("profile"), href: "/marchand/profil" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: merchantData } = await supabase
        .from("merchants")
        .select("full_name, cmu_number, rsti_balance, activity_type")
        .eq("user_id", user.id)
        .single();

      if (merchantData) {
        setMerchant(merchantData);

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
            setTodayCount(transactions.length);
          }

          const { data: stocksData } = await supabase
            .from("merchant_stocks")
            .select("quantity, min_threshold")
            .eq("merchant_id", merchantForTx.id);

          if (stocksData) {
            const alertsCount = stocksData.filter(s => 
              Number(s.quantity) <= Number(s.min_threshold)
            ).length;
            setStockAlerts(alertsCount);
          }

          const { data: creditsData } = await supabase
            .from("customer_credits")
            .select("amount_owed, amount_paid")
            .eq("merchant_id", merchantForTx.id)
            .neq("status", "paid");

          if (creditsData) {
            const totalUnpaid = creditsData.reduce((sum, c) => 
              sum + (Number(c.amount_owed) - Number(c.amount_paid)), 0
            );
            setUnpaidCredits(totalUnpaid);
          }
        }
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  // Build audio text for the page
  const pageAudioText = `${t("audio_dashboard")}: ${todayTotal.toLocaleString()} FCFA. ${todayCount} ${t("transactions")}.`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Floating Audio Button */}
      <AudioButton 
        textToRead={pageAudioText}
        className="fixed bottom-24 right-4 z-50"
        size="lg"
      />

      {/* Header */}
      <header className="bg-gradient-forest text-primary-foreground p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Pictogram type="money" size="lg" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-primary-foreground/80">{t("welcome")},</p>
            <h1 className="text-xl font-bold">{merchant?.full_name || t("merchant")}</h1>
            <p className="text-sm text-primary-foreground/70">
              {merchant?.activity_type || t("commerce")}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-5">
        {/* Solde du jour */}
        <Card 
          className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => navigate("/marchand/historique")}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("daily_sales")}</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {todayTotal.toLocaleString()} <span className="text-lg">FCFA</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {todayCount} {t("transactions")} • {t("view_history")} →
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action principale - Encaisser */}
        <Button
          onClick={() => navigate("/marchand/encaisser")}
          className="w-full h-20 text-xl font-bold rounded-2xl bg-secondary hover:bg-secondary/90 shadow-forest pulse-glow"
        >
          <Banknote className="w-8 h-8 mr-3" />
          {t("collect_payment")}
        </Button>

        {/* Stock Alert Card */}
        {stockAlerts > 0 && (
          <Card 
            className="border-destructive/50 bg-destructive/5 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigate("/marchand/stock")}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{t("stock_alerts")}</h3>
                <p className="text-sm text-muted-foreground">
                  {stockAlerts} {t("products_restock")}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        )}

        {/* Grille actions */}
        <div className="grid grid-cols-2 gap-4">
          {/* Stock */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/30"
            onClick={() => navigate("/marchand/stock")}
          >
            <CardContent className="p-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-foreground">{t("my_stock")}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {t("manage_products")}
              </p>
              <div className="flex items-center text-primary text-sm mt-2 font-medium">
                {t("manage")} <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </CardContent>
          </Card>

          {/* Solde RSTI */}
          <Card className="border-2 border-secondary/20 bg-secondary/5">
            <CardContent className="p-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
                <Wallet className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-bold text-foreground">{t("rsti_balance")}</h3>
              <p className="text-2xl font-bold text-secondary mt-1">
                {(merchant?.rsti_balance || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">FCFA {t("available")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Nouvelles fonctionnalités Phase 1 */}
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigate("/marchand/credits")}
          >
            <CardContent className="p-3 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/10 flex items-center justify-center mb-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-sm">{t("credits")}</h3>
              <p className="text-xs text-muted-foreground">{t("customers")}</p>
              {unpaidCredits > 0 && (
                <p className="text-xs text-amber-600 font-medium mt-1">
                  {unpaidCredits.toLocaleString()} FCFA
                </p>
              )}
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigate("/marchand/scanner")}
          >
            <CardContent className="p-3 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-blue-500/10 flex items-center justify-center mb-2">
                <QrCode className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-sm">{t("scanner")}</h3>
              <p className="text-xs text-muted-foreground">{t("barcode")}</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => navigate("/marchand/promotions")}
          >
            <CardContent className="p-3 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-pink-500/10 flex items-center justify-center mb-2">
                <Gift className="w-5 h-5 text-pink-600" />
              </div>
              <h3 className="font-semibold text-sm">{t("promotions")}</h3>
              <p className="text-xs text-muted-foreground">{t("campaigns")}</p>
            </CardContent>
          </Card>

          {/* Fournisseurs IGP */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-green-200 bg-green-50/50"
            onClick={() => navigate("/marchand/fournisseurs")}
          >
            <CardContent className="p-3 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-green-500/10 flex items-center justify-center mb-2">
                <Leaf className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-sm">{t("suppliers")}</h3>
              <p className="text-xs text-muted-foreground">{t("igp_cooperatives")}</p>
            </CardContent>
          </Card>
        </div>

        {/* CMU Card */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/30"
          onClick={() => navigate("/marchand/cmu")}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">{t("cmu_protection")}</h3>
              <p className="text-xs text-muted-foreground">{t("contribution_benefits")}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Info CMU */}
        {merchant?.cmu_number && (
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Pictogram type="health" size="md" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t("cmu_number")}</p>
                <p className="font-bold text-foreground">{merchant.cmu_number}</p>
              </div>
              <div className="text-secondary text-sm font-medium">
                {t("active")} ✓
              </div>
            </CardContent>
          </Card>
        )}

        {/* Guide rapide */}
        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              💡 {t("daily_tip")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("tip_text")}
            </p>
          </CardContent>
        </Card>
      </main>

      <BottomNav items={navItems} />
    </div>
  );
}
