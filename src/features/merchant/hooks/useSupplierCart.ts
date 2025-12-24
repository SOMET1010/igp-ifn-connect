// ============================================
// Hook - useSupplierCart
// ============================================

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { suppliersService } from "../services/suppliersService";
import type { CartItem, Product, ProductOffer } from "../types/suppliers.types";

interface UseSupplierCartReturn {
  cart: CartItem[];
  cartTotal: number;
  cartItemCount: number;
  
  // Actions
  addToCart: (product: Product, offer: ProductOffer, quantity: number) => void;
  updateCartQuantity: (stockId: string, delta: number) => void;
  removeFromCart: (stockId: string) => void;
  clearCart: () => void;
  
  // Order submission
  submitOrders: (
    merchantId: string,
    deliveryDate?: string,
    notes?: string
  ) => Promise<boolean>;
  submitting: boolean;
}

export function useSupplierCart(): UseSupplierCartReturn {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Add to cart
  const addToCart = useCallback(
    (product: Product, offer: ProductOffer, quantity: number) => {
      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.stockId === offer.stockId
        );

        if (existingIndex >= 0) {
          const newCart = [...prev];
          const newQty = Math.min(
            newCart[existingIndex].quantity + quantity,
            offer.quantity
          );
          newCart[existingIndex].quantity = newQty;
          return newCart;
        }

        return [
          ...prev,
          {
            cooperativeId: offer.cooperativeId,
            cooperativeName: offer.cooperativeName,
            productId: product.id,
            productName: product.name,
            quantity: Math.min(quantity, offer.quantity),
            unitPrice: offer.price,
            unit: product.unit,
            stockId: offer.stockId,
            maxQuantity: offer.quantity,
          },
        ];
      });

      toast.success(`${product.name} ajouté au panier`);
    },
    []
  );

  // Update quantity
  const updateCartQuantity = useCallback((stockId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.stockId === stockId) {
          const newQty = Math.max(
            1,
            Math.min(item.quantity + delta, item.maxQuantity)
          );
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  }, []);

  // Remove from cart
  const removeFromCart = useCallback((stockId: string) => {
    setCart((prev) => prev.filter((item) => item.stockId !== stockId));
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Calculate total
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  // Submit orders
  const submitOrders = useCallback(
    async (
      merchantId: string,
      deliveryDate?: string,
      notes?: string
    ): Promise<boolean> => {
      if (!merchantId || cart.length === 0) return false;

      setSubmitting(true);

      try {
        await suppliersService.submitOrders({
          merchantId,
          cart,
          deliveryDate,
          notes,
        });

        // Success feedback
        if ("vibrate" in navigator) {
          navigator.vibrate([100, 50, 100, 50, 200]);
        }

        toast.success("Commandes passées avec succès !");
        setCart([]);
        return true;
      } catch {
        toast.error("Erreur lors de la commande");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [cart]
  );

  return {
    cart,
    cartTotal,
    cartItemCount: cart.length,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    submitOrders,
    submitting,
  };
}
