import { supabase } from "@/integrations/supabase/client";
import type { DailySession, OpenSessionInput, CloseSessionInput } from "../types/dailySession.types";

export const dailySessionService = {
  /**
   * Récupère la session du jour pour un marchand
   */
  async getTodaySession(merchantId: string): Promise<DailySession | null> {
    const today = new Date().toISOString().split("T")[0];
    
    const { data, error } = await supabase
      .from("merchant_daily_sessions")
      .select("*")
      .eq("merchant_id", merchantId)
      .eq("session_date", today)
      .maybeSingle();

    if (error) throw error;
    return data as DailySession | null;
  },

  /**
   * Vérifie si une session est ouverte aujourd'hui
   */
  async hasOpenSession(merchantId: string): Promise<boolean> {
    const session = await this.getTodaySession(merchantId);
    return session?.status === "open";
  },

  /**
   * Ouvre une nouvelle session de journée
   */
  async openSession(merchantId: string, input: OpenSessionInput): Promise<DailySession> {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("merchant_daily_sessions")
      .insert({
        merchant_id: merchantId,
        session_date: today,
        opening_cash: input.opening_cash,
        notes: input.notes || null,
        status: "open",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("Une session existe déjà pour aujourd'hui");
      }
      throw error;
    }

    return data as DailySession;
  },

  /**
   * Ferme la session de journée avec le récapitulatif
   */
  async closeSession(
    sessionId: string,
    merchantId: string,
    input: CloseSessionInput
  ): Promise<DailySession> {
    // 1. Récupérer les stats du jour
    const today = new Date().toISOString().split("T")[0];
    const startOfDay = `${today}T00:00:00.000Z`;
    const endOfDay = `${today}T23:59:59.999Z`;

    // Récupérer la session actuelle
    const { data: session, error: sessionError } = await supabase
      .from("merchant_daily_sessions")
      .select("opening_cash")
      .eq("id", sessionId)
      .single();

    if (sessionError) throw sessionError;

    // Calculer les ventes du jour
    const { data: salesData, error: salesError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("merchant_id", merchantId)
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay);

    if (salesError) throw salesError;

    const totalSales = salesData?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
    const totalTransactions = salesData?.length || 0;
    const openingCash = Number(session.opening_cash) || 0;
    const expectedCash = openingCash + totalSales;
    const cashDifference = input.closing_cash - expectedCash;

    // 2. Mettre à jour la session
    const { data, error } = await supabase
      .from("merchant_daily_sessions")
      .update({
        closed_at: new Date().toISOString(),
        closing_cash: input.closing_cash,
        expected_cash: expectedCash,
        cash_difference: cashDifference,
        total_sales: totalSales,
        total_transactions: totalTransactions,
        notes: input.notes || null,
        status: "closed",
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;
    return data as DailySession;
  },

  /**
   * Récupère l'historique des sessions
   */
  async getSessionHistory(merchantId: string, limit: number = 30): Promise<DailySession[]> {
    const { data, error } = await supabase
      .from("merchant_daily_sessions")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("session_date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as DailySession[];
  },

  /**
   * Calcule le récapitulatif de la journée en cours
   */
  async getDaySummary(merchantId: string, openingCash: number): Promise<{
    totalSales: number;
    totalTransactions: number;
    expectedCash: number;
  }> {
    const today = new Date().toISOString().split("T")[0];
    const startOfDay = `${today}T00:00:00.000Z`;
    const endOfDay = `${today}T23:59:59.999Z`;

    const { data, error } = await supabase
      .from("transactions")
      .select("amount")
      .eq("merchant_id", merchantId)
      .gte("created_at", startOfDay)
      .lte("created_at", endOfDay);

    if (error) throw error;

    const totalSales = data?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
    const totalTransactions = data?.length || 0;

    return {
      totalSales,
      totalTransactions,
      expectedCash: openingCash + totalSales,
    };
  },
};
