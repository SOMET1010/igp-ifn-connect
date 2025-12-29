import { useState } from "react";
import { Gift } from "lucide-react";
import { UnifiedBottomNav } from "@/components/shared/UnifiedBottomNav";
import { merchantNavItems } from "@/config/navigation";
import { EnhancedHeader } from "@/components/shared/EnhancedHeader";
import { EmptyState, LoadingState } from "@/components/shared/StateComponents";
import { usePromotions } from "@/features/merchant/hooks/usePromotions";
import {
  PromotionCard,
  AddPromotionDialog,
  DeletePromotionDialog,
  PromotionsSummary,
  PromotionsFilters,
} from "@/features/merchant/components/promotions";
import type { Promotion } from "@/features/merchant/types/promotions.types";

export default function MerchantPromotions() {
  const {
    filteredPromotions,
    isLoading,
    filter,
    setFilter,
    activeCount,
    totalUsage,
    createPromotion,
    togglePromotion,
    deletePromotion,
  } = usePromotions();

  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);

  const handleConfirmDelete = async (id: string) => {
    await deletePromotion(id);
    setPromotionToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message="Chargement des promotions..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <EnhancedHeader title="Promotions" subtitle="Gérez vos offres" showBack backTo="/marchand" showNotifications={false} />

      <main className="p-4 space-y-4">
        <PromotionsSummary activeCount={activeCount} totalUsage={totalUsage} />

        <AddPromotionDialog onSubmit={createPromotion} />

        <PromotionsFilters filter={filter} onFilterChange={setFilter} />

        <div className="space-y-3">
          {filteredPromotions.length === 0 ? (
            <EmptyState
              Icon={Gift}
              title="Aucune promotion"
              message={filter !== "all" ? "Aucune promotion dans cette catégorie" : undefined}
              variant="card"
            />
          ) : (
            filteredPromotions.map((promo) => (
              <PromotionCard
                key={promo.id}
                promotion={promo}
                onToggle={togglePromotion}
                onDelete={setPromotionToDelete}
              />
            ))
          )}
        </div>
      </main>

      <DeletePromotionDialog
        promotion={promotionToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPromotionToDelete(null)}
      />

      <UnifiedBottomNav items={merchantNavItems} />
    </div>
  );
}
