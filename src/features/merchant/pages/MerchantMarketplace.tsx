/**
 * Page Marché Virtuel - /marchand/marche
 * Refactorisée avec Design System Jùlaba
 */

import { useState } from "react";
import { 
  JulabaPageLayout,
  JulabaHeader,
  JulabaTabBar,
  JulabaCard,
  JulabaEmptyState,
  JulabaBottomNav,
} from "@/shared/ui/julaba";
import { MERCHANT_NAV_ITEMS } from "@/config/navigation-julaba";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart } from "lucide-react";

// Hooks
import { useMerchantSuppliers } from "../hooks/useMerchantSuppliers";
import { useSupplierCart } from "../hooks/useSupplierCart";

// Components
import { SuppliersCatalogue } from "../components/suppliers/SuppliersCatalogue";
import { SuppliersOrdersList } from "../components/suppliers/SuppliersOrdersList";
import { SuppliersCart } from "../components/suppliers/SuppliersCart";
import { OrderConfirmDialog } from "../components/suppliers/OrderConfirmDialog";
import { OrderSuccessScreen } from "../components/suppliers/OrderSuccessScreen";
import { PriceCompareSheet } from "@/features/public/components/market/PriceCompareSheet";

// Types
import type { ProductOffer } from "../types/suppliers.types";

// Tabs Jùlaba
const MARKETPLACE_TABS = [
  { id: "catalogue", label: "Produits", emoji: "🏪" },
  { id: "commandes", label: "Mes demandes", emoji: "📦" },
];

export default function MerchantMarketplace() {
  const {
    categories,
    filteredProducts,
    orders,
    merchantId,
    loading,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectedProduct,
    setSelectedProduct,
    refetchOrders,
    cancelOrder,
    pendingOrdersCount,
  } = useMerchantSuppliers();

  const {
    cart,
    cartTotal,
    cartItemCount,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    submitOrders,
    submitting,
  } = useSupplierCart();

  const [activeTab, setActiveTab] = useState<string>("catalogue");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [lastOrderItems, setLastOrderItems] = useState<typeof cart>([]);
  const [lastDeliveryDate, setLastDeliveryDate] = useState<string>("");

  // Handle add to cart from price compare sheet
  const handleAddToCart = (offer: ProductOffer, quantity: number) => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, offer, quantity);
  };

  // Handle cart validation
  const handleValidateCart = () => {
    setShowConfirmDialog(true);
  };

  // Handle order confirmation
  const handleConfirmOrder = async (deliveryDate: string, notes: string) => {
    if (!merchantId) return;
    
    setLastOrderItems([...cart]);
    setLastDeliveryDate(deliveryDate);
    
    const success = await submitOrders(merchantId, deliveryDate, notes);
    
    if (success) {
      setShowConfirmDialog(false);
      setShowSuccessScreen(true);
      await refetchOrders();
    }
  };

  // Handle view orders after success
  const handleViewOrders = () => {
    setShowSuccessScreen(false);
    setActiveTab("commandes");
  };

  // Loading state
  if (loading) {
    return (
      <JulabaPageLayout background="warm" className="flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Chargement du marché...</p>
        </div>
      </JulabaPageLayout>
    );
  }

  // Error state - no merchant found
  if (!merchantId) {
    return (
      <JulabaPageLayout background="warm" className="pb-24">
        <JulabaHeader
          title="🏪 Marché Virtuel"
          backPath="/marchand"
        />
        <main className="p-4">
          <JulabaEmptyState
            emoji="🏪"
            title="Profil marchand introuvable"
            description="Reconnecte-toi pour accéder au marché virtuel."
          />
        </main>
        <JulabaBottomNav items={MERCHANT_NAV_ITEMS} />
      </JulabaPageLayout>
    );
  }

  return (
    <JulabaPageLayout background="warm" className="pb-24">
      {/* Header */}
      <JulabaHeader
        title="🏪 Commander"
        backPath="/marchand"
        rightAction={cartItemCount > 0 ? {
          emoji: "🛒",
          label: `${cartItemCount}`,
          onClick: () => {},
        } : undefined}
      />

      {/* Success Screen (overlay) */}
      {showSuccessScreen && (
        <OrderSuccessScreen
          orderItems={lastOrderItems}
          deliveryDate={lastDeliveryDate}
          onViewOrders={handleViewOrders}
        />
      )}

      {/* Main Content */}
      <main className="px-4 py-4 space-y-4">
        {/* Tabs Jùlaba */}
        <div className="relative">
          <JulabaTabBar
            tabs={MARKETPLACE_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          {pendingOrdersCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {pendingOrdersCount}
            </Badge>
          )}
        </div>

        {/* Catalogue Tab */}
        {activeTab === "catalogue" && (
          <SuppliersCatalogue
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            products={filteredProducts}
            onSelectProduct={setSelectedProduct}
          />
        )}

        {/* Orders Tab */}
        {activeTab === "commandes" && (
          <SuppliersOrdersList
            orders={orders}
            onCancelOrder={cancelOrder}
            onBrowseCatalogue={() => setActiveTab("catalogue")}
          />
        )}
      </main>

      {/* Price Compare Sheet */}
      <PriceCompareSheet
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Floating Cart */}
      <SuppliersCart
        cart={cart}
        cartTotal={cartTotal}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onValidate={handleValidateCart}
      />

      {/* Order Confirmation Dialog */}
      <OrderConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        cart={cart}
        cartTotal={cartTotal}
        onConfirm={handleConfirmOrder}
        submitting={submitting}
      />

      {/* Bottom Navigation */}
      <JulabaBottomNav items={MERCHANT_NAV_ITEMS} />
    </JulabaPageLayout>
  );
}
