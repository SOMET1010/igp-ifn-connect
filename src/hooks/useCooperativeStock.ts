import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { coopLogger } from '@/infra/logger';
export interface CooperativeStockItem {
  id: string;
  quantity: number;
  unit_price: number | null;
  harvest_date: string | null;
  expiry_date: string | null;
  product: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface CooperativeProduct {
  id: string;
  name: string;
  unit: string;
}

const LOW_STOCK_THRESHOLD = 10;

export function useCooperativeStock(userId: string | undefined) {
  const [stocks, setStocks] = useState<CooperativeStockItem[]>([]);
  const [products, setProducts] = useState<CooperativeProduct[]>([]);
  const [cooperativeId, setCooperativeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingStock, setIsCheckingStock] = useState(false);

  const fetchStocks = useCallback(async (coopId: string) => {
    const { data: stocksData } = await supabase
      .from('stocks')
      .select('id, quantity, unit_price, harvest_date, expiry_date, product_id')
      .eq('cooperative_id', coopId);

    if (stocksData) {
      const productIds = stocksData.map(s => s.product_id);
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, unit')
        .in('id', productIds);

      const stocksWithProducts = stocksData.map(stock => ({
        ...stock,
        product: productsData?.find(p => p.id === stock.product_id) ?? { id: stock.product_id, name: 'Produit', unit: 'kg' }
      }));

      setStocks(stocksWithProducts);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      const { data: coopData } = await supabase
        .from('cooperatives')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (coopData) {
        setCooperativeId(coopData.id);
        await fetchStocks(coopData.id);
      }

      const { data: allProducts } = await supabase
        .from('products')
        .select('id, name, unit')
        .order('name');
      
      if (allProducts) {
        setProducts(allProducts);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [userId, fetchStocks]);

  const addStock = useCallback(async (data: {
    productId: string;
    quantity: number;
    unitPrice: number | null;
  }): Promise<boolean> => {
    if (!cooperativeId) return false;

    setIsSaving(true);

    const { error } = await supabase
      .from('stocks')
      .insert({
        cooperative_id: cooperativeId,
        product_id: data.productId,
        quantity: data.quantity,
        unit_price: data.unitPrice,
      });

    if (error) {
      toast.error('Erreur lors de l\'ajout');
      setIsSaving(false);
      return false;
    }

    toast.success('Stock ajouté avec succès');
    await fetchStocks(cooperativeId);
    setIsSaving(false);
    return true;
  }, [cooperativeId, fetchStocks]);

  const checkLowStock = useCallback(async () => {
    setIsCheckingStock(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-low-stock', {
        body: { type: 'cooperative' }
      });
      
      if (error) {
        coopLogger.error("Error checking stock", error);
        toast.error("Erreur lors de la vérification du stock");
      } else {
        if (data?.cooperative?.lowStockCount > 0) {
          toast.info(`${data.cooperative.lowStockCount} produit(s) en stock bas`);
        } else {
          toast.success("Tous les stocks sont OK !");
        }
      }
    } catch (err) {
      coopLogger.error("Check low stock failed", err);
      toast.error("Erreur de connexion");
    }
    setIsCheckingStock(false);
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
