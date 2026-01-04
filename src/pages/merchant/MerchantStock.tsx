import { useState, useEffect, useCallback } from "react";
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  CheckCircle,
  RefreshCw, 
  Volume2, 
  VolumeX 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { merchantNavItems } from "@/config/navigation";
import { PageWithList, FilterOption } from "@/templates";
import { Pictogram } from "@/components/shared/Pictogram";
import { useTts } from "@/shared/hooks/useTts";
import { getStockScript } from "@/shared/config/audio/stockScripts";
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

  const { speak, isVoiceEnabled, toggleVoice, isSpeaking: isPlaying } = useTts();
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);

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

  // Audio de bienvenue au chargement
  useEffect(() => {
    if (!isLoading && stocks.length > 0 && isVoiceEnabled && !hasPlayedWelcome) {
      const welcomeText = getStockScript('stock_welcome');
      speak(welcomeText);
      setHasPlayedWelcome(true);
    } else if (!isLoading && stocks.length === 0 && isVoiceEnabled && !hasPlayedWelcome) {
      const emptyText = getStockScript('stock_empty');
      speak(emptyText);
      setHasPlayedWelcome(true);
    }
  }, [isLoading, stocks.length, isVoiceEnabled, hasPlayedWelcome, speak]);

  // Callback pour audio contextuel
  const handleSpeak = useCallback((text: string) => {
    if (isVoiceEnabled) {
      speak(text);
    }
  }, [isVoiceEnabled, speak]);

  // Filtrage combiné (recherche + statut)
  const filteredStocks = stocks.filter(s => {
    const matchesSearch = s.product?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getStockStatus(Number(s.quantity), Number(s.min_threshold));
    const matchesStatus = statusFilter === "all" || statusFilter === status;
    return matchesSearch && matchesStatus;
  });

  // Options de filtres avec pictogrammes
  const filterOptions: FilterOption[] = [
    { value: "all", label: "Tous", count: stocks.length, icon: Package },
    { value: "out", label: "Rupture", count: outOfStockItems.length, icon: AlertTriangle },
    { value: "low", label: "Bas", count: lowStockItems.length, icon: TrendingDown },
    { value: "ok", label: "OK", count: okStockItems.length, icon: CheckCircle },
  ];

  const alertCount = outOfStockItems.length + lowStockItems.length;

  const handleOpenRestock = (stock: StockItem) => {
    setSelectedStock(stock);
    setShowRestockDialog(true);
    if (isVoiceEnabled) {
      speak(getStockScript('stock_restock'));
    }
  };

  const handleOpenEdit = (stock: StockItem) => {
    setSelectedStock(stock);
    setShowEditDialog(true);
    if (isVoiceEnabled) {
      speak(getStockScript('stock_edit'));
    }
  };

  const handleOpenAdd = () => {
    setShowAddDialog(true);
    if (isVoiceEnabled) {
      speak(getStockScript('stock_add'));
    }
  };

  const handleRestock = async (stockId: string, currentQty: number, addQty: number) => {
    const success = await restockItem(stockId, currentQty, addQty);
    if (success) {
      setSelectedStock(null);
      if (isVoiceEnabled) {
        speak(getStockScript('stock_saved'));
      }
    }
    return success;
  };

  const handleUpdate = async (stockId: string, data: { quantity: number; minThreshold: number; unitPrice: number | null }) => {
    const success = await updateStock(stockId, data);
    if (success) {
      setSelectedStock(null);
      if (isVoiceEnabled) {
        speak(getStockScript('stock_saved'));
      }
    }
    return success;
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    if (isVoiceEnabled) {
      const scriptKey = `stock_filter_${value === 'all' ? 'all' : value === 'out' ? 'out' : value === 'low' ? 'low' : 'ok'}`;
      speak(getStockScript(scriptKey));
    }
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
          <div className="flex items-center gap-2">
            {/* Bouton son */}
            <Button
              variant={isVoiceEnabled ? "default" : "ghost"}
              size="icon"
              onClick={toggleVoice}
              className={`h-12 w-12 rounded-full ${isVoiceEnabled ? "bg-primary text-primary-foreground" : ""}`}
            >
              {isVoiceEnabled ? (
                <Volume2 className={`w-6 h-6 ${isPlaying ? "animate-pulse" : ""}`} />
              ) : (
                <VolumeX className="w-6 h-6" />
              )}
            </Button>
            {/* Bouton actualiser */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchData()}
              className="h-12 w-12"
            >
              <RefreshCw className="w-6 h-6" />
            </Button>
          </div>
        }
        
        // Recherche
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher..."
        
        // Filtres par statut
        filterOptions={filterOptions}
        filterValue={statusFilter}
        onFilterChange={handleFilterChange}
        
        // Liste
        items={filteredStocks}
        keyExtractor={(stock) => stock.id}
        renderItem={(stock) => (
          <StockCard
            stock={stock}
            onRestock={handleOpenRestock}
            onEdit={handleOpenEdit}
            onDelete={deleteStock}
            onSpeak={handleSpeak}
          />
        )}
        
        isLoading={isLoading}
        
        // Contenu avant la liste
        headerContent={
          <div className="space-y-4 py-2">
            {/* Alertes avec audio */}
            <StockAlerts
              outOfStockItems={outOfStockItems}
              lowStockItems={lowStockItems}
              onRestock={handleOpenRestock}
              onSpeakAlert={isVoiceEnabled ? handleSpeak : undefined}
            />
            
            {/* Bouton Ajouter XXL */}
            <Button
              onClick={handleOpenAdd}
              disabled={availableProducts.length === 0}
              className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl gap-3"
            >
              <Pictogram type="add" size="md" showBackground={false} />
              <span>Ajouter un produit</span>
            </Button>
          </div>
        }
        
        // État vide personnalisé
        emptyState={
          <Card className="bg-muted/30">
            <CardContent className="p-8 text-center">
              <Pictogram type="stock" size="xl" className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold text-foreground mb-2">
                {searchQuery || statusFilter !== "all" ? "Aucun produit trouvé" : "Ton stock est vide"}
              </p>
              <p className="text-muted-foreground">
                Appuie sur le bouton + pour ajouter
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
