import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export const MerchantQuickGuide: React.FC = () => {
  const { t } = useLanguage();

  return (
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
  );
};
