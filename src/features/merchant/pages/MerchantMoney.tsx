import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowUpCircle, ArrowDownCircle, Shield, Loader2, Wallet, FileText, History, Banknote, Smartphone, ChevronDown, FileDown, Calendar } from "lucide-react";
import { useAuth } from "@/shared/contexts";
import { useLanguage } from "@/shared/contexts";
import { useOnlineStatus } from "@/shared/hooks";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState, EmptyState } from "@/shared/ui";
import { BigNumber, CardLarge, StatusBanner, ButtonSecondary } from "@/shared/ui/ifn";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
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
import { useTransactions, type ExportPeriod } from "@/features/merchant/hooks/useTransactions";
import { useInvoices } from "@/features/merchant/hooks/useInvoices";
import {
  InvoiceCard,
  CreateInvoiceDialog,
  CancelInvoiceDialog,
  InvoicesSummary,
  InvoicesFilters,
} from "@/features/merchant/components/invoices";
import { Invoice } from "@/features/merchant/types/invoices.types";
import { FNEInvoice } from "@/features/merchant/components/FNEInvoice";
import { MERCHANT_NAV_ITEMS } from "@/config/navigation-julaba";

// Jùlaba Design System
import {
  JulabaPageLayout,
  JulabaHeader,
  JulabaBottomNav,
  JulabaTabBar,
  JulabaCard,
  JulabaStatCard,
  JulabaListItem,
  JulabaEmptyState,
} from "@/shared/ui/julaba";


interface MoneyData {
  totalSales: number;
  totalCMU: number;
  totalRSTI: number;
  netAmount: number;
}

export default function MerchantMoney() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  
  // Tab from URL or default
  const initialTab = searchParams.get("tab") || "resume";
  const [activeTab, setActiveTab] = useState(initialTab);
  
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

  // Tabs Jùlaba
  const tabs = [
    { id: "resume", emoji: "📊", label: "Mon mois" },
    { id: "wallet", emoji: "💰", label: "Argent" },
    { id: "historique", emoji: "📜", label: "Ventes" },
    { id: "factures", emoji: "🧾", label: "Tickets" },
  ];

  if (isLoading) {
    return (
      <JulabaPageLayout className="flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[hsl(30_100%_60%)]" />
      </JulabaPageLayout>
    );
  }

  return (
    <JulabaPageLayout>
      {/* Header Jùlaba */}
      <JulabaHeader
        title="Mon Argent"
        subtitle="Ce que tu as gagné"
        showBack
        backPath="/marchand"
      />

      <main className="px-4 py-4 space-y-4">
        {/* Tabs Jùlaba avec emojis */}
        <JulabaTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* TAB: Résumé mensuel */}
        {activeTab === "resume" && (
          <div className="space-y-5">
            {/* Chiffre principal */}
            <JulabaCard className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-1">Ce que tu as gagné ce mois</p>
              <p className="text-4xl font-extrabold text-[hsl(145_74%_42%)]">
                {data.netAmount.toLocaleString()}
                <span className="text-xl font-bold ml-2">FCFA</span>
              </p>
            </JulabaCard>

            {/* Détails entrées/sorties */}
            <JulabaCard className="space-y-4">
              {/* Ventes */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[hsl(145_70%_92%)] flex items-center justify-center">
                  <ArrowUpCircle className="w-6 h-6 text-[hsl(145_74%_42%)]" />
                </div>
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm">Tes ventes</p>
                  <p className="text-xl font-bold text-[hsl(145_74%_42%)]">
                    +{data.totalSales.toLocaleString()} FCFA
                  </p>
                </div>
              </div>

              {/* Santé (CMU) */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[hsl(0_80%_92%)] flex items-center justify-center">
                  <ArrowDownCircle className="w-6 h-6 text-[hsl(0_80%_50%)]" />
                </div>
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm">Ta cotisation santé</p>
                  <p className="text-lg font-bold text-[hsl(0_80%_50%)]">
                    -{data.totalCMU.toLocaleString()} FCFA
                  </p>
                </div>
              </div>

              {/* Épargne (RSTI) */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[hsl(210_100%_92%)] flex items-center justify-center">
                  <ArrowUpCircle className="w-6 h-6 text-[hsl(210_100%_45%)]" />
                </div>
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm">Ton épargne</p>
                  <p className="text-lg font-bold text-[hsl(210_100%_45%)]">
                    +{data.totalRSTI.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            </JulabaCard>

            {/* Badge protection santé */}
            <JulabaCard accent="green" className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[hsl(145_70%_92%)] flex items-center justify-center">
                <Shield className="w-7 h-7 text-[hsl(145_74%_42%)]" />
              </div>
              <p className="text-lg font-bold text-[hsl(145_74%_32%)]">
                🛡️ Ta protection santé est active !
              </p>
            </JulabaCard>
          </div>
        )}

        {/* TAB: Portefeuille */}
        {activeTab === "wallet" && (
          <div className="space-y-5">
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
                  onHistory={() => setActiveTab("historique")}
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
              <JulabaEmptyState
                emoji="💰"
                title="Portefeuille pas encore prêt"
                description="Ton argent gardé arrive bientôt !"
              />
            )}
          </div>
        )}

        {/* TAB: Historique des ventes */}
        {activeTab === "historique" && (
          <HistoriqueTabContent />
        )}

        {/* TAB: Factures */}
        {activeTab === "factures" && (
          <FacturesTabContent />
        )}

        {/* Status Banner */}
        {!isOnline && (
          <JulabaCard accent="orange" className="flex items-center gap-3">
            <span className="text-xl">📡</span>
            <p className="text-sm font-medium">Mode hors-ligne</p>
          </JulabaCard>
        )}
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

      <JulabaBottomNav items={MERCHANT_NAV_ITEMS} />
    </JulabaPageLayout>
  );
}

