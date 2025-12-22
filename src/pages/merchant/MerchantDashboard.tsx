import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Banknote, BarChart3, Home, User, Receipt, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AudioButton } from "@/components/shared/AudioButton";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { InstitutionalBottomNav } from "@/components/shared/InstitutionalBottomNav";
import { InstitutionalActionCard } from "@/components/shared/InstitutionalActionCard";
import { BigNumberCard } from "@/components/shared/BigNumberCard";
import { SalesChart } from "@/components/merchant/SalesChart";
import { ErrorState } from "@/components/shared/StateComponents";
import { Confetti } from "@/components/shared/Confetti";
import { merchantLogger } from "@/infra/logger";
import type { MerchantDashboardViewData } from "@/shared/types";

const CONFETTI_KEY_PREFIX = 'ifn_first_sale_celebrated_';

const hasAlreadyCelebratedToday = (): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return localStorage.getItem(`${CONFETTI_KEY_PREFIX}${today}`) === 'true';
};

const markAsCelebratedToday = () => {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(`${CONFETTI_KEY_PREFIX}${today}`, 'true');
  // Nettoyer la clé d'hier pour éviter l'accumulation
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  localStorage.removeItem(`${CONFETTI_KEY_PREFIX}${yesterday}`);
};

export default function MerchantDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [merchant, setMerchant] = useState<MerchantDashboardViewData | null>(null);
  const [todayTotal, setTodayTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const navItems = [
    { icon: Home, label: t("home"), path: '/marchand' },
    { icon: Receipt, label: t("invoices"), path: '/marchand/factures' },
    { icon: Package, label: t("stock"), path: '/marchand/stock' },
    { icon: User, label: t("profile"), path: '/marchand/profil' },
  ];

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

    merchantLogger.debug('Chargement données dashboard', { userId: user.id });

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
            
            // Confetti et toast pour la première vente du jour
            if (total > 0 && !hasAlreadyCelebratedToday()) {
              setShowConfetti(true);
              markAsCelebratedToday();
              toast({
                title: `🎉 ${t("congratulations")}`,
                description: `${t("first_sale_today")}: ${total.toLocaleString()} FCFA`,
                duration: 5000,
              });
              setTimeout(() => setShowConfetti(false), 3500);
            }
            
            merchantLogger.info('Données dashboard chargées', { 
              merchantName: merchantData.full_name,
              todayTotal: total 
            });
          }
        }
      }
    } catch (err) {
      merchantLogger.error('Échec chargement données marchand', err, { userId: user.id });
      setError('Impossible de charger les données. Vérifiez votre connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/marchand/login');
  };

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
      <div className="min-h-screen bg-background pb-20">
        <DashboardHeader
          title={t("merchant")}
          subtitle="Plateforme IFN – Espace Marchand"
          onSignOut={handleSignOut}
        />
        <ErrorState
          message={error}
          onRetry={() => {
            setIsLoading(true);
            fetchData();
          }}
          isNetworkError
        />
        <InstitutionalBottomNav items={navItems} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {showConfetti && <Confetti duration={3000} particleCount={60} />}
      
      <AudioButton 
        textToRead={pageAudioText}
        className="fixed bottom-24 right-4 z-50"
        size="lg"
      />

      <DashboardHeader
        title={merchant?.full_name || t("merchant")}
        subtitle="Plateforme IFN – Espace Marchand"
        onSignOut={handleSignOut}
      />

      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Merchant info */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {merchant?.activity_type}
            {merchant?.market_name && ` • ${merchant.market_name}`}
          </p>
        </div>

        {/* Today's sales - Big Number */}
        <BigNumberCard
          label={t("your_sales_today")}
          value={todayTotal}
          unit="FCFA"
        />

        {/* Action buttons */}
        <Button 
          onClick={() => navigate("/marchand/encaisser")}
          className="btn-institutional w-full h-14 text-lg"
        >
          <Banknote className="w-6 h-6 mr-2" />
          {t("collect_payment")}
        </Button>

        <Button 
          onClick={() => navigate("/marchand/argent")}
          variant="outline"
          className="btn-institutional-outline w-full"
        >
          <BarChart3 className="w-5 h-5 mr-2" />
          {t("your_money")}
        </Button>

        {/* Sales Evolution Chart */}
        <SalesChart />

        {/* Quick Actions */}
        <div className="space-y-3">
          <InstitutionalActionCard
            title={t("stock")}
            description={t("manage_products")}
            icon={Package}
            onClick={() => navigate('/marchand/stock')}
          />
          <InstitutionalActionCard
            title={t("invoices") || "Factures"}
            description={t("view_history")}
            icon={Receipt}
            onClick={() => navigate('/marchand/factures')}
          />
          <InstitutionalActionCard
            title={t("my_profile")}
            description={t("settings")}
            icon={User}
            onClick={() => navigate('/marchand/profil')}
          />
        </div>

        {/* Quick Guide */}
        <Card className="card-institutional">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3">
              {t("quick_guide")}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">1.</span>
                <span>Appuyez sur "Encaisser" pour enregistrer une vente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">2.</span>
                <span>Saisissez le montant et choisissez le mode de paiement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">3.</span>
                <span>Partagez le reçu avec votre client</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Status indicator */}
        <div className={`text-center text-sm ${isOnline ? 'text-muted-foreground' : 'text-destructive'}`}>
          {isOnline ? t("saved_offline") : t("offline_message")}
        </div>
      </main>

      <InstitutionalBottomNav items={navItems} />
    </div>
  );
}
