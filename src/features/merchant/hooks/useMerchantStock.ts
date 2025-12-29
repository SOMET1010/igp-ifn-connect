/**
 * Hook de gestion du stock marchand
 * Migré vers TanStack Query pour standardisation et cache automatique
 */

import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { merchantLogger } from "@/infra/logger";
import { stockService } from "../services/stockService";
import type { StockItem, Product, ProductCategory } from "../types/stock.types";

interface StockWithProduct extends StockItem {
  product?: Product;
}

interface UseMerchantStockResult {
  stocks: StockWithProduct[];
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
  const queryClient = useQueryClient();

  // Query pour l'ID du marchand
  const { data: merchantId = null } = useQuery({
    queryKey: ['merchant-id', user?.id],
    queryFn: async () => {
      if (!user) return null;
      return stockService.getMerchantId(user.id);
    },
    enabled: !!user,
    staleTime: Infinity,
  });

  // Query pour les produits
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => stockService.getProducts(),
    staleTime: 5 * 60_000,
  });

  // Query pour les catégories
  const { data: categories = [] } = useQuery<ProductCategory[]>({
    queryKey: ['product-categories'],
    queryFn: () => stockService.getCategories(),
    staleTime: 5 * 60_000,
  });

  // Query pour les stocks
  const { 
    data: rawStocks = [], 
    isLoading,
    refetch,
  } = useQuery<StockItem[]>({
    queryKey: ['merchant-stocks', merchantId],
    queryFn: () => {
      if (!merchantId) return [];
      return stockService.getStocks(merchantId);
    },
    enabled: !!merchantId,
    staleTime: 30_000,
  });

  // Merge stocks avec produits (mémoïsé)
  const stocks: StockWithProduct[] = useMemo(() => 
    rawStocks.map(stock => ({
      ...stock,
      product: products.find(p => p.id === stock.product_id)
    })),
    [rawStocks, products]
  );

  // Produits disponibles (non encore en stock)
  const availableProducts = useMemo(() => 
    products.filter(p => !stocks.some(s => s.product_id === p.id)),
    [products, stocks]
  );

  // Wrapper pour fetchData (compatibilité)
  const fetchData = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Mutation pour ajouter un stock
  const addStockMutation = useMutation({
    mutationFn: async (data: { productId: string; quantity: number; minThreshold: number; unitPrice: number | null }) => {
      if (!merchantId) throw new Error('Merchant ID not found');
      await stockService.addStock({
        merchantId,
        productId: data.productId,
        quantity: data.quantity,
        minThreshold: data.minThreshold,
        unitPrice: data.unitPrice,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-stocks', merchantId] });
      toast.success("Produit ajouté au stock");
    },
    onError: (error: Error) => {
      merchantLogger.error("Error adding stock", error);
      toast.error("Erreur lors de l'ajout. Réessayez.");
    },
  });

  // Mutation pour mettre à jour un stock
  const updateStockMutation = useMutation({
    mutationFn: async ({ stockId, data }: { stockId: string; data: { quantity: number; minThreshold: number; unitPrice: number | null } }) => {
      await stockService.updateStock(stockId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-stocks', merchantId] });
      toast.success("Stock modifié");
    },
    onError: (error: Error) => {
      merchantLogger.error("Error updating stock", error);
      toast.error("Erreur lors de la modification. Réessayez.");
    },
  });

  // Mutation pour réapprovisionner
  const restockMutation = useMutation({
    mutationFn: async ({ stockId, newQuantity }: { stockId: string; newQuantity: number }) => {
      await stockService.restockItem(stockId, newQuantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-stocks', merchantId] });
      toast.success("Stock mis à jour");
    },
    onError: (error: Error) => {
      merchantLogger.error("Error restocking", error);
      toast.error("Erreur lors du réapprovisionnement. Réessayez.");
    },
  });

  // Mutation pour supprimer un stock
  const deleteStockMutation = useMutation({
    mutationFn: (stockId: string) => stockService.deleteStock(stockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-stocks', merchantId] });
      toast.success("Produit retiré du stock");
    },
    onError: (error: Error) => {
      merchantLogger.error("Error deleting stock", error);
      toast.error("Erreur lors de la suppression");
    },
  });

  // Mutation pour vérifier les stocks bas
  const checkLowStockMutation = useMutation({
    mutationFn: () => stockService.checkLowStock(),
    onSuccess: (data) => {
      if (data?.lowStockCount > 0) {
        toast.info(`${data.lowStockCount} produit(s) en stock bas détecté(s)`);
      } else {
        toast.success("Tous les stocks sont OK !");
      }
    },
    onError: (error: Error) => {
      merchantLogger.error("Error checking low stock", error);
      toast.error("Erreur de connexion");
    },
  });

  // Wrappers pour compatibilité avec l'ancienne API
  const addStock = useCallback(async (data: { productId: string; quantity: number; minThreshold: number; unitPrice: number | null }): Promise<boolean> => {
    try {
      await addStockMutation.mutateAsync(data);
      return true;
    } catch {
      return false;
    }
  }, [addStockMutation]);

  const updateStock = useCallback(async (stockId: string, data: { quantity: number; minThreshold: number; unitPrice: number | null }): Promise<boolean> => {
    try {
      await updateStockMutation.mutateAsync({ stockId, data });
      return true;
    } catch {
      return false;
    }
  }, [updateStockMutation]);

  const restockItem = useCallback(async (stockId: string, currentQuantity: number, addQuantity: number): Promise<boolean> => {
    try {
      await restockMutation.mutateAsync({ stockId, newQuantity: currentQuantity + addQuantity });
      return true;
    } catch {
      return false;
    }
  }, [restockMutation]);

  const deleteStock = useCallback(async (stockId: string): Promise<boolean> => {
    try {
      await deleteStockMutation.mutateAsync(stockId);
      return true;
    } catch {
      return false;
    }
  }, [deleteStockMutation]);

  const checkLowStock = useCallback(async () => {
    await checkLowStockMutation.mutateAsync();
  }, [checkLowStockMutation]);

  const isSaving = addStockMutation.isPending || updateStockMutation.isPending || restockMutation.isPending;
  const isCheckingStock = checkLowStockMutation.isPending;

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
