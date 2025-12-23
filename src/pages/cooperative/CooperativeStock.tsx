import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Loader2, Bell } from 'lucide-react';
import { NotificationBadge } from '@/components/shared/NotificationBadge';
import { cooperativeNavItems } from '@/config/navigation';
import { useCooperativeStock, CooperativeStockItem } from '@/hooks/useCooperativeStock';
import { useCooperativeNotifications } from '@/hooks/useCooperativeNotifications';
import { StockCard, LowStockAlert, AddStockDialog } from '@/components/cooperative/stock';
import { getStockStatus, StockStatus } from '@/components/cooperative/stock/types';
import { PageWithList, FilterOption } from '@/templates';

const CooperativeStock = () => {
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

  const { lowStockCount, outOfStockCount, expiringStockCount, totalAlerts } = useCooperativeNotifications();

  // Filtrage
  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.product.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'all') return matchesSearch;
    const status = getStockStatus(stock.quantity, stock.expiry_date);
    return matchesSearch && status === statusFilter;
  });

  // Options de filtre (4 pour coopératives)
  const filterOptions: FilterOption[] = [
    { value: 'all', label: 'Tous', count: stocks.length },
    { value: 'out', label: 'Rupture', count: outOfStockCount },
    { value: 'low', label: 'Stock bas', count: lowStockCount },
    { value: 'expiring', label: 'Expire', count: expiringStockCount },
  ];

  const alertsText = totalAlerts > 0 ? ` • ${totalAlerts} alerte${totalAlerts > 1 ? 's' : ''}` : '';
  const subtitle = `${stocks.length} produit${stocks.length !== 1 ? 's' : ''}${alertsText}`;

  const getEmptyMessage = () => {
    switch (statusFilter) {
      case 'out': return 'Aucun produit en rupture de stock';
      case 'low': return 'Aucun produit en stock bas';
      case 'expiring': return 'Aucun produit expirant bientôt';
      case 'ok': return 'Aucun produit avec un stock normal';
      default: return 'Ajoutez vos premiers produits en stock';
    }
  };

  return (
    <PageWithList<CooperativeStockItem>
      title="Mon Stock"
      subtitle={subtitle}
      showBack
      backTo="/cooperative"
      navItems={cooperativeNavItems}
      headerRightContent={
        totalAlerts > 0 ? (
          <NotificationBadge count={totalAlerts} variant={outOfStockCount > 0 ? "destructive" : "warning"} />
        ) : undefined
      }

      // Recherche
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Rechercher un produit..."

      // Filtres
      filterOptions={filterOptions}
      filterValue={statusFilter}
      onFilterChange={(v) => setStatusFilter(v as StockStatus | 'all')}

      // Liste
      items={filteredStocks}
      keyExtractor={(stock) => stock.id}
      renderItem={(stock) => <StockCard stock={stock} />}
      isLoading={isLoading}

      // Contenu avant liste
      headerContent={
        <div className="space-y-4 py-2">
          <LowStockAlert items={lowStockItems} />
          <div className="flex gap-2">
            <AddStockDialog products={products} isSaving={isSaving} onAdd={addStock} />
            <Button onClick={checkLowStock} variant="outline" disabled={isCheckingStock} className="shrink-0">
              {isCheckingStock ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bell className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      }

      // État vide
      emptyState={
        <Card className="bg-muted/30">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              {statusFilter === 'all' ? 'Aucun stock' : 'Aucun produit'}
            </h3>
            <p className="text-sm text-muted-foreground">{getEmptyMessage()}</p>
          </CardContent>
        </Card>
      }
    />
  );
};

export default CooperativeStock;
