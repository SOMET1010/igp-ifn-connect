import { AlertCircle, TrendingDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";

interface AgentAlertsProps {
  pendingMerchants: number;
  todayEnrollments: number;
}

export function AgentAlerts({ pendingMerchants, todayEnrollments }: AgentAlertsProps) {
  const { t } = useLanguage();
  
  if (pendingMerchants === 0 && todayEnrollments > 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {pendingMerchants > 0 && (
        <Alert variant="default" className="border-warning bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning">
            {pendingMerchants} {t("merchants_pending_validation")}
          </AlertDescription>
        </Alert>
      )}
      
      {todayEnrollments === 0 && (
        <Alert variant="default" className="border-muted bg-muted/30">
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
          <AlertDescription className="text-muted-foreground">
            {t("no_enrollments_today")}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
