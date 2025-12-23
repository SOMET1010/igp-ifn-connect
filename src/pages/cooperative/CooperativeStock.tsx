import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Package, 
  Loader2,
  Search,
  Bell,
} from 'lucide-react';
import { UnifiedHeader } from '@/components/shared/UnifiedHeader';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { cooperativeNavItems } from '@/config/navigation';
import { useCooperativeStock } from '@/hooks/useCooperativeStock';
import { StockCard, LowStockAlert, AddStockDialog } from '@/components/cooperative/stock';

const CooperativeStock: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredStocks = stocks.filter(stock =>
    stock.product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        subtitle={`${stocks.length} produit${stocks.length !== 1 ? 's' : ''} en stock`}
        showBack
        backTo="/cooperative"
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
              <h3 className="font-semibold text-foreground mb-2">Aucun stock</h3>
              <p className="text-sm text-muted-foreground">
                Ajoutez vos premiers produits en stock
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