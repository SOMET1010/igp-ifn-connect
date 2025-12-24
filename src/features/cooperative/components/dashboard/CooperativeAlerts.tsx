/**
 * Composant d'alertes stock pour le dashboard coopérative
 */
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Package, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CooperativeNotifications } from '../../hooks/useCooperativeNotifications';

interface CooperativeAlertsProps {
  notifications: CooperativeNotifications;
}

export const CooperativeAlerts: React.FC<CooperativeAlertsProps> = ({ 
  notifications 
}) => {
  const navigate = useNavigate();
  const { lowStockCount, outOfStockCount, expiringStockCount, isLoading } = notifications;

  if (isLoading || (lowStockCount === 0 && outOfStockCount === 0 && expiringStockCount === 0)) {
    return null;
  }

  return (
    <div className="space-y-2">
      {outOfStockCount > 0 && (
        <Alert 
          variant="destructive" 
          className="cursor-pointer"
          onClick={() => navigate('/cooperative/stock')}
        >
          <Package className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{outOfStockCount} produit(s) en rupture de stock</span>
            <span className="text-xs">Voir →</span>
          </AlertDescription>
        </Alert>
      )}

      {lowStockCount > 0 && (
        <Alert 
          className="cursor-pointer border-warning bg-warning/10"
          onClick={() => navigate('/cooperative/stock')}
        >
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="flex items-center justify-between text-warning-foreground">
            <span>{lowStockCount} produit(s) en stock faible</span>
            <span className="text-xs">Voir →</span>
          </AlertDescription>
        </Alert>
      )}

      {expiringStockCount > 0 && (
        <Alert 
          className="cursor-pointer border-warning bg-warning/10"
          onClick={() => navigate('/cooperative/stock')}
        >
          <Clock className="h-4 w-4 text-warning" />
          <AlertDescription className="flex items-center justify-between text-warning-foreground">
            <span>{expiringStockCount} produit(s) proche(s) de la péremption</span>
            <span className="text-xs">Voir →</span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
