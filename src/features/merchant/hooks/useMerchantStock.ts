/**
 * Hook de gestion du stock marchand
 * Refactoré pour utiliser stockService
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { merchantLogger } from "@/infra/logger";
import { withRetry } from "@/hooks/useRetryOperation";
import { stockService } from "../services/stockService";
import type { StockItem, Product, ProductCategory } from "../types/stock.types";

interface UseMerchantStockResult {
  stocks: StockItem[];
  products: Product[];
  categories: ProductCategory[];
  merchantId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  isCheckingStock: boolean;
  availableProducts: Product[];
  fetchData: () => Promise<void>;
  addStock: (data: { productId: string; quantity: number; minThreshold: number; unitPrice: number | null }) => Promise<boolean>;
  updateStock: (stockId: string, data: { quantity: number; minThreshold: number; unitPrice: number | null }) => Promise<boolean>;
  restockItem: (stockId: string, currentQuantity: number, addQuantity: number) => Promise<boolean>;
  deleteStock: (stockId: string) => Promise<boolean>;
  checkLowStock: () => Promise<void>;
}

export function useMerchantStock(): UseMerchantStockResult {
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingStock, setIsCheckingStock] = useState(false);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [merchantId, setMerchantId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const mId = await stockService.getMerchantId(user.id);
      if (!mId) {
        setIsLoading(false);
        return;
      }

      setMerchantId(mId);

      const [stocksData, productsData, categoriesData] = await Promise.all([
        stockService.getStocks(mId),
        stockService.getProducts(),
        stockService.getCategories(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);

      // Merge stocks avec les produits
      const mergedStocks = stocksData.map(stock => ({
        ...stock,
        product: productsData.find(p => p.id === stock.product_id)
      }));
      setStocks(mergedStocks);
    } catch (error) {
      merchantLogger.error("Error fetching stock data", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const availableProducts = products.filter(p => 
    !stocks.some(s => s.product_id === p.id)
  );

  const addStock = useCallback(async (data: { 
    productId: string; 
    quantity: number; 
    minThreshold: number; 
    unitPrice: number | null 
  }): Promise<boolean> => {
    if (!merchantId) return false;

    setIsSaving(true);

    try {
      await withRetry(async () => {
        await stockService.addStock({
          merchantId,
          productId: data.productId,
          quantity: data.quantity,
          minThreshold: data.minThreshold,
          unitPrice: data.unitPrice,
        });
      }, { maxRetries: 3, baseDelay: 1000 });

      toast.success("Produit ajouté au stock");
      fetchData();
      return true;
    } catch (error) {
      merchantLogger.error("Error adding stock", error);
      toast.error("Erreur lors de l'ajout. Réessayez.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [merchantId, fetchData]);

  const updateStock = useCallback(async (
    stockId: string, 
    data: { quantity: number; minThreshold: number; unitPrice: number | null }
  ): Promise<boolean> => {
    setIsSaving(true);

    try {
      await withRetry(async () => {
        await stockService.updateStock(stockId, {
          quantity: data.quantity,
          minThreshold: data.minThreshold,
          unitPrice: data.unitPrice,
        });
      }, { maxRetries: 3, baseDelay: 1000 });

      toast.success("Stock modifié");
      fetchData();
      return true;
    } catch (error) {
      merchantLogger.error("Error updating stock", error);
      toast.error("Erreur lors de la modification. Réessayez.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [fetchData]);

  const restockItem = useCallback(async (
    stockId: string, 
    currentQuantity: number, 
    addQuantity: number
  ): Promise<boolean> => {
    setIsSaving(true);

    try {
      await withRetry(async () => {
        await stockService.restockItem(stockId, currentQuantity + addQuantity);
      }, { maxRetries: 3, baseDelay: 1000 });

      toast.success("Stock mis à jour");
      fetchData();
      return true;
    } catch (error) {
      merchantLogger.error("Error restocking", error);
      toast.error("Erreur lors du réapprovisionnement. Réessayez.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [fetchData]);

  const deleteStock = useCallback(async (stockId: string): Promise<boolean> => {
    try {
      await stockService.deleteStock(stockId);
      toast.success("Produit retiré du stock");
      fetchData();
      return true;
    } catch (error) {
      merchantLogger.error("Error deleting stock", error);
      toast.error("Erreur lors de la suppression");
      return false;
    }
  }, [fetchData]);

  const checkLowStock = useCallback(async () => {
    setIsCheckingStock(true);
    try {
      const data = await stockService.checkLowStock();
      if (data?.lowStockCount > 0) {
        toast.info(`${data.lowStockCount} produit(s) en stock bas détecté(s)`);
      } else {
        toast.success("Tous les stocks sont OK !");
      }
    } catch (err) {
      merchantLogger.error("Error checking low stock", err);
      toast.error("Erreur de connexion");
    } finally {
      setIsCheckingStock(false);
    }
  }, []);

  return {
    stocks,
    products,
    categories,
    merchantId,
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
  };
}
