/**
 * Composant d'alerte des commandes en attente
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/shared/contexts';

interface PendingOrdersAlertProps {
  count: number;
}

export const PendingOrdersAlert: React.FC<PendingOrdersAlertProps> = ({ count }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  if (count <= 0) return null;

  return (
    <Card className="card-institutional border-primary/30">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium text-foreground">
              {count} {t("pending_orders")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("to_confirm_or_process")}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/cooperative/commandes')}
        >
          {t("view")}
        </Button>
      </CardContent>
    </Card>
  );
};
