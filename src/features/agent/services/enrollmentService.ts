import { supabase } from "@/integrations/supabase/client";
import type { EnrollmentData } from "../types/enrollment.types";

export interface EnrollmentSubmitData {
  cmu_number: string;
  full_name: string;
  phone: string;
  activity_type: string;
  activity_description: string;
  market_id: string;
  latitude: number | null;
  longitude: number | null;
  cmu_photo_url?: string;
  location_photo_url?: string;
  enrolled_by: string;
}

export const enrollmentService = {
  /**
   * Get agent ID for a user
   */
  async getAgentId(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("agents")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data?.id ?? null;
  },

  /**
   * Submit a merchant enrollment
   */
  async submitEnrollment(data: EnrollmentSubmitData): Promise<string> {
    const { data: merchant, error } = await supabase
      .from("merchants")
      .insert({
        cmu_number: data.cmu_number,
        full_name: data.full_name,
        phone: data.phone,
        activity_type: data.activity_type,
        activity_description: data.activity_description || null,
        market_id: data.market_id,
        latitude: data.latitude,
        longitude: data.longitude,
        cmu_photo_url: data.cmu_photo_url || null,
        location_photo_url: data.location_photo_url || null,
        enrolled_by: data.enrolled_by,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) throw error;
    return merchant.id;
  },

  /**
   * Fetch available markets
   */
  async getMarkets(): Promise<{ id: string; name: string; commune: string; region: string }[]> {
    const { data, error } = await supabase
      .from("markets")
      .select("id, name, commune, region")
      .order("name");

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Fetch product categories
   */
  async getProductCategories(): Promise<{ id: string; name: string; icon: string | null; color: string | null }[]> {
    const { data, error } = await supabase
      .from("product_categories")
      .select("id, name, icon, color")
      .order("name");

    if (error) throw error;
    return data ?? [];
  },
};
