// ============================================
// Service - Merchant Suppliers API
// ============================================

import { supabase } from "@/integrations/supabase/client";
import { calculateDistance } from "@/lib/geoUtils";
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

    // Group cart items by cooperative
    const ordersByCooperative: Record<string, typeof cart> = {};
    cart.forEach((item) => {
      if (!ordersByCooperative[item.cooperativeId]) {
        ordersByCooperative[item.cooperativeId] = [];
      }
      ordersByCooperative[item.cooperativeId].push(item);
    });

    // Create orders for each cooperative
    const orderPromises = Object.entries(ordersByCooperative).flatMap(
      ([coopId, items]) =>
        items.map((item) =>
          supabase.from("orders").insert({
            merchant_id: merchantId,
            cooperative_id: coopId,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total_amount: item.quantity * item.unitPrice,
            status: "pending",
            delivery_date: deliveryDate || null,
            notes: notes || null,
          })
        )
    );

    await Promise.all(orderPromises);
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
