import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { MERCHANT_NAV_ITEMS } from '@/config/navigation-julaba';
import { useMerchantCredits } from '@/features/merchant/hooks/useMerchantCredits';
import {
  CreditsSummary,
  CreditsFilters,
  CreditsList,
  AddCreditDialog,
  PaymentDialog
} from '@/features/merchant/components/credits';
import type { CustomerCredit } from '@/features/merchant/types/credits.types';

// Jùlaba Design System
import {
  JulabaPageLayout,
  JulabaHeader,
  JulabaBottomNav,
  JulabaCard,
  JulabaStatCard,
  JulabaButton,
  JulabaEmptyState,
} from '@/shared/ui/julaba';

export default function MerchantCredits() {
  const {
    filteredCredits,
    isLoading,
    totalOwed,
    overdueCount,
    filter,
    setFilter,
    addCredit,
    recordPayment
  } = useMerchantCredits();

  const [selectedCredit, setSelectedCredit] = useState<CustomerCredit | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const handlePaymentClick = (credit: CustomerCredit) => {
    setSelectedCredit(credit);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = async (credit: CustomerCredit, amount: number) => {
    const success = await recordPayment(credit, amount);
    if (success) {
      setSelectedCredit(null);
    }
    return success;
  };

  if (isLoading) {
    return (
      <JulabaPageLayout className="flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[hsl(30_100%_60%)]" />
      </JulabaPageLayout>
    );
  }

  return (
    <JulabaPageLayout>
      <JulabaHeader
        title="Qui me doit"
        subtitle="Les clients pas encore payés"
        showBack
        backPath="/marchand/profil"
      />

      <main className="px-4 py-4 space-y-5">
        {/* Stats rapides */}
        <div className="grid grid-cols-2 gap-3">
          <JulabaStatCard
            emoji="💸"
            value={totalOwed.toLocaleString()}
            suffix="FCFA"
            label="À récupérer"
            iconBg="orange"
          />
          <JulabaStatCard
            emoji="⏰"
            value={overdueCount}
            label={overdueCount > 1 ? "En retard" : "En retard"}
            iconBg={overdueCount > 0 ? "orange" : "green"}
          />
        </div>

        {/* Bouton ajouter */}
        <AddCreditDialog onSubmit={addCredit} />
        
        {/* Filtres */}
        <CreditsFilters filter={filter} onFilterChange={setFilter} />
        
        {/* Liste */}
        {filteredCredits.length === 0 ? (
          <JulabaEmptyState
            emoji="✨"
            title="Personne ne te doit"
            description="Tous tes clients ont payé !"
          />
        ) : (
          <CreditsList 
            credits={filteredCredits} 
            onPaymentClick={handlePaymentClick}
          />
        )}
      </main>

      <PaymentDialog
        credit={selectedCredit}
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onSubmit={handlePaymentSubmit}
      />

      <JulabaBottomNav items={MERCHANT_NAV_ITEMS} />
    </JulabaPageLayout>
  );
}
