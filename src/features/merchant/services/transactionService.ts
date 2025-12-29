import { supabase } from "@/integrations/supabase/client";
import { merchantLogger } from "@/infra/logger";
import type { CreateTransactionInput, SelectedProduct } from "../types/transaction.types";
import type { TransactionListItem } from "../utils/transactionUtils";

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
  ): Promise<boolean> {
    if (amount <= 0) {
      merchantLogger.debug("Aucune cotisation CMU à enregistrer (montant = 0)");
      return false;
    }

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    merchantLogger.debug("Tentative enregistrement CMU", {
      merchantId,
      transactionId,
      amount,
      periodStart: periodStart.toISOString().split("T")[0],
      periodEnd: periodEnd.toISOString().split("T")[0],
    });

    const { data, error } = await supabase.from("cmu_payments").insert({
      merchant_id: merchantId,
      amount,
      period_start: periodStart.toISOString().split("T")[0],
      period_end: periodEnd.toISOString().split("T")[0],
      transaction_id: transactionId,
    }).select("id").single();

    if (error) {
      merchantLogger.error("Échec enregistrement CMU", error, {
        merchantId,
        transactionId,
        amount,
      });
      return false;
    }

    merchantLogger.info("Cotisation CMU enregistrée", {
      cmuPaymentId: data.id,
      merchantId,
      amount,
    });
    return true;
  },

  /**
   * Met à jour la validité CMU si le seuil mensuel est atteint
   * Seuil : 2000 FCFA/mois = couverture santé active
   */
  async updateCmuValidity(merchantId: string): Promise<void> {
    const CMU_MONTHLY_THRESHOLD = 2000;
    
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Calculer le total des cotisations CMU du mois en cours
    const { data, error } = await supabase
      .from("cmu_payments")
      .select("amount")
      .eq("merchant_id", merchantId)
      .gte("period_start", periodStart.toISOString().split("T")[0])
      .lte("period_end", periodEnd.toISOString().split("T")[0]);

    if (error) {
      merchantLogger.warn("Échec récupération total CMU mensuel", { error: error.message });
      return;
    }

    const monthlyTotal = (data || []).reduce((sum, row) => sum + Number(row.amount), 0);
    merchantLogger.debug("Total CMU mensuel", { merchantId, monthlyTotal, threshold: CMU_MONTHLY_THRESHOLD });

    if (monthlyTotal >= CMU_MONTHLY_THRESHOLD) {
      // Validité = fin du mois suivant
      const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      const validUntil = nextMonthEnd.toISOString().split("T")[0];

      const { error: updateError } = await supabase
        .from("merchants")
        .update({ cmu_valid_until: validUntil })
        .eq("id", merchantId);

      if (updateError) {
        merchantLogger.warn("Échec mise à jour cmu_valid_until", { error: updateError.message });
      } else {
        merchantLogger.info("CMU validité mise à jour", { merchantId, validUntil, monthlyTotal });
      }
    }
  },

  /**
   * Récupère les transactions d'un marchand avec limite
   */
  async fetchMerchantTransactions(
    merchantId: string,
    limit: number = 100
  ): Promise<TransactionListItem[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "id, amount, transaction_type, created_at, reference, cmu_deduction, rsti_deduction"
      )
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      merchantLogger.error("Échec récupération transactions", error);
      throw error;
    }

    return (data as TransactionListItem[]) || [];
  },
};
