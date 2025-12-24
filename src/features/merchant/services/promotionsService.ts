import { supabase } from "@/integrations/supabase/client";
import type { Promotion, NewPromotionInput } from "../types/promotions.types";

export const promotionsService = {
  async getMerchantId(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data?.id ?? null;
  },

  async fetchPromotions(merchantId: string): Promise<Promotion[]> {
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Promotion[];
  },

  async createPromotion(merchantId: string, input: NewPromotionInput): Promise<Promotion> {
    const { data, error } = await supabase
      .from("promotions")
      .insert({
        merchant_id: merchantId,
        name: input.name,
        description: input.description || null,
        discount_type: input.discount_type,
        discount_value: input.discount_value,
        min_purchase: input.min_purchase ?? null,
        start_date: input.start_date,
        end_date: input.end_date,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Promotion;
  },

  async togglePromotion(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from("promotions")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (error) throw error;
  },

  async deletePromotion(id: string): Promise<void> {
    const { error } = await supabase.from("promotions").delete().eq("id", id);

    if (error) throw error;
  },
};
