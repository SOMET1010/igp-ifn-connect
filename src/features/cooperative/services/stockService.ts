/**
 * Service API pour les opérations de stock coopérative
 */
import { supabase } from "@/integrations/supabase/client";
import { coopLogger } from "@/infra/logger";
import type { CooperativeStockItem, CooperativeProduct, AddStockInput } from "../types/stock.types";

export const stockService = {
  /**
   * Récupère l'ID de la coopérative pour un utilisateur
   */
  async getCooperativeId(userId: string): Promise<string | null> {
    const { data } = await supabase
      .from('cooperatives')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    return data?.id ?? null;
  },

  /**
   * Récupère tous les stocks d'une coopérative
   */
  async getStocks(cooperativeId: string): Promise<CooperativeStockItem[]> {
    const { data: stocksData } = await supabase
      .from('stocks')
      .select('id, quantity, unit_price, harvest_date, expiry_date, product_id')
      .eq('cooperative_id', cooperativeId);

    if (!stocksData) return [];

    const productIds = stocksData.map(s => s.product_id);
    const { data: productsData } = await supabase
      .from('products')
      .select('id, name, unit')
      .in('id', productIds);

    return stocksData.map(stock => ({
      ...stock,
      product: productsData?.find(p => p.id === stock.product_id) ?? { 
        id: stock.product_id, 
        name: 'Produit', 
        unit: 'kg' 
      }
    }));
  },

  /**
   * Récupère tous les produits disponibles
   */
  async getProducts(): Promise<CooperativeProduct[]> {
    const { data } = await supabase
      .from('products')
      .select('id, name, unit')
      .order('name');
    
    return data ?? [];
  },

  /**
   * Ajoute un nouveau stock
   */
  async addStock(cooperativeId: string, data: AddStockInput): Promise<void> {
    const { error } = await supabase
      .from('stocks')
      .insert({
        cooperative_id: cooperativeId,
        product_id: data.productId,
        quantity: data.quantity,
        unit_price: data.unitPrice,
      });

    if (error) {
      coopLogger.error('Failed to add stock', { error });
      throw error;
    }
  },

  /**
   * Vérifie les stocks bas
   */
  async checkLowStock(): Promise<{ lowStockCount: number }> {
    const { data, error } = await supabase.functions.invoke('check-low-stock', {
      body: { type: 'cooperative' }
    });
    
    if (error) {
      coopLogger.error("Error checking stock", error);
      throw error;
    }
    
    return { lowStockCount: data?.cooperative?.lowStockCount ?? 0 };
  },
};
