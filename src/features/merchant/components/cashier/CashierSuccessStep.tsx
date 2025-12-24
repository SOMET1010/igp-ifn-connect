import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { SuccessScreen, ButtonPrimary, ButtonSecondary } from "@/components/ifn";
import { QRReceipt } from "@/components/merchant/QRReceipt";
import type { PaymentMethod, TransactionDetails } from "../../types/transaction.types";

// ============================================
// Props du composant
// ============================================
interface CashierSuccessStepProps {
  transactionRef: string;
  amount: number;
  method: PaymentMethod;
  cmuDeduction: number;
  rstiDeduction: number;
  merchantName: string;
  showReceipt: boolean;
  onShowReceipt: () => void;
  onNewSale: () => void;
}

// ============================================
// Composant étape de succès
// ============================================
export function CashierSuccessStep({
  transactionRef,
  amount,
  method,
  cmuDeduction,
  rstiDeduction,
  merchantName,
  showReceipt,
  onShowReceipt,
  onNewSale,
}: CashierSuccessStepProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Construction des détails de transaction pour le reçu
  const transactionDetails: TransactionDetails = {
    reference: transactionRef,
    amount,
    paymentMethod: method,
    cmuDeduction,
    rstiDeduction,
    date: new Date(),
    merchantName,
  };

  // Vue reçu QR
  if (showReceipt) {
    return (
      <div className="fixed inset-0 z-50 bg-background p-4 overflow-auto flex flex-col">
        <div className="flex-1">
          <QRReceipt transaction={transactionDetails} />
        </div>
        <div className="mt-4 space-y-3 pb-4">
          <ButtonPrimary onClick={onNewSale} className="w-full">
            {t("new_sale")}
          </ButtonPrimary>
          <ButtonSecondary onClick={() => navigate("/marchand")} className="w-full">
            {t("home")}
          </ButtonSecondary>
        </div>
      </div>
    );
  }

  // Vue succès avec animation
  return (
    <SuccessScreen
      title={t("its_done")}
      amount={amount}
      subtitle={method === "cash" ? t("cash") : t("mobile_money")}
      onComplete={() => navigate("/marchand")}
      onNewAction={onNewSale}
      newActionLabel={t("new_sale")}
      onViewReceipt={onShowReceipt}
      viewReceiptLabel={t("view_receipt")}
      autoReturnSeconds={3}
    />
  );
}
