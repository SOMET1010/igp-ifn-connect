import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { EnhancedHeader } from '@/components/shared/EnhancedHeader';
import { merchantNavItems } from '@/config/navigation';
import { useMerchantCredits } from '@/features/merchant/hooks/useMerchantCredits';
import {
  CreditsSummary,
  CreditsFilters,
  CreditsList,
  AddCreditDialog,
  PaymentDialog
} from '@/features/merchant/components/credits';
import type { CustomerCredit } from '@/features/merchant/types/credits.types';

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <EnhancedHeader
        title="Crédits Clients"
        subtitle="Gérez vos créances"
        showBack
        backTo="/marchand"
        showNotifications={false}
      />

      <main className="p-4 space-y-4">
        <CreditsSummary totalOwed={totalOwed} overdueCount={overdueCount} />
        
        <AddCreditDialog onSubmit={addCredit} />
        
        <CreditsFilters filter={filter} onFilterChange={setFilter} />
        
        <CreditsList 
          credits={filteredCredits} 
          onPaymentClick={handlePaymentClick}
        />
      </main>

      <PaymentDialog
        credit={selectedCredit}
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        onSubmit={handlePaymentSubmit}
      />

      <UnifiedBottomNav items={merchantNavItems} />
    </div>
  );
}
