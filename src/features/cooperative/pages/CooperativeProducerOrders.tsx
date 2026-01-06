/**
 * Page des commandes aux producteurs
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '@/shared/contexts';
import { EnhancedHeader, UnifiedBottomNav, LoadingState, ErrorState } from '@/shared/ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { ShoppingCart } from 'lucide-react';
import { useCooperativeDashboard } from '@/features/cooperative';
import { useCooperativeProducerOrders } from '@/features/cooperative/hooks/useCooperativeProducerOrders';
import { useCooperativeProducers } from '@/features/cooperative/hooks/useCooperativeProducers';
import { 
  ProducerOrdersList, 
  CreateOrderDialog 
} from '@/features/cooperative/components/producerOrders';
import { cooperativeNavItems } from '@/config/navigation';

const CooperativeProducerOrders: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useLanguage();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const navItems = cooperativeNavItems;

  const { cooperative, isLoading: isLoadingCoop, error: errorCoop } = useCooperativeDashboard();
  const { producers } = useCooperativeProducers(cooperative?.id);

  const {
    pendingOrders,
    completedOrders,
    harvests,
    isLoading,
    error,
    refetch,
    createOrder,
    isCreating,
    cancelOrder,
    isCancelling,
  } = useCooperativeProducerOrders(cooperative?.id);

  const handleSignOut = async () => {
    await signOut();
    navigate('/cooperative/login');
  };

  const handleCancelClick = (orderId: string) => {
    setOrderToCancel(orderId);
    setCancelReason('');
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (orderToCancel && cancelReason.trim()) {
      cancelOrder({ orderId: orderToCancel, reason: cancelReason });
      setCancelDialogOpen(false);
      setOrderToCancel(null);
      setCancelReason('');
    }
  };

  if (isLoadingCoop || isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <EnhancedHeader title="Commandes Producteurs" subtitle={cooperative?.name} showSignOut onSignOut={handleSignOut} />
        <LoadingState message="Chargement des commandes..." />
        <UnifiedBottomNav items={navItems} />
      </div>
    );
  }

  if (errorCoop || error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <EnhancedHeader title="Commandes Producteurs" subtitle="Coopérative" showSignOut onSignOut={handleSignOut} />
        <div className="p-4">
          <ErrorState 
            message={error?.message || errorCoop?.message || "Erreur de chargement"} 
            onRetry={refetch} 
          />
        </div>
        <UnifiedBottomNav items={navItems} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <EnhancedHeader 
        title="Commandes Producteurs" 
        subtitle={cooperative?.name}
        showSignOut 
        onSignOut={handleSignOut}
        rightContent={
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <ShoppingCart className="h-4 w-4" />
            {pendingOrders.length}
          </div>
        }
      />

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Action de création */}
        <div className="flex justify-end">
          <CreateOrderDialog 
            harvests={harvests}
            producers={producers}
            onSubmit={createOrder} 
            isCreating={isCreating} 
          />
        </div>

        {/* Info sur les récoltes disponibles */}
        {harvests.length > 0 && (
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>{harvests.length}</strong> récolte{harvests.length > 1 ? 's' : ''} disponible{harvests.length > 1 ? 's' : ''} chez vos producteurs
            </p>
          </div>
        )}

        {/* Liste des commandes */}
        <ProducerOrdersList 
          pendingOrders={pendingOrders}
          completedOrders={completedOrders}
          onCancel={handleCancelClick}
          isCancelling={isCancelling}
        />
      </div>

      {/* Dialog d'annulation */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler la commande ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Veuillez indiquer le motif d'annulation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="Motif d'annulation..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCancel}
              disabled={!cancelReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmer l'annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UnifiedBottomNav items={navItems} />
    </div>
  );
};

export default CooperativeProducerOrders;
