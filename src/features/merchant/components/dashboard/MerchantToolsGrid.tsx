import { useNavigate } from "react-router-dom";
import { History, CreditCard, ScanBarcode, Tag, Truck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { UnifiedActionCard } from "@/shared/ui";

interface MerchantToolsGridProps {
  pendingCreditsCount: number;
  overdueCreditsCount: number;
}

export const MerchantToolsGrid: React.FC<MerchantToolsGridProps> = ({
  pendingCreditsCount,
  overdueCreditsCount,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">Outils & Services</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <UnifiedActionCard
          title={t("transactions") || "Historique"}
          description={t("your_sales")}
          icon={History}
          onClick={() => navigate('/marchand/historique')}
          compact
        />
        <UnifiedActionCard
          title={t("credits") || "Crédits"}
          description={t("customers")}
          icon={CreditCard}
          onClick={() => navigate('/marchand/credits')}
          compact
          badge={pendingCreditsCount}
          badgeVariant={overdueCreditsCount > 0 ? 'destructive' : 'warning'}
        />
        <UnifiedActionCard
          title={t("scanner") || "Scanner"}
          description={t("barcode")}
          icon={ScanBarcode}
          onClick={() => navigate('/marchand/scanner')}
          compact
        />
        <UnifiedActionCard
          title={t("promotions") || "Promos"}
          description={t("campaigns")}
          icon={Tag}
          onClick={() => navigate('/marchand/promotions')}
          compact
        />
      </div>
      
      <UnifiedActionCard
        title={t("suppliers") || "Fournisseurs"}
        description={t("ifn_cooperatives")}
        icon={Truck}
        onClick={() => navigate('/marchand/fournisseurs')}
      />
    </div>
  );
};
