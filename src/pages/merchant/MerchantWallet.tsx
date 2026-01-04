import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EnhancedHeader } from "@/components/shared/EnhancedHeader";
import { UnifiedBottomNav } from "@/components/shared/UnifiedBottomNav";
import { merchantNavItems } from "@/config/navigation";
import { 
  WalletBalance, 
  TransactionList, 
  BeneficiaryList, 
  TransferDialog,
  QuickActions,
  useWallet 
} from "@/features/wallet";
import type { Beneficiary } from "@/features/wallet";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function MerchantWallet() {
  const navigate = useNavigate();
  const { 
    wallet, 
    transactions, 
    beneficiaries, 
    isLoading, 
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

  const handleHistory = () => {
    navigate("/marchand/wallet/historique");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <EnhancedHeader title="Mon Portefeuille" showBack />
        <main className="container max-w-lg mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </main>
        <UnifiedBottomNav items={merchantNavItems} />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <EnhancedHeader title="Mon Portefeuille" showBack />
        <main className="container max-w-lg mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Portefeuille non disponible</p>
            <p className="text-sm text-muted-foreground mt-2">
              Veuillez vous reconnecter ou contacter le support.
            </p>
          </div>
        </main>
        <UnifiedBottomNav items={merchantNavItems} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <EnhancedHeader title="Mon Portefeuille" showBack />
      
      <main className="container max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Balance Card */}
        <WalletBalance 
          balance={wallet.balance} 
          isLoading={isLoading}
          onRefresh={refresh}
        />

        {/* Quick Actions */}
        <QuickActions 
          onSend={handleSend}
          onDeposit={handleDeposit}
          onHistory={handleHistory}
        />

        {/* Beneficiaries */}
        <BeneficiaryList
          beneficiaries={beneficiaries}
          onSelect={handleSelectBeneficiary}
          onToggleFavorite={toggleFavorite}
          onRemove={removeBeneficiary}
          isLoading={isLoading}
        />

        {/* Recent Transactions */}
        <TransactionList 
          transactions={transactions} 
          isLoading={isLoading} 
        />
      </main>

      {/* Transfer Dialog */}
      <TransferDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        onTransfer={transfer}
        prefilledPhone={prefilledPhone}
        prefilledName={prefilledName}
        maxAmount={wallet.balance}
      />

      <UnifiedBottomNav items={merchantNavItems} />
    </div>
  );
}
