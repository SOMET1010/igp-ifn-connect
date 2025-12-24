import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface PendingSyncAlertProps {
  pendingCount: number;
  isOnline: boolean;
  isSyncing: boolean;
  onSync: () => void;
}

export function PendingSyncAlert({ 
  pendingCount, 
  isOnline, 
  isSyncing, 
  onSync 
}: PendingSyncAlertProps) {
  const { t } = useLanguage();

  if (pendingCount === 0) return null;

  return (
    <Card className="card-institutional border-primary/30">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium text-foreground">
              {pendingCount} {t("pending_enrollments")}
            </p>
            <p className="text-sm text-muted-foreground">
              {isOnline ? t("ready_to_sync") : t("waiting_connection")}
            </p>
          </div>
        </div>
        {isOnline && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSync}
            disabled={isSyncing}
            className="btn-institutional-outline"
          >
            {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : t("sync")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
