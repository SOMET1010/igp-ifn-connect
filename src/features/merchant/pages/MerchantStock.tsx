/**
 * Page Ma Marchandise - /marchand/stock
 * Refactorisée avec Design System Jùlaba
 */

import { useState, useEffect, useCallback } from "react";
import { Volume2, VolumeX, RefreshCw } from "lucide-react";
import { 
  JulabaPageLayout,
  JulabaHeader,
  JulabaButton,
  JulabaCard,
  JulabaListItem,
  JulabaEmptyState,
  JulabaBottomNav,
} from "@/shared/ui/julaba";
import { MERCHANT_NAV_ITEMS } from "@/config/navigation-julaba";
import { useTts } from "@/shared/hooks/useTts";
import { getStockScript } from "@/shared/config/audio/stockScripts";
import {
  StockAlerts,
  AddStockDialog,
  EditStockDialog,
  RestockDialog,
} from "@/features/merchant/components/stock";
import { useMerchantStock, getStockStatus, type StockItem } from "@/features/merchant";

export default function MerchantStock() {
  const {
    stocks,
    isLoading,
    isSaving,
    availableProducts,
    fetchData,
    addStock,
    updateStock,
    restockItem,
    deleteStock,
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

  // Badge variant selon statut
  const getStockBadge = (stock: StockItem) => {
    const qty = Number(stock.quantity);
    const threshold = Number(stock.min_threshold);
    
    if (qty <= 0) {
      return { text: "Rupture", variant: "danger" as const };
    }
    if (qty <= threshold) {
      return { text: "Bas", variant: "warning" as const };
    }
    return { text: "OK", variant: "success" as const };
  };

  if (isLoading) {
    return (
      <JulabaPageLayout background="warm" className="flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-pulse">📦</div>
          <p className="text-lg text-muted-foreground">Chargement...</p>
        </div>
      </JulabaPageLayout>
    );
  }

  return (
    <JulabaPageLayout background="warm" className="pb-24">
      <JulabaHeader
        title="📦 Ma marchandise"
        backPath="/marchand"
        rightAction={{
          emoji: isVoiceEnabled ? "🔊" : "🔇",
          label: isVoiceEnabled ? "Son actif" : "Son coupé",
          onClick: toggleVoice,
        }}
      />

      <main className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Stats rapides */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-lg font-bold">{stocks.length} produit{stocks.length !== 1 ? "s" : ""}</p>
              {alertCount > 0 && (
                <p className="text-sm text-destructive font-medium">
                  ⚠️ {alertCount} alerte{alertCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          <JulabaButton
            variant="ghost"
            size="md"
            emoji="🔄"
            onClick={() => fetchData()}
          >
            Actualiser
          </JulabaButton>
        </div>

        {/* Alertes avec audio */}
        <StockAlerts
          outOfStockItems={outOfStockItems}
          lowStockItems={lowStockItems}
          onRestock={handleOpenRestock}
          onSpeakAlert={isVoiceEnabled ? handleSpeak : undefined}
        />

        {/* Bouton Ajouter XXL */}
        <JulabaButton
          onClick={handleOpenAdd}
          disabled={availableProducts.length === 0}
          variant="hero"
          emoji="➕"
          className="w-full"
        >
          Ajouter à ma marchandise
        </JulabaButton>

        {/* Filtres rapides */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { value: "all", label: "Tous", emoji: "📦", count: stocks.length },
            { value: "out", label: "Rupture", emoji: "🚫", count: outOfStockItems.length },
            { value: "low", label: "Bas", emoji: "⚠️", count: lowStockItems.length },
            { value: "ok", label: "OK", emoji: "✅", count: okStockItems.length },
          ].map((filter) => (
            <JulabaButton
              key={filter.value}
              variant={statusFilter === filter.value ? "primary" : "secondary"}
              size="md"
              onClick={() => setStatusFilter(filter.value)}
              className="flex-shrink-0"
            >
              <span className="mr-1">{filter.emoji}</span>
              {filter.label} ({filter.count})
            </JulabaButton>
          ))}
        </div>

        {/* Liste des produits */}
        {filteredStocks.length > 0 ? (
          <div className="space-y-3">
            {filteredStocks.map((stock) => (
              <JulabaListItem
                key={stock.id}
                emoji="📦"
                title={stock.product?.name || "Produit"}
                subtitle={`${Number(stock.quantity)} ${stock.product?.unit || "unités"}`}
                value={stock.unit_price ? `${stock.unit_price.toLocaleString()} F` : undefined}
                badge={getStockBadge(stock)}
                showChevron
                onClick={() => handleOpenEdit(stock)}
              />
            ))}
          </div>
        ) : (
          <JulabaEmptyState
            emoji="📦"
            title={searchQuery || statusFilter !== "all" ? "Rien trouvé" : "Tu n'as pas encore de marchandise"}
            description="Appuie sur le bouton pour en ajouter"
            action={{
              label: "Ajouter maintenant",
              onClick: handleOpenAdd,
            }}
          />
        )}
      </main>

      <JulabaBottomNav items={MERCHANT_NAV_ITEMS} />

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
    </JulabaPageLayout>
  );
}
