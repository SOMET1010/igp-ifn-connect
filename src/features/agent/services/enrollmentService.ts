import { supabase } from "@/integrations/supabase/client";

export interface EnrollmentSubmitData {
  cmu_number: string;
  full_name: string;
  phone: string;
  dob: string;
  activity_type: string;
  activity_description?: string;
  market_id: string;
  latitude: number | null;
  longitude: number | null;
  cmu_photo_url: string | null;
  location_photo_url: string | null;
  id_doc_type: string;
  id_doc_number: string;
  id_doc_photo_url: string | null;
  has_cnps: boolean;
  cnps_number: string | null;
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
  async submitEnrollment(submitData: EnrollmentSubmitData): Promise<string> {
    const { data: merchant, error } = await supabase
      .from("merchants")
      .insert({
        cmu_number: submitData.cmu_number,
        full_name: submitData.full_name,
        phone: submitData.phone,
        dob: submitData.dob,
        activity_type: submitData.activity_type,
        activity_description: submitData.activity_description || null,
        market_id: submitData.market_id,
        latitude: submitData.latitude,
        longitude: submitData.longitude,
        cmu_photo_url: submitData.cmu_photo_url,
        location_photo_url: submitData.location_photo_url,
        id_doc_type: submitData.id_doc_type,
        id_doc_number: submitData.id_doc_number,
        cnps_number: submitData.cnps_number,
        enrolled_by: submitData.enrolled_by,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) throw error;

    // Note: merchant_documents table insertion will be handled when types are regenerated
    // For now, the id_doc fields are stored directly on the merchant

    // Increment agent's enrollment count
    const { data: agentData } = await supabase
      .from("agents")
      .select("total_enrollments")
      .eq("id", submitData.enrolled_by)
      .single();

    if (agentData) {
      await supabase
        .from("agents")
        .update({ total_enrollments: (agentData.total_enrollments || 0) + 1 })
        .eq("id", submitData.enrolled_by);
    }

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

  /**
   * Check if a phone number is already registered
   */
  async isPhoneUnique(phone: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("merchants")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (error) {
      console.error("Error checking phone:", error);
      return true;
    }

    return !data;
  },
};
