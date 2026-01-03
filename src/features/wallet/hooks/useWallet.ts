import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { walletService } from "../services/walletService";
import type { 
  Wallet, 
  WalletTransaction, 
  Beneficiary, 
  TransferInput,
  TransferResponse 
} from "../types/wallet.types";
import { toast } from "sonner";

export function useWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const data = await walletService.getDashboardData(user.id);
      setWallet(data.wallet);
      setTransactions(data.recentTransactions);
      setBeneficiaries(data.beneficiaries);
    } catch (error) {
      console.error("[useWallet] Error loading data:", error);
      toast.error("Erreur lors du chargement du portefeuille");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const transfer = async (input: TransferInput): Promise<TransferResponse> => {
    setIsTransferring(true);
    try {
      const result = await walletService.transfer(input);
      
      if (result.success) {
        toast.success(`Transfert réussi ! Réf: ${result.data?.reference}`);
        // Reload data to update balance
        await loadData();
      } else {
        toast.error(result.error || "Échec du transfert");
      }
      
      return result;
    } catch (error) {
      console.error("[useWallet] Transfer error:", error);
      const message = "Erreur inattendue lors du transfert";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsTransferring(false);
    }
  };

  const loadMoreTransactions = async (offset: number = transactions.length) => {
    if (!wallet?.id) return;
    
    const moreTransactions = await walletService.getTransactions(wallet.id, 20);
    setTransactions(prev => [...prev, ...moreTransactions.slice(offset)]);
  };

  const toggleFavorite = async (beneficiaryId: string, isFavorite: boolean) => {
    const success = await walletService.toggleFavorite(beneficiaryId, isFavorite);
    if (success) {
      setBeneficiaries(prev =>
        prev.map(b => b.id === beneficiaryId ? { ...b, is_favorite: isFavorite } : b)
      );
    }
  };

  const removeBeneficiary = async (beneficiaryId: string) => {
    const success = await walletService.removeBeneficiary(beneficiaryId);
    if (success) {
      setBeneficiaries(prev => prev.filter(b => b.id !== beneficiaryId));
      toast.success("Bénéficiaire supprimé");
    }
  };

  return {
    wallet,
    transactions,
    beneficiaries,
    isLoading,
    isTransferring,
    transfer,
    loadMoreTransactions,
    toggleFavorite,
    removeBeneficiary,
    refresh: loadData,
  };
}
