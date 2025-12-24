/**
 * Service dédié aux opérations de stock marchand
 * Isolation des appels API Supabase
 */

import { supabase } from "@/integrations/supabase/client";
import { merchantLogger } from "@/infra/logger";
import type { Product, ProductCategory, StockItem, AddStockInput, UpdateStockInput } from "../types/stock.types";

export const stockService = {
  /**
   * Récupère l'ID du marchand pour un utilisateur
   */
  async getMerchantId(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      merchantLogger.error("Error fetching merchant ID", error);
      throw error;
    }

    return data?.id ?? null;
  },

  /**
   * Récupère tous les stocks d'un marchand
   */
  async getStocks(merchantId: string): Promise<StockItem[]> {
    const { data, error } = await supabase
      .from("merchant_stocks")
      .select("*")
      .eq("merchant_id", merchantId);

    if (error) {
      merchantLogger.error("Error fetching stocks", error);
      throw error;
    }

    return data ?? [];
  },

  /**
   * Récupère tous les produits disponibles
   */
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) {
      merchantLogger.error("Error fetching products", error);
      throw error;
    }

    return data ?? [];
  },

  /**
   * Récupère toutes les catégories de produits
   */
  async getCategories(): Promise<ProductCategory[]> {
    const { data, error } = await supabase
      .from("product_categories")
      .select("*");

    if (error) {
      merchantLogger.error("Error fetching categories", error);
      throw error;
    }

    return data ?? [];
  },

  /**
   * Ajoute un nouveau stock
   */
  async addStock(input: AddStockInput): Promise<void> {
    const { error } = await supabase.from("merchant_stocks").insert({
      merchant_id: input.merchantId,
      product_id: input.productId,
      quantity: input.quantity,
      min_threshold: input.minThreshold,
      unit_price: input.unitPrice,
      last_restocked_at: new Date().toISOString(),
    });

    if (error) {
      merchantLogger.error("Error adding stock", error);
      throw error;
    }
  },

  /**
   * Met à jour un stock existant
   */
  async updateStock(stockId: string, input: UpdateStockInput): Promise<void> {
    const { error } = await supabase
      .from("merchant_stocks")
      .update({
        quantity: input.quantity,
        min_threshold: input.minThreshold,
        unit_price: input.unitPrice,
      })
      .eq("id", stockId);

    if (error) {
      merchantLogger.error("Error updating stock", error);
      throw error;
    }
  },

  /**
   * Réapprovisionne un stock
   */
  async restockItem(stockId: string, newQuantity: number): Promise<void> {
    const { error } = await supabase
      .from("merchant_stocks")
      .update({
        quantity: newQuantity,
        last_restocked_at: new Date().toISOString(),
      })
      .eq("id", stockId);

    if (error) {
      merchantLogger.error("Error restocking", error);
      throw error;
    }
  },

  /**
   * Supprime un stock
   */
  async deleteStock(stockId: string): Promise<void> {
    const { error } = await supabase
      .from("merchant_stocks")
      .delete()
      .eq("id", stockId);

    if (error) {
      merchantLogger.error("Error deleting stock", error);
      throw error;
    }
  },

  /**
   * Vérifie les stocks bas via edge function
   */
  async checkLowStock(): Promise<{ lowStockCount: number }> {
    const { data, error } = await supabase.functions.invoke("check-low-stock");

    if (error) {
      merchantLogger.error("Error checking low stock", error);
      throw error;
    }

    return data;
  },
};
