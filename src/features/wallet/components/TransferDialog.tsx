import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, User, CheckCircle2, Phone, Banknote } from "lucide-react";
import { walletService } from "../services/walletService";
import type { Beneficiary, TransferInput } from "../types/wallet.types";
import { motion, AnimatePresence } from "framer-motion";

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransfer: (input: TransferInput) => Promise<{ success: boolean; data?: any; error?: string }>;
  prefilledPhone?: string;
  prefilledName?: string;
  maxAmount: number;
}

type Step = "input" | "confirm" | "success";

export function TransferDialog({
  open,
  onOpenChange,
  onTransfer,
  prefilledPhone = "",
  prefilledName = "",
  maxAmount,
}: TransferDialogProps) {
  const [step, setStep] = useState<Step>("input");
  const [phone, setPhone] = useState(prefilledPhone);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [recipientName, setRecipientName] = useState(prefilledName);
  const [isSearching, setIsSearching] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const resetForm = () => {
    setStep("input");
    setPhone(prefilledPhone);
    setAmount("");
    setDescription("");
    setRecipientName(prefilledName);
    setError("");
    setResult(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  const searchRecipient = async () => {
    if (phone.length < 8) {
      setError("Numéro de téléphone invalide");
      return;
    }

    setIsSearching(true);
    setError("");

    const merchant = await walletService.searchMerchantByPhone(phone);
    
    if (merchant) {
      setRecipientName(merchant.name);
    } else {
      setError("Aucun marchand trouvé avec ce numéro");
      setRecipientName("");
    }
    
    setIsSearching(false);
  };

  const handleContinue = () => {
    const amountNum = parseInt(amount.replace(/\s/g, ""), 10);
    
    if (!recipientName) {
      setError("Veuillez rechercher le destinataire");
      return;
    }
    if (!amountNum || amountNum < 100) {
      setError("Montant minimum: 100 FCFA");
      return;
    }
    if (amountNum > maxAmount) {
      setError(`Solde insuffisant (max: ${maxAmount.toLocaleString()} FCFA)`);
      return;
    }

    setError("");
    setStep("confirm");
  };

  const handleConfirm = async () => {
    const amountNum = parseInt(amount.replace(/\s/g, ""), 10);
    
    setIsTransferring(true);
    const response = await onTransfer({
      recipient_phone: phone,
      amount: amountNum,
      description: description || undefined,
    });

    if (response.success) {
      setResult(response.data);
      setStep("success");
    } else {
      setError(response.error || "Échec du transfert");
      setStep("input");
    }
    setIsTransferring(false);
  };

  const formatAmount = (value: string) => {
    const num = value.replace(/\D/g, "");
    return num ? parseInt(num, 10).toLocaleString("fr-FR") : "";
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "success" ? "Transfert réussi !" : "Envoyer de l'argent"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4 py-4"
            >
              {/* Phone input */}
              <div className="space-y-2">
                <Label htmlFor="phone">Numéro du destinataire</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0701234567"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setRecipientName("");
                      }}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    onClick={searchRecipient} 
                    disabled={isSearching || phone.length < 8}
                    variant="secondary"
                  >
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Chercher"}
                  </Button>
                </div>
                {recipientName && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{recipientName}</span>
                  </div>
                )}
              </div>

              {/* Amount input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Montant (FCFA)</Label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="text"
                    inputMode="numeric"
                    placeholder="5 000"
                    value={amount}
                    onChange={(e) => setAmount(formatAmount(e.target.value))}
                    className="pl-10 text-lg font-semibold"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Solde disponible: {maxAmount.toLocaleString()} FCFA
                </p>
              </div>

              {/* Description (optional) */}
              <div className="space-y-2">
                <Label htmlFor="description">Motif (optionnel)</Label>
                <Textarea
                  id="description"
                  placeholder="Ex: Remboursement, Paiement..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button 
                onClick={handleContinue} 
                className="w-full" 
                size="lg"
                disabled={!recipientName || !amount}
              >
                Continuer
              </Button>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 py-4"
            >
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">Vous envoyez</p>
                <p className="text-4xl font-bold text-primary">
                  {amount} <span className="text-lg">FCFA</span>
                </p>
                <p className="text-muted-foreground">à</p>
                <div className="flex items-center justify-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <span className="text-xl font-semibold">{recipientName}</span>
                </div>
                <p className="text-sm text-muted-foreground">{phone}</p>
              </div>

              {description && (
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-sm text-muted-foreground">Motif: {description}</p>
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep("input")}
                  className="flex-1"
                  disabled={isTransferring}
                >
                  Retour
                </Button>
                <Button 
                  onClick={handleConfirm}
                  className="flex-1"
                  disabled={isTransferring}
                >
                  {isTransferring ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Confirmer
                </Button>
              </div>
            </motion.div>
          )}

          {step === "success" && result && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-6"
            >
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>

              <div className="space-y-2">
                <p className="text-3xl font-bold text-green-600">
                  {result.amount.toLocaleString()} FCFA
                </p>
                <p className="text-muted-foreground">envoyé à {result.recipient_name}</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Référence</p>
                <p className="font-mono font-semibold">{result.reference}</p>
              </div>

              <div className="text-sm text-muted-foreground">
                Nouveau solde: <span className="font-semibold">{result.new_balance.toLocaleString()} FCFA</span>
              </div>

              <Button onClick={() => handleOpenChange(false)} className="w-full">
                Fermer
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
