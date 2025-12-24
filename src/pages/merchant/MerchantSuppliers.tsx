// ============================================
// Page - Merchant Suppliers (Refactored)
// ============================================

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UnifiedBottomNav } from "@/components/shared/UnifiedBottomNav";
import { UnifiedHeader } from "@/components/shared/UnifiedHeader";
import { PriceCompareSheet } from "@/components/market/PriceCompareSheet";
import { merchantNavItems } from "@/config/navigation";
import { Leaf } from "lucide-react";

import {
  useMerchantSuppliers,
  useSupplierCart,
  SuppliersCatalogue,
  SuppliersOrdersList,
  SuppliersCart,
  OrderConfirmDialog,
} from "@/features/merchant";

export default function MerchantSuppliers() {
  const [activeTab, setActiveTab] = useState<string>("catalogue");
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Data & state from hooks
  const {
    categories,
    orders,
    merchantId,
    loading,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filteredProducts,
    selectedProduct,
    setSelectedProduct,
    refetchOrders,
    cancelOrder,
    pendingOrdersCount,
  } = useMerchantSuppliers();

  const {
    cart,
    cartTotal,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    submitOrders,
    submitting,
  } = useSupplierCart();

  // Handle order confirmation
  const handleConfirmOrder = async (deliveryDate: string, notes: string) => {
    if (!merchantId) return;
    const success = await submitOrders(merchantId, deliveryDate, notes);
    if (success) {
      setShowOrderModal(false);
      refetchOrders();
    }
  };

  // Handle add to cart from PriceCompareSheet
  const handleAddToCart = (offer: any, quantity: number) => {
    if (selectedProduct) {
      addToCart(selectedProduct, offer, quantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <UnifiedHeader
        title="Marché Virtuel IFN"
        subtitle="Commandez en 3 clics"
        showBack
        backTo="/marchand"
        rightContent={<Leaf className="h-5 w-5 text-secondary" />}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid w-full grid-cols-2 h-14">
          <TabsTrigger
            value="catalogue"
            className="flex items-center gap-2 text-base"
          >
            <span className="text-2xl">🛒</span>
            Catalogue
          </TabsTrigger>
          <TabsTrigger
            value="commandes"
            className="flex items-center gap-2 text-base"
          >
            <span className="text-2xl">📦</span>
            Commandes
            {pendingOrdersCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-1 h-5 min-w-5 p-0 flex items-center justify-center text-xs"
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

      {/* Floating Cart */}
      <SuppliersCart
        cart={cart}
        cartTotal={cartTotal}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onValidate={() => setShowOrderModal(true)}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmDialog
        open={showOrderModal}
        onOpenChange={setShowOrderModal}
        cart={cart}
        cartTotal={cartTotal}
        onConfirm={handleConfirmOrder}
        submitting={submitting}
      />

      {/* Product Detail Sheet */}
      <PriceCompareSheet
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Bottom Nav */}
      <UnifiedBottomNav items={merchantNavItems} />
    </div>
  );
}
