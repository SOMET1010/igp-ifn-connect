// ============================================
// Service - Merchant Suppliers API
// ============================================

import { supabase } from "@/integrations/supabase/client";
import { calculateDistance } from "@/shared/lib";
import type {
  Category,
  Cooperative,
  SupplierOrder,
  UserLocation,
  SubmitOrderInput,
  Product,
  ProductOffer,
} from "../types/suppliers.types";

export const suppliersService = {
  /**
   * Récupère le merchant_id pour un user_id
   */
  async getMerchantId(userId: string): Promise<string | null> {
    const { data } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", userId)
      .single();

    return data?.id ?? null;
  },

  /**
   * Récupère les catégories de produits
   */
  async fetchCategories(): Promise<Category[]> {
    const { data } = await supabase
      .from("product_categories")
      .select("id, name, icon, color");

    return data ?? [];
  },

  /**
   * Récupère les coopératives
   */
  async fetchCooperatives(): Promise<Cooperative[]> {
    const { data } = await supabase
      .from("cooperatives")
      .select("id, name, region, commune, latitude, longitude");

    return data ?? [];
  },

  /**
   * Récupère les produits avec leurs stocks et offres
   */
  async fetchProducts(
    cooperatives: Cooperative[],
    userLocation: UserLocation | null
  ): Promise<Product[]> {
    const { data: productsData } = await supabase
      .from("products")
      .select(
        `
        id, name, unit, image_url, category_id,
        stocks (
          id, quantity, unit_price, cooperative_id
        )
      `
      )
      .gt("stocks.quantity", 0);

    if (!productsData) return [];

    // Transform products with offers
    return productsData
      .filter((p: any) => p.stocks && p.stocks.length > 0)
      .map((p: any) => {
        const offers: ProductOffer[] = p.stocks.map((stock: any) => {
          const coop = cooperatives.find((c) => c.id === stock.cooperative_id);
          let distance: number | undefined;

          if (userLocation && coop?.latitude && coop?.longitude) {
            distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              Number(coop.latitude),
              Number(coop.longitude)
            );
          }

          return {
            stockId: stock.id,
            cooperativeId: stock.cooperative_id,
            cooperativeName: coop?.name || "Coopérative",
            price: stock.unit_price || 0,
            quantity: stock.quantity,
            distance,
          };
        });

        return {
          id: p.id,
          name: p.name,
          unit: p.unit,
          isIfn: true,
          imageUrl: p.image_url,
          categoryId: p.category_id,
          offers,
        };
      });
  },

  /**
   * Récupère les commandes d'un marchand
   */
  async fetchOrders(merchantId: string): Promise<SupplierOrder[]> {
    const { data } = await supabase
      .from("orders")
      .select(
        `
        id, quantity, unit_price, total_amount, status, delivery_date, created_at, notes,
        cooperatives (name),
        products (name, unit)
      `
      )
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false });

    return (data as SupplierOrder[]) ?? [];
  },

  /**
   * Soumet les commandes du panier
   */
  async submitOrders(input: SubmitOrderInput): Promise<void> {
    const { merchantId, cart, deliveryDate, notes } = input;

    // Group by cooperative
    const byCooperative = cart.reduce(
      (acc, item) => {
        if (!acc[item.cooperativeId]) {
          acc[item.cooperativeId] = [];
        }
        acc[item.cooperativeId].push(item);
        return acc;
      },
      {} as Record<string, typeof cart>
    );

    // Create orders for each cooperative
    for (const [cooperativeId, items] of Object.entries(byCooperative)) {
      for (const item of items) {
        const totalAmount = item.quantity * item.unitPrice;

        // Insert order
        const { error: orderError } = await supabase.from("orders").insert({
          merchant_id: merchantId,
          cooperative_id: cooperativeId,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_amount: totalAmount,
          delivery_date: deliveryDate || null,
          notes: notes || null,
        });

        if (orderError) throw orderError;

        // Decrement stock using the SQL function
        const { error: stockError } = await supabase.rpc("decrement_stock", {
          p_stock_id: item.stockId,
          p_quantity: item.quantity,
        });

        if (stockError) {
          console.error("Error decrementing stock:", stockError);
          // Don't throw - order was created, stock update failed
          // This prevents orphan orders while still logging the issue
        }
      }
    }
  },

  /**
   * Annule une commande
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);

    return !error;
  },
};
