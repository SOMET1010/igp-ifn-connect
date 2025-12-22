import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { merchantLogger } from "@/infra/logger";
import type { StockItem, Product, ProductCategory } from "@/components/merchant/stock/types";

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
      const { data: merchantData } = await supabase
        .from("merchants")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!merchantData) {
        setIsLoading(false);
        return;
      }

      setMerchantId(merchantData.id);

      const [stocksRes, productsRes, categoriesRes] = await Promise.all([
        supabase.from("merchant_stocks").select("*").eq("merchant_id", merchantData.id),
        supabase.from("products").select("*"),
        supabase.from("product_categories").select("*"),
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);

      if (stocksRes.data && productsRes.data) {
        const mergedStocks = stocksRes.data.map(stock => ({
          ...stock,
          product: productsRes.data.find(p => p.id === stock.product_id)
        }));
        setStocks(mergedStocks);
      }
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

    const { error } = await supabase.from("merchant_stocks").insert({
      merchant_id: merchantId,
      product_id: data.productId,
      quantity: data.quantity,
      min_threshold: data.minThreshold,
      unit_price: data.unitPrice,
      last_restocked_at: new Date().toISOString(),
    });

    setIsSaving(false);

    if (error) {
      merchantLogger.error("Error adding stock", error);
      toast.error("Erreur lors de l'ajout");
      return false;
    }

    toast.success("Produit ajouté au stock");
    fetchData();
    return true;
  }, [merchantId, fetchData]);

  const updateStock = useCallback(async (
    stockId: string, 
    data: { quantity: number; minThreshold: number; unitPrice: number | null }
  ): Promise<boolean> => {
    setIsSaving(true);

    const { error } = await supabase
      .from("merchant_stocks")
      .update({
        quantity: data.quantity,
        min_threshold: data.minThreshold,
        unit_price: data.unitPrice,
      })
      .eq("id", stockId);

    setIsSaving(false);

    if (error) {
      merchantLogger.error("Error updating stock", error);
      toast.error("Erreur lors de la modification");
      return false;
    }

    toast.success("Stock modifié");
    fetchData();
    return true;
  }, [fetchData]);

  const restockItem = useCallback(async (
    stockId: string, 
    currentQuantity: number, 
    addQuantity: number
  ): Promise<boolean> => {
    setIsSaving(true);

    const { error } = await supabase
      .from("merchant_stocks")
      .update({
        quantity: currentQuantity + addQuantity,
        last_restocked_at: new Date().toISOString(),
      })
      .eq("id", stockId);

    setIsSaving(false);

    if (error) {
      merchantLogger.error("Error restocking", error);
      toast.error("Erreur lors du réapprovisionnement");
      return false;
    }

    toast.success("Stock mis à jour");
    fetchData();
    return true;
  }, [fetchData]);

  const deleteStock = useCallback(async (stockId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("merchant_stocks")
      .delete()
      .eq("id", stockId);

    if (error) {
      merchantLogger.error("Error deleting stock", error);
      toast.error("Erreur lors de la suppression");
      return false;
    }

    toast.success("Produit retiré du stock");
    fetchData();
    return true;
  }, [fetchData]);

  const checkLowStock = useCallback(async () => {
    setIsCheckingStock(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-low-stock');
      
      if (error) {
        merchantLogger.error("Error checking stock", error);
        toast.error("Erreur lors de la vérification du stock");
      } else if (data?.lowStockCount > 0) {
        toast.info(`${data.lowStockCount} produit(s) en stock bas détecté(s)`);
      } else {
        toast.success("Tous les stocks sont OK !");
      }
    } catch (err) {
      merchantLogger.error("Error checking low stock", err);
      toast.error("Erreur de connexion");
    }
    setIsCheckingStock(false);
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