// ============================
// Sous-composant Historique (style Jùlaba)
// ============================
function HistoriqueTabContent() {
  const { t } = useLanguage();
  const {
    groupedTransactions,
    isLoading,
    isExporting,
    hasMore,
    totalCount,
    exportPeriod,
    setExportPeriod,
    loadMore,
    exportToPDF,
  } = useTransactions();

  if (isLoading) {
    return <LoadingState message="Chargement..." />;
  }

  return (
    <div className="space-y-4">
      {/* Export PDF */}
      {totalCount > 0 && (
        <JulabaCard className="space-y-4">
          <div className="flex items-center gap-2">
            <FileDown className="w-5 h-5 text-[hsl(30_100%_60%)]" />
            <span className="font-bold text-foreground">Exporter PDF</span>
          </div>
          <div className="flex gap-3">
            <Select 
              value={exportPeriod} 
              onValueChange={(v) => setExportPeriod(v as ExportPeriod)}
            >
              <SelectTrigger className="flex-1 h-12 rounded-xl">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="last30">30 derniers jours</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={exportToPDF}
              disabled={isExporting}
              className="h-12 px-6 rounded-xl bg-[hsl(30_100%_60%)] hover:bg-[hsl(27_100%_50%)]"
            >
              {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
            </Button>
          </div>
        </JulabaCard>
      )}

      {/* Empty State */}
      {totalCount === 0 ? (
        <JulabaEmptyState
          emoji="📜"
          title="Pas encore de ventes"
          description="Tes ventes apparaîtront ici"
        />
      ) : (
        <>
          {groupedTransactions.map((group) => (
            <div key={group.label}>
              <h2 className="text-lg font-bold text-foreground mb-3 capitalize">
                {group.label}
              </h2>
              <div className="space-y-2">
                {group.transactions.map((tx) => (
                  <JulabaListItem
                    key={tx.id}
                    emoji={tx.transaction_type === "cash" ? "💵" : "📱"}
                    title={`${Number(tx.amount).toLocaleString()} FCFA`}
                    subtitle={tx.transaction_type === "cash" ? "Espèces" : "Mobile Money"}
                    value={format(new Date(tx.created_at), "HH:mm")}
                    showChevron={false}
                  />
                ))}
              </div>
            </div>
          ))}

          {hasMore && (
            <ButtonSecondary onClick={loadMore} className="mt-4">
              <ChevronDown className="w-5 h-5 mr-2" />
              {t("view_more")}
            </ButtonSecondary>
          )}
        </>
      )}
    </div>
  );
}

// ============================
// Sous-composant Factures (style Jùlaba)
// ============================
function FacturesTabContent() {
  const {
    filteredInvoices,
    isLoading,
    merchantData,
    filter,
    setFilter,
    issuedCount,
    cancelledCount,
    totalAmount,
    createInvoice,
    cancelInvoice,
    generatedInvoice,
    clearGeneratedInvoice,
  } = useInvoices();

  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [invoiceToCancel, setInvoiceToCancel] = useState<Invoice | null>(null);

  // Show generated invoice preview
  if (generatedInvoice) {
    return (
      <div className="p-2">
        <FNEInvoice
          invoice={generatedInvoice}
          onClose={clearGeneratedInvoice}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <InvoicesSummary
        issuedCount={issuedCount}
        cancelledCount={cancelledCount}
        totalAmount={totalAmount}
      />

      {/* Create New Invoice Button */}
      <Button
        className="w-full h-14 rounded-2xl text-lg font-bold bg-[hsl(30_100%_60%)] hover:bg-[hsl(27_100%_50%)]"
        onClick={() => setShowNewInvoice(true)}
      >
        <FileText className="w-5 h-5 mr-2" />
        Nouvelle facture
      </Button>

      {/* Filters */}
      <InvoicesFilters filter={filter} onFilterChange={setFilter} />

      {/* Invoices List */}
      <div className="space-y-3">
        {isLoading ? (
          <LoadingState message="Chargement..." />
        ) : filteredInvoices.length === 0 ? (
          <JulabaEmptyState
            emoji="🧾"
            title="Aucune facture"
            description="Crée ta première facture"
          />
        ) : (
          filteredInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onCancel={() => setInvoiceToCancel(invoice)}
            />
          ))
        )}
      </div>

      {/* Dialogs */}
      <CreateInvoiceDialog
        open={showNewInvoice}
        onOpenChange={setShowNewInvoice}
        onSubmit={createInvoice}
        merchantData={merchantData}
      />

      <CancelInvoiceDialog
        invoice={invoiceToCancel}
        onClose={() => setInvoiceToCancel(null)}
        onConfirm={cancelInvoice}
      />
    </div>
  );
}
