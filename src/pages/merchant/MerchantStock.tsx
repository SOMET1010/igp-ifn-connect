import { useState } from "react";
import { 
  Package, 
  Plus, 
  Loader2,
  RefreshCw,
  Bell,
  AlertTriangle,
  TrendingDown,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { merchantNavItems } from "@/config/navigation";
import { PageWithList, FilterOption } from "@/templates";
import {
  StockCard,
  StockAlerts,
  AddStockDialog,
  EditStockDialog,
  RestockDialog,
} from "@/components/merchant/stock";
import { useMerchantStock, getStockStatus, type StockItem } from "@/features/merchant";

export default function MerchantStock() {
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRestockDialog, setShowRestockDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);

  // Calculs de filtrage par statut
  const outOfStockItems = stocks.filter(s => Number(s.quantity) <= 0);
  const lowStockItems = stocks.filter(s => {
    const qty = Number(s.quantity);
    return qty > 0 && qty <= Number(s.min_threshold);
  });
  const okStockItems = stocks.filter(s => {
    const qty = Number(s.quantity);
    return qty > Number(s.min_threshold);
  });

  // Filtrage combiné (recherche + statut)
  const filteredStocks = stocks.filter(s => {
    const matchesSearch = s.product?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getStockStatus(Number(s.quantity), Number(s.min_threshold));
    const matchesStatus = statusFilter === "all" || statusFilter === status;
    return matchesSearch && matchesStatus;
  });

  const filterOptions: FilterOption[] = [
    { value: "all", label: "Tous", count: stocks.length, icon: Package },
    { value: "out", label: "Rupture", count: outOfStockItems.length, icon: AlertTriangle },
    { value: "low", label: "Stock bas", count: lowStockItems.length, icon: TrendingDown },
    { value: "ok", label: "En stock", count: okStockItems.length, icon: CheckCircle },
  ];

  const alertCount = outOfStockItems.length + lowStockItems.length;

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

  return (
    <>
      <PageWithList<StockItem>
        title="Mon Stock"
        subtitle={`${stocks.length} produit${stocks.length !== 1 ? "s" : ""}${alertCount > 0 ? ` • ${alertCount} alerte${alertCount !== 1 ? "s" : ""}` : ""}`}
        showBack
        backTo="/marchand"
        navItems={merchantNavItems}
        headerRightContent={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchData()}
            className="h-10 w-10"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        }
        
        // Recherche
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher un produit..."
        
        // Filtres par statut
        filterOptions={filterOptions}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        
        // Liste
        items={filteredStocks}
        keyExtractor={(stock) => stock.id}
        renderItem={(stock) => (
          <StockCard
            stock={stock}
            onRestock={handleOpenRestock}
            onEdit={handleOpenEdit}
            onDelete={deleteStock}
          />
        )}
        
        isLoading={isLoading}
        
        // Contenu avant la liste
        headerContent={
          <div className="space-y-4 py-2">
            <StockAlerts
              outOfStockItems={outOfStockItems}
              lowStockItems={lowStockItems}
              onRestock={handleOpenRestock}
            />
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
          </div>
        }
        
        // État vide personnalisé
        emptyState={
          <Card className="bg-muted/30">
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" ? "Aucun produit trouvé" : "Aucun produit en stock"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Ajoutez des produits pour commencer
              </p>
            </CardContent>
          </Card>
        }
      />

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
    </>
  );
}
