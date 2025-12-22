import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  ClipboardList,
  Loader2,
  Check,
  Truck,
  X,
  AlertTriangle
} from 'lucide-react';
import { CooperativeBottomNav } from '@/components/cooperative/CooperativeBottomNav';
import { EmptyState, LoadingState } from '@/components/shared/StateComponents';

interface Order {
  id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  created_at: string;
  merchant_name: string;
  product_name: string;
  product_unit: string;
  cancellation_reason: string | null;
  cancelled_at: string | null;
}

const statusLabels = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmé', color: 'bg-blue-100 text-blue-800' },
  in_transit: { label: 'En transit', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Livré', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800' },
};

const CooperativeOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [cooperativeId, setCooperativeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Cancellation dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrders = async (coopId: string) => {
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`
        id,
        quantity,
        unit_price,
        total_amount,
        status,
        created_at,
        merchant_id,
        product_id,
        cancellation_reason,
        cancelled_at
      `)
      .eq('cooperative_id', coopId)
      .order('created_at', { ascending: false });

    if (ordersData) {
      // Fetch merchant and product details
      const merchantIds = ordersData.map(o => o.merchant_id);
      const productIds = ordersData.map(o => o.product_id);

      const { data: merchants } = await supabase
        .from('merchants')
        .select('id, full_name')
        .in('id', merchantIds);

      const { data: products } = await supabase
        .from('products')
        .select('id, name, unit')
        .in('id', productIds);

      const enrichedOrders = ordersData.map(order => ({
        ...order,
        status: order.status as Order['status'],
        merchant_name: merchants?.find(m => m.id === order.merchant_id)?.full_name ?? 'Marchand',
        product_name: products?.find(p => p.id === order.product_id)?.name ?? 'Produit',
        product_unit: products?.find(p => p.id === order.product_id)?.unit ?? 'kg',
        cancellation_reason: order.cancellation_reason,
        cancelled_at: order.cancelled_at,
      }));

      setOrders(enrichedOrders);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: coopData } = await supabase
        .from('cooperatives')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (coopData) {
        setCooperativeId(coopData.id);
        await fetchOrders(coopData.id);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  const updateOrderStatus = async (orderId: string, newStatus: 'confirmed' | 'in_transit' | 'delivered') => {
    setUpdatingOrderId(orderId);

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
      setUpdatingOrderId(null);
      return;
    }

    toast.success(`Commande ${statusLabels[newStatus].label.toLowerCase()}`);
    
    if (cooperativeId) {
      await fetchOrders(cooperativeId);
    }
    
    setUpdatingOrderId(null);
  };

  const openCancelDialog = (order: Order) => {
    setOrderToCancel(order);
    setCancellationReason('');
    setShowCancelDialog(true);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    
    const trimmedReason = cancellationReason.trim();
    if (trimmedReason.length < 10) {
      toast.error("Le motif doit contenir au moins 10 caractères");
      return;
    }

    setIsCancelling(true);

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancellation_reason: trimmedReason,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', orderToCancel.id);

    if (error) {
      toast.error('Erreur lors de l\'annulation');
      setIsCancelling(false);
      return;
    }

    toast.success('Commande annulée');
    setShowCancelDialog(false);
    setOrderToCancel(null);
    setCancellationReason('');
    
    if (cooperativeId) {
      await fetchOrders(cooperativeId);
    }
    
    setIsCancelling(false);
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'in_transit');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingState message="Chargement des commandes..." />
      </div>
    );
  }

  const OrderCard = ({ order }: { order: Order }) => (
    <Card key={order.id}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">{order.product_name}</h3>
            <p className="text-sm text-muted-foreground">{order.merchant_name}</p>
          </div>
          <Badge className={statusLabels[order.status].color}>
            {statusLabels[order.status].label}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-muted-foreground">
            {order.quantity} {order.product_unit} × {order.unit_price.toLocaleString()} FCFA
          </span>
          <span className="font-semibold text-foreground">
            {order.total_amount.toLocaleString()} FCFA
          </span>
        </div>

        {order.status === 'cancelled' && order.cancellation_reason && (
          <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-2 mb-3">
            <p className="text-xs text-red-600 dark:text-red-400">
              <span className="font-medium">Motif:</span> {order.cancellation_reason}
            </p>
          </div>
        )}

        {order.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => updateOrderStatus(order.id, 'confirmed')}
              disabled={updatingOrderId === order.id}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {updatingOrderId === order.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Confirmer
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openCancelDialog(order)}
              disabled={updatingOrderId === order.id}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {order.status === 'confirmed' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => updateOrderStatus(order.id, 'delivered')}
              disabled={updatingOrderId === order.id}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {updatingOrderId === order.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Truck className="h-4 w-4 mr-1" />
                  Marquer livré
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openCancelDialog(order)}
              disabled={updatingOrderId === order.id}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-2">
          {new Date(order.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/cooperative')} className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Commandes</h1>
            <p className="text-sm text-white/80">{orders.length} commande(s)</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="pending" className="relative">
              En attente
              {pendingOrders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white rounded-full text-xs flex items-center justify-center">
                  {pendingOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmed">En cours</TabsTrigger>
            <TabsTrigger value="delivered">Livré</TabsTrigger>
            <TabsTrigger value="cancelled" className="relative">
              Annulé
              {cancelledOrders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">
                  {cancelledOrders.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3">
            {pendingOrders.length === 0 ? (
              <EmptyState
                Icon={ClipboardList}
                title="Aucune commande en attente"
                variant="card"
              />
            ) : (
              pendingOrders.map(order => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-3">
            {confirmedOrders.length === 0 ? (
              <EmptyState
                Icon={ClipboardList}
                title="Aucune commande confirmée"
                variant="card"
              />
            ) : (
              confirmedOrders.map(order => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="delivered" className="space-y-3">
            {deliveredOrders.length === 0 ? (
              <EmptyState
                Icon={ClipboardList}
                title="Aucune commande livrée"
                variant="card"
              />
            ) : (
              deliveredOrders.map(order => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-3">
            {cancelledOrders.length === 0 ? (
              <EmptyState
                Icon={ClipboardList}
                title="Aucune commande annulée"
                variant="card"
              />
            ) : (
              cancelledOrders.map(order => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Annuler la commande
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {orderToCancel && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-semibold text-foreground">
                  {orderToCancel.product_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {orderToCancel.quantity} {orderToCancel.product_unit} • {orderToCancel.total_amount.toLocaleString()} FCFA
                </p>
                <p className="text-sm text-muted-foreground">
                  Client: {orderToCancel.merchant_name}
                </p>
              </div>
            )}

            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive font-medium">
                ⚠️ Cette action est irréversible
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Le marchand sera notifié de l'annulation.
              </p>
            </div>

            <div>
              <Label htmlFor="cancellationReason" className="text-destructive">
                Motif d'annulation (obligatoire) *
              </Label>
              <Textarea
                id="cancellationReason"
                placeholder="Ex: Stock insuffisant, produit indisponible, erreur de commande..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum 10 caractères ({cancellationReason.trim().length}/10)
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCancelDialog(false)}
                disabled={isCancelling}
              >
                Retour
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancelOrder}
                disabled={isCancelling || cancellationReason.trim().length < 10}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Annulation...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Confirmer l'annulation
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CooperativeBottomNav />
    </div>
  );
};

export default CooperativeOrders;
