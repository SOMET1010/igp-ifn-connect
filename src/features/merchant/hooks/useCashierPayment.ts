import { useState, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRetryOperation } from "@/shared/hooks";
import { merchantLogger } from "@/infra/logger";
import { toast } from "sonner";
import { transactionService } from "../services/transactionService";
import type { SelectedProduct, PaymentMethod, CashierStep } from "../types/transaction.types";
import {
  calculateCmuDeduction,
  calculateRstiDeduction,
  calculateProductsTotal,
  calculateEffectiveAmount,
  generateTransactionReference,
} from "../utils/cashierCalculations";

// ============================================
// Interface du hook
// ============================================
interface UseCashierPaymentResult {
  // State
  step: CashierStep;
  method: PaymentMethod | null;
  isLoading: boolean;
  transactionRef: string;
  merchantName: string;
  showReceipt: boolean;
  isRetrying: boolean;

  // Computed values
  numericAmount: number;
  cmuDeduction: number;
  rstiDeduction: number;

  // Actions
  selectPaymentMethod: (method: PaymentMethod, t: (key: string) => string) => void;
  confirmPayment: (t: (key: string) => string, triggerSuccessFeedback: () => void) => Promise<void>;
  resetForm: () => void;
  setShowReceipt: (show: boolean) => void;
}

// ============================================
// Hook principal de gestion de la caisse
// ============================================
export function useCashierPayment(
  manualAmount: number,
  selectedProducts: SelectedProduct[]
): UseCashierPaymentResult {
  const { user } = useAuth();
  
  // State local
  const [step, setStep] = useState<CashierStep>("input");
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);

  // Calculs dérivés avec useMemo
  const productsTotal = useMemo(
    () => calculateProductsTotal(selectedProducts),
    [selectedProducts]
  );

  const numericAmount = useMemo(
    () => calculateEffectiveAmount(productsTotal, manualAmount),
    [productsTotal, manualAmount]
  );

  const cmuDeduction = useMemo(
    () => calculateCmuDeduction(numericAmount),
    [numericAmount]
  );

  const rstiDeduction = useMemo(
    () => calculateRstiDeduction(numericAmount),
    [numericAmount]
  );

  // Fetch merchant name on mount
  useEffect(() => {
    const fetchName = async () => {
      if (!user) return;
      const name = await transactionService.getMerchantName(user.id);
      setMerchantName(name);
    };
    fetchName();
  }, [user]);

  // Hook de retry
  const { execute: executeWithRetry, state: retryState } = useRetryOperation<string>({
    maxRetries: 3,
    baseDelay: 1500,
    onRetry: (attempt) => {
      toast.info(`Nouvelle tentative (${attempt}/3)...`);
    },
    onExhausted: () => {
      toast.error("Échec après plusieurs tentatives. Vérifiez votre connexion.");
    },
  });

  // Sélection de la méthode de paiement
  const selectPaymentMethod = useCallback(
    (selectedMethod: PaymentMethod, t: (key: string) => string) => {
      // Vérifier qu'au moins un produit est sélectionné
      if (selectedProducts.length === 0) {
        toast.error("Sélectionnez au moins un produit à vendre");
        return;
      }
      if (numericAmount < 100) {
        toast.error(t("min_amount_error"));
        return;
      }
      setMethod(selectedMethod);
      setStep("confirm");
    },
    [numericAmount, selectedProducts.length]
  );

  // Confirmation du paiement
  const confirmPayment = useCallback(
    async (t: (key: string) => string, triggerSuccessFeedback: () => void) => {
      if (!user || !method) return;

      setIsLoading(true);
      merchantLogger.debug("Confirmation paiement initiée", {
        amount: numericAmount,
        method,
        userId: user.id,
      });

      const result = await executeWithRetry(async () => {
        // 1. Récupérer le marchand
        const merchant = await transactionService.getMerchantByUserId(user.id);
        const ref = generateTransactionReference();

        // 2. Créer la transaction
        const txId = await transactionService.createTransaction({
          merchant_id: merchant.id,
          amount: numericAmount,
          transaction_type: method,
          cmu_deduction: cmuDeduction,
          rsti_deduction: rstiDeduction,
          reference: ref,
        });

        // 3. Enregistrer les produits si sélectionnés
        await transactionService.recordTransactionItems(txId, selectedProducts);

        // 4. Mettre à jour RSTI
        await transactionService.updateRstiBalance(
          merchant.id,
          merchant.rsti_balance,
          rstiDeduction
        );

        // 5. Enregistrer CMU et mettre à jour la validité si seuil atteint
        const cmuRecorded = await transactionService.recordCmuPayment(merchant.id, txId, cmuDeduction);
        if (cmuRecorded) {
          await transactionService.updateCmuValidity(merchant.id);
        }

        return ref;
      });

      setIsLoading(false);

      if (result) {
        setTransactionRef(result);
        setStep("success");

        merchantLogger.info("Transaction réussie", {
          reference: result,
          amount: numericAmount,
          method,
          cmu: cmuDeduction,
          rsti: rstiDeduction,
        });

        triggerSuccessFeedback();
        toast.success(t("payment_success") + " !");
      }
    },
    [user, method, numericAmount, cmuDeduction, rstiDeduction, selectedProducts, executeWithRetry]
  );

  // Reset du formulaire
  const resetForm = useCallback(() => {
    setStep("input");
    setMethod(null);
    setTransactionRef("");
    setShowReceipt(false);
  }, []);

  return {
    step,
    method,
    isLoading,
    transactionRef,
    merchantName,
    showReceipt,
    isRetrying: retryState.isRetrying,
    numericAmount,
    cmuDeduction,
    rstiDeduction,
    selectPaymentMethod,
    confirmPayment,
    resetForm,
    setShowReceipt,
  };
}
