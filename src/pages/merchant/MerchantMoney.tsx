import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpCircle, ArrowDownCircle, Shield, Loader2, Send, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { supabase } from "@/integrations/supabase/client";
import { AudioButton } from "@/components/shared/AudioButton";
import { BigNumber, CardLarge, StatusBanner } from "@/components/ifn";
import { EnhancedHeader } from "@/components/shared/EnhancedHeader";
import { UnifiedBottomNav } from "@/components/shared/UnifiedBottomNav";
import { merchantNavItems } from "@/config/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  WalletBalance, 
  TransactionList, 
  BeneficiaryList, 
  TransferDialog,
  QuickActions,
  useWallet 
} from "@/features/wallet";
import type { Beneficiary } from "@/features/wallet";
import { toast } from "sonner";

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
  const { isOnline } = useOnlineStatus();
  const [data, setData] = useState<MoneyData>({
    totalSales: 0,
    totalCMU: 0,
    totalRSTI: 0,
    netAmount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("resume");
  
  // Wallet integration
  const { 
    wallet, 
    transactions: walletTransactions, 
    beneficiaries, 
    isLoading: walletLoading, 
    transfer,
    toggleFavorite,
    removeBeneficiary,
    refresh 
  } = useWallet();
  
  const [transferOpen, setTransferOpen] = useState(false);
  const [prefilledPhone, setPrefilledPhone] = useState("");
  const [prefilledName, setPrefilledName] = useState("");

  const handleSend = () => {
    setPrefilledPhone("");
    setPrefilledName("");
    setTransferOpen(true);
  };

  const handleSelectBeneficiary = (beneficiary: Beneficiary) => {
    setPrefilledPhone(beneficiary.phone || "");
    setPrefilledName(beneficiary.merchant_name || beneficiary.nickname || "");
    setTransferOpen(true);
  };

  const handleDeposit = () => {
    toast.info("Dépôt Mobile Money - Bientôt disponible !");
  };

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

      <EnhancedHeader
        title={t("your_money")}
        showBack
        backTo="/marchand"
        showNotifications={false}
      />

      <main className="p-4 space-y-4">
        {/* Tabs: Résumé / Portefeuille */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14">
            <TabsTrigger value="resume" className="text-base gap-2">
              <ArrowUpCircle className="w-5 h-5" />
              Résumé
            </TabsTrigger>
            <TabsTrigger value="wallet" className="text-base gap-2">
              <Wallet className="w-5 h-5" />
              Portefeuille
            </TabsTrigger>
          </TabsList>

          {/* TAB: Résumé mensuel */}
          <TabsContent value="resume" className="space-y-6 mt-4">
            {/* BigNumber - Net du mois */}
            <div className="py-6">
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
          </TabsContent>

          {/* TAB: Portefeuille */}
          <TabsContent value="wallet" className="space-y-6 mt-4">
            {wallet ? (
              <>
                {/* Balance Card */}
                <WalletBalance 
                  balance={wallet.balance} 
                  isLoading={walletLoading}
                  onRefresh={refresh}
                />

                {/* Quick Actions */}
                <QuickActions 
                  onSend={handleSend}
                  onDeposit={handleDeposit}
                  onHistory={() => navigate("/marchand/historique")}
                />

                {/* Beneficiaries */}
                <BeneficiaryList
                  beneficiaries={beneficiaries}
                  onSelect={handleSelectBeneficiary}
                  onToggleFavorite={toggleFavorite}
                  onRemove={removeBeneficiary}
                  isLoading={walletLoading}
                />

                {/* Recent Transactions */}
                <TransactionList 
                  transactions={walletTransactions} 
                  isLoading={walletLoading} 
                />
              </>
            ) : (
              <CardLarge className="text-center py-8">
                <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Portefeuille non disponible</p>
              </CardLarge>
            )}
          </TabsContent>
        </Tabs>

        {/* Status Banner */}
        <StatusBanner isOnline={isOnline} />
      </main>

      {/* Transfer Dialog */}
      <TransferDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        onTransfer={transfer}
        prefilledPhone={prefilledPhone}
        prefilledName={prefilledName}
        maxAmount={wallet?.balance || 0}
      />

      <UnifiedBottomNav items={merchantNavItems} />
    </div>
  );
}
