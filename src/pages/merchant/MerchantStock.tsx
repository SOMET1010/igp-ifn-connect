import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Package, 
  Plus, 
  Loader2,
  Search,
  RefreshCw,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { UnifiedHeader } from "@/components/shared/UnifiedHeader";
import { UnifiedBottomNav } from "@/components/shared/UnifiedBottomNav";
import { merchantNavItems } from "@/config/navigation";
import { useMerchantStock } from "@/hooks/useMerchantStock";
import {
  StockCard,
  StockAlerts,
  AddStockDialog,
  EditStockDialog,
  RestockDialog,
  getStockStatus,
} from "@/components/merchant/stock";
import type { StockItem } from "@/components/merchant/stock";

export default function MerchantStock() {
  const navigate = useNavigate();
  const {
    stocks,
    isLoading,
    isSaving,
    isCheckingStock,
    availableProducts,
    fetchData,
    addStock,
    updateStock,
    restockItem,
    deleteStock,
    checkLowStock,
  } = useMerchantStock();

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRestockDialog, setShowRestockDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);

  const alertCount = stocks.filter(s => {
    const status = getStockStatus(Number(s.quantity), Number(s.min_threshold));
    return status === "out" || status === "low";
  }).length;

  const outOfStockItems = stocks.filter(s => Number(s.quantity) <= 0);
  const lowStockItems = stocks.filter(s => {
    const qty = Number(s.quantity);
    const threshold = Number(s.min_threshold);
    return qty > 0 && qty <= threshold;
  });

  const filteredStocks = stocks.filter(s => 
    s.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenRestock = (stock: StockItem) => {
    setSelectedStock(stock);
    setShowRestockDialog(true);
  };

  const handleOpenEdit = (stock: StockItem) => {
    setSelectedStock(stock);
    setShowEditDialog(true);
  };

  const handleRestock = async (stockId: string, currentQty: number, addQty: number) => {
    const success = await restockItem(stockId, currentQty, addQty);
    if (success) setSelectedStock(null);
    return success;
  };

  const handleUpdate = async (stockId: string, data: { quantity: number; minThreshold: number; unitPrice: number | null }) => {
    const success = await updateStock(stockId, data);
    if (success) setSelectedStock(null);
    return success;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <UnifiedHeader
        title="Mon Stock"
        subtitle={`${stocks.length} produit${stocks.length !== 1 ? "s" : ""}${alertCount > 0 ? ` • ${alertCount} alerte${alertCount !== 1 ? "s" : ""}` : ""}`}
        showBack
        backTo="/marchand"
        rightContent={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchData()}
            className="h-10 w-10"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        }
      />

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Alerts */}
        <StockAlerts
          outOfStockItems={outOfStockItems}
          lowStockItems={lowStockItems}
          onRestock={handleOpenRestock}
        />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddDialog(true)}
            className="flex-1"
            disabled={availableProducts.length === 0}
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un produit
          </Button>
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

        {/* Stock List */}
        {filteredStocks.length === 0 ? (
          <Card className="bg-muted/30">
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "Aucun produit trouvé" : "Aucun produit en stock"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Ajoutez des produits pour commencer
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredStocks.map(stock => (
              <StockCard
                key={stock.id}
                stock={stock}
                onRestock={handleOpenRestock}
                onEdit={handleOpenEdit}
                onDelete={deleteStock}
              />
            ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <AddStockDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        availableProducts={availableProducts}
        isSaving={isSaving}
        onAdd={addStock}
      />

      <RestockDialog
        open={showRestockDialog}
        onOpenChange={setShowRestockDialog}
        stock={selectedStock}
        isSaving={isSaving}
        onRestock={handleRestock}
      />

      <EditStockDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        stock={selectedStock}
        isSaving={isSaving}
        onUpdate={handleUpdate}
      />

      <UnifiedBottomNav items={merchantNavItems} />
    </div>
  );
}