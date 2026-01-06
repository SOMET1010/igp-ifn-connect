import { useNavigate } from "react-router-dom";
import { Package, Receipt, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { UnifiedActionCard } from "@/shared/ui";

interface MerchantQuickActionsProps {
  stockAlertCount: number;
  outOfStockCount: number;
  cancelledInvoicesCount: number;
}

export const MerchantQuickActions: React.FC<MerchantQuickActionsProps> = ({
  stockAlertCount,
  outOfStockCount,
  cancelledInvoicesCount,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      <UnifiedActionCard
        title={t("stock")}
        description={t("manage_products")}
        icon={Package}
        onClick={() => navigate('/marchand/stock')}
        badge={stockAlertCount}
        badgeVariant={outOfStockCount > 0 ? 'destructive' : 'warning'}
      />
      <UnifiedActionCard
        title={t("invoices") || "Factures"}
        description={t("view_history")}
        icon={Receipt}
        onClick={() => navigate('/marchand/factures')}
        badge={cancelledInvoicesCount}
        badgeVariant="warning"
      />
      <UnifiedActionCard
        title={t("my_profile")}
        description={t("settings")}
        icon={User}
        onClick={() => navigate('/marchand/profil')}
      />
    </div>
  );
};
