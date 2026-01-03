import { supabase } from "@/integrations/supabase/client";
import type { 
  Wallet, 
  WalletTransaction, 
  Beneficiary, 
  TransferInput, 
  TransferResponse,
  WalletDashboardData 
} from "../types/wallet.types";

export const walletService = {
  /**
   * Get wallet for current user's merchant
   */
  async getWallet(userId: string): Promise<Wallet | null> {
    // First get merchant id
    const { data: merchant, error: merchantError } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (merchantError || !merchant) {
      console.error("[walletService] Merchant not found:", merchantError);
      return null;
    }

    const { data: wallet, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("merchant_id", merchant.id)
      .single();

    if (error) {
      console.error("[walletService] Wallet not found:", error);
      return null;
    }

    return wallet as Wallet;
  },

  /**
   * Get recent transactions
   */
  async getTransactions(walletId: string, limit = 20): Promise<WalletTransaction[]> {
    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("wallet_id", walletId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[walletService] Error fetching transactions:", error);
      return [];
    }

    return data as WalletTransaction[];
  },

  /**
   * Get beneficiaries with merchant info
   */
  async getBeneficiaries(walletId: string): Promise<Beneficiary[]> {
    const { data, error } = await supabase
      .from("beneficiaries")
      .select(`
        *,
        beneficiary_wallet:wallets!beneficiary_wallet_id (
          merchant:merchants (
            full_name,
            phone
          )
        )
      `)
      .eq("owner_wallet_id", walletId)
      .order("is_favorite", { ascending: false })
      .order("transfer_count", { ascending: false });

    if (error) {
      console.error("[walletService] Error fetching beneficiaries:", error);
      return [];
    }

    // Enrich beneficiary data
    return (data || []).map((b: any) => ({
      ...b,
      phone: b.beneficiary_wallet?.merchant?.phone,
      merchant_name: b.beneficiary_wallet?.merchant?.full_name,
    })) as Beneficiary[];
  },

  /**
   * Get full dashboard data
   */
  async getDashboardData(userId: string): Promise<WalletDashboardData> {
    const wallet = await this.getWallet(userId);
    
    if (!wallet) {
      return {
        wallet: null,
        recentTransactions: [],
        beneficiaries: [],
        stats: { totalSent: 0, totalReceived: 0, transactionCount: 0 },
      };
    }

    const [transactions, beneficiaries] = await Promise.all([
      this.getTransactions(wallet.id, 10),
      this.getBeneficiaries(wallet.id),
    ]);

    // Calculate stats from transactions
    const stats = transactions.reduce(
      (acc, tx) => {
        if (tx.status !== "completed") return acc;
        
        if (tx.type === "transfer_sent") {
          acc.totalSent += tx.amount;
        } else if (tx.type === "transfer_received") {
          acc.totalReceived += tx.amount;
        }
        acc.transactionCount++;
        return acc;
      },
      { totalSent: 0, totalReceived: 0, transactionCount: 0 }
    );

    return {
      wallet,
      recentTransactions: transactions,
      beneficiaries,
      stats,
    };
  },

  /**
   * Execute P2P transfer
   */
  async transfer(input: TransferInput): Promise<TransferResponse> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      return { success: false, error: "Non connecté" };
    }

    const { data, error } = await supabase.functions.invoke("wallet-transfer", {
      body: input,
    });

    if (error) {
      console.error("[walletService] Transfer error:", error);
      return { success: false, error: error.message || "Erreur de transfert" };
    }

    return data as TransferResponse;
  },

  /**
   * Search merchant by phone
   */
  async searchMerchantByPhone(phone: string): Promise<{ id: string; name: string; phone: string } | null> {
    const { data, error } = await supabase
      .from("merchants")
      .select("id, full_name, phone")
      .eq("phone", phone)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      name: data.full_name,
      phone: data.phone,
    };
  },

  /**
   * Toggle beneficiary favorite
   */
  async toggleFavorite(beneficiaryId: string, isFavorite: boolean): Promise<boolean> {
    const { error } = await supabase
      .from("beneficiaries")
      .update({ is_favorite: isFavorite })
      .eq("id", beneficiaryId);

    return !error;
  },

  /**
   * Remove beneficiary
   */
  async removeBeneficiary(beneficiaryId: string): Promise<boolean> {
    const { error } = await supabase
      .from("beneficiaries")
      .delete()
      .eq("id", beneficiaryId);

    return !error;
  },
};
