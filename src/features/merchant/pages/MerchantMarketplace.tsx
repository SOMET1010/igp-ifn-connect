// ============================================
// Page - Merchant Marketplace (Marché Virtuel)
// Workflow 11.3 PNAVIM-CI: Marketplace/Marché Virtuel
// ============================================

import { useState } from "react";
import { EnhancedHeader, UnifiedBottomNav } from "@/shared/ui";
import { merchantNavItems } from "@/config/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Store, Package, ShoppingCart } from "lucide-react";

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
import type { Product, ProductOffer } from "../types/suppliers.types";

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Chargement du marché...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <EnhancedHeader
        title="Marché Virtuel"
        subtitle="Commandez auprès des coopératives IFN"
        showBack
        backTo="/marchand"
        rightContent={
          cartItemCount > 0 ? (
            <Badge className="bg-primary text-primary-foreground">
              <ShoppingCart className="h-3 w-3 mr-1" />
              {cartItemCount}
            </Badge>
          ) : undefined
        }
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
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 h-14">
            <TabsTrigger value="catalogue" className="text-base gap-2">
              <Store className="h-4 w-4" />
              Catalogue
            </TabsTrigger>
            <TabsTrigger value="commandes" className="text-base gap-2 relative">
              <Package className="h-4 w-4" />
              Commandes
              {pendingOrdersCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {pendingOrdersCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Catalogue Tab */}
          <TabsContent value="catalogue" className="mt-4">
            <SuppliersCatalogue
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              products={filteredProducts}
              onSelectProduct={setSelectedProduct}
            />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="commandes" className="mt-4">
            <SuppliersOrdersList
              orders={orders}
              onCancelOrder={cancelOrder}
              onBrowseCatalogue={() => setActiveTab("catalogue")}
            />
          </TabsContent>
        </Tabs>
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
      <UnifiedBottomNav items={merchantNavItems} />
    </div>
  );
}
