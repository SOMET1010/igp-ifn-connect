import { useState, useEffect, useCallback } from "react";
import type { SelectedProduct } from "../types/transaction.types";

const SCANNED_PRODUCTS_KEY = "scannedProducts";

interface ScannedProductRaw {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  stock_quantity: number;
}

/**
 * Hook pour récupérer et gérer les produits scannés depuis sessionStorage
 * Utilisé pour la liaison Scanner → Encaissement
 */
export function useScannedProducts() {
  const [scannedProducts, setScannedProducts] = useState<SelectedProduct[]>([]);
  const [hasScannedProducts, setHasScannedProducts] = useState(false);

  // Charger les produits scannés au montage
  useEffect(() => {
    const raw = sessionStorage.getItem(SCANNED_PRODUCTS_KEY);
    if (raw) {
      try {
        const parsed: ScannedProductRaw[] = JSON.parse(raw);
        // Mapper vers le format SelectedProduct
        const mapped: SelectedProduct[] = parsed.map((p) => ({
          stockId: p.id, // Le scanner stocke product_id dans id
          productId: p.id,
          productName: p.name,
          quantity: p.quantity,
          unitPrice: p.unit_price,
          imageUrl: null,
        }));
        setScannedProducts(mapped);
        setHasScannedProducts(mapped.length > 0);
      } catch {
        // JSON invalide, ignorer
        setScannedProducts([]);
        setHasScannedProducts(false);
      }
    }
  }, []);

  // Effacer les produits scannés de sessionStorage
  const clearScannedProducts = useCallback(() => {
    sessionStorage.removeItem(SCANNED_PRODUCTS_KEY);
    setScannedProducts([]);
    setHasScannedProducts(false);
  }, []);

  return {
    scannedProducts,
    hasScannedProducts,
    clearScannedProducts,
  };
}
