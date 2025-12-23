import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Package, 
  Loader2,
  Search,
  Bell,
  AlertTriangle,
  XCircle,
  Clock,
} from 'lucide-react';
import { UnifiedHeader } from '@/components/shared/UnifiedHeader';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { NotificationBadge } from '@/components/shared/NotificationBadge';
import { cooperativeNavItems } from '@/config/navigation';
import { useCooperativeStock } from '@/hooks/useCooperativeStock';
import { useCooperativeNotifications } from '@/hooks/useCooperativeNotifications';
import { StockCard, LowStockAlert, AddStockDialog } from '@/components/cooperative/stock';
import { getStockStatus, StockStatus } from '@/components/cooperative/stock/types';

const CooperativeStock: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'all'>('all');

  const {
    stocks,
    products,
    isLoading,
    isSaving,
    isCheckingStock,
    addStock,
    checkLowStock,
    lowStockItems,
  } = useCooperativeStock(user?.id);

  const { 
    lowStockCount, 
    outOfStockCount, 
    expiringStockCount,
    totalAlerts 
  } = useCooperativeNotifications();

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.product.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'all') return matchesSearch;
    const status = getStockStatus(stock.quantity, stock.expiry_date);
    return matchesSearch && status === statusFilter;
  });

  // Build subtitle with alerts info
  const alertsText = totalAlerts > 0 ? ` • ${totalAlerts} alerte${totalAlerts > 1 ? 's' : ''}` : '';
  const subtitle = `${stocks.length} produit${stocks.length !== 1 ? 's' : ''}${alertsText}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <UnifiedHeader
        title="Mon Stock"
        subtitle={subtitle}
        showBack
        backTo="/cooperative"
        rightContent={
          totalAlerts > 0 ? (
            <NotificationBadge 
              count={totalAlerts} 
              variant={outOfStockCount > 0 ? "destructive" : "warning"} 
            />
          ) : undefined
        }
      />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
            className="shrink-0"
          >
            Tous ({stocks.length})
          </Button>
          <Button
            variant={statusFilter === 'out' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('out')}
            className={`shrink-0 ${outOfStockCount > 0 ? 'border-destructive text-destructive hover:text-destructive' : ''}`}
          >
            <XCircle className="w-4 h-4 mr-1" />
            Rupture ({outOfStockCount})
          </Button>
          <Button
            variant={statusFilter === 'low' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('low')}
            className={`shrink-0 ${lowStockCount > 0 ? 'border-amber-500 text-amber-500 hover:text-amber-500' : ''}`}
          >
            <AlertTriangle className="w-4 h-4 mr-1" />
            Stock bas ({lowStockCount})
          </Button>
          <Button
            variant={statusFilter === 'expiring' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('expiring')}
            className={`shrink-0 ${expiringStockCount > 0 ? 'border-orange-500 text-orange-500 hover:text-orange-500' : ''}`}
          >
            <Clock className="w-4 h-4 mr-1" />
            Expire ({expiringStockCount})
          </Button>
        </div>

        {/* Low Stock Alert */}
        <LowStockAlert items={lowStockItems} />

        {/* Action buttons */}
        <div className="flex gap-2">
          <AddStockDialog
            products={products}
            isSaving={isSaving}
            onAdd={addStock}
          />
          <Button
            onClick={checkLowStock}
            variant="outline"
            disabled={isCheckingStock}
            className="shrink-0"
          >
            {isCheckingStock ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Stock list */}
        {filteredStocks.length === 0 ? (
          <Card className="bg-muted/30">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                {statusFilter === 'all' ? 'Aucun stock' : 'Aucun produit'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {statusFilter === 'out' && 'Aucun produit en rupture de stock'}
                {statusFilter === 'low' && 'Aucun produit en stock bas'}
                {statusFilter === 'expiring' && 'Aucun produit expirant bientôt'}
                {statusFilter === 'ok' && 'Aucun produit avec un stock normal'}
                {statusFilter === 'all' && 'Ajoutez vos premiers produits en stock'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredStocks.map((stock) => (
              <StockCard key={stock.id} stock={stock} />
            ))}
          </div>
        )}
      </div>

      <UnifiedBottomNav items={cooperativeNavItems} />
    </div>
  );
};

export default CooperativeStock;