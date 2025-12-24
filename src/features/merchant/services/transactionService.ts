import { supabase } from "@/integrations/supabase/client";
import { merchantLogger } from "@/infra/logger";
import type { CreateTransactionInput, SelectedProduct } from "../types/transaction.types";

// ============================================
// Interface des données marchand
// ============================================
interface MerchantData {
  id: string;
  rsti_balance: number | null;
  full_name: string;
}

// ============================================
// Service de transactions
// ============================================
export const transactionService = {
  /**
   * Récupère les données du marchand par user_id
   */
  async getMerchantByUserId(userId: string): Promise<MerchantData> {
    const { data, error } = await supabase
      .from("merchants")
      .select("id, rsti_balance, full_name")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      merchantLogger.error("Marchand non trouvé", error, { userId });
      throw new Error("Compte marchand introuvable");
    }

    return data;
  },

  /**
   * Récupère le nom du marchand
   */
  async getMerchantName(userId: string): Promise<string> {
    const { data } = await supabase
      .from("merchants")
      .select("full_name")
      .eq("user_id", userId)
      .single();

    return data?.full_name || "";
  },

  /**
   * Crée une transaction et retourne son ID
   */
  async createTransaction(input: CreateTransactionInput): Promise<string> {
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        merchant_id: input.merchant_id,
        amount: input.amount,
        transaction_type: input.transaction_type,
        cmu_deduction: input.cmu_deduction,
        rsti_deduction: input.rsti_deduction,
        reference: input.reference,
      })
      .select("id")
      .single();

    if (error || !data) {
      merchantLogger.error("Échec création transaction", error);
      throw error || new Error("Échec création transaction");
    }

    return data.id;
  },

  /**
   * Enregistre les articles d'une transaction
   */
  async recordTransactionItems(
    transactionId: string,
    products: SelectedProduct[]
  ): Promise<void> {
    if (products.length === 0) return;

    const items = products.map((p) => ({
      transaction_id: transactionId,
      product_id: p.productId,
      product_name: p.productName,
      quantity: p.quantity,
      unit_price: p.unitPrice,
      total_price: p.quantity * p.unitPrice,
    }));

    const { error } = await supabase.from("transaction_items").insert(items);

    if (error) {
      merchantLogger.warn("Échec enregistrement articles", { error: error.message });
      // On continue quand même, la transaction est déjà enregistrée
    }
  },

  /**
   * Met à jour le solde RSTI du marchand
   */
  async updateRstiBalance(
    merchantId: string,
    currentBalance: number | null,
    additionalAmount: number
  ): Promise<void> {
    const newBalance = Number(currentBalance || 0) + additionalAmount;

    const { error } = await supabase
      .from("merchants")
      .update({ rsti_balance: newBalance })
      .eq("id", merchantId);

    if (error) {
      merchantLogger.warn("Échec mise à jour RSTI", { error: error.message });
    }
  },

  /**
   * Enregistre le paiement CMU
   */
  async recordCmuPayment(
    merchantId: string,
    transactionId: string,
    amount: number
  ): Promise<void> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { error } = await supabase.from("cmu_payments").insert({
      merchant_id: merchantId,
      amount,
      period_start: periodStart.toISOString().split("T")[0],
      period_end: periodEnd.toISOString().split("T")[0],
      transaction_id: transactionId,
    });

    if (error) {
      merchantLogger.warn("Échec enregistrement CMU", { error: error.message });
    }
  },
};
