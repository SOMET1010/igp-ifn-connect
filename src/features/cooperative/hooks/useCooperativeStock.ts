/**
 * Hook pour la gestion du stock coopérative
 */
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { stockService } from '../services/stockService';
import type { CooperativeStockItem, CooperativeProduct, AddStockInput } from '../types/stock.types';
import { LOW_STOCK_THRESHOLD } from '../types/stock.types';

export function useCooperativeStock(userId: string | undefined) {
  const [stocks, setStocks] = useState<CooperativeStockItem[]>([]);
  const [products, setProducts] = useState<CooperativeProduct[]>([]);
  const [cooperativeId, setCooperativeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingStock, setIsCheckingStock] = useState(false);

  const refreshStocks = useCallback(async (coopId: string) => {
    const stocksData = await stockService.getStocks(coopId);
    setStocks(stocksData);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      const coopId = await stockService.getCooperativeId(userId);
      
      if (coopId) {
        setCooperativeId(coopId);
        await refreshStocks(coopId);
      }

      const allProducts = await stockService.getProducts();
      setProducts(allProducts);
      setIsLoading(false);
    };

    fetchData();
  }, [userId, refreshStocks]);

  const addStock = useCallback(async (data: AddStockInput): Promise<boolean> => {
    if (!cooperativeId) return false;

    setIsSaving(true);
    try {
      await stockService.addStock(cooperativeId, data);
      toast.success('Stock ajouté avec succès');
      await refreshStocks(cooperativeId);
      return true;
    } catch {
      toast.error('Erreur lors de l\'ajout');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [cooperativeId, refreshStocks]);

  const checkLowStock = useCallback(async () => {
    setIsCheckingStock(true);
    try {
      const { lowStockCount } = await stockService.checkLowStock();
      if (lowStockCount > 0) {
        toast.info(`${lowStockCount} produit(s) en stock bas`);
      } else {
        toast.success("Tous les stocks sont OK !");
      }
    } catch {
      toast.error("Erreur lors de la vérification du stock");
    } finally {
      setIsCheckingStock(false);
    }
  }, []);

  const lowStockItems = stocks.filter(stock => stock.quantity < LOW_STOCK_THRESHOLD);

  return {
    stocks,
    products,
    isLoading,
    isSaving,
    isCheckingStock,
    addStock,
    checkLowStock,
    lowStockItems,
  };
}
