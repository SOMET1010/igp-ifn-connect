import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageWrapper } from "@/components/shared/PageWrapper";
import { PageHeader } from "@/components/shared/PageHeader";
import { BottomNav } from "@/components/shared/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Plus, Calendar, Home, Wallet, User, Package, Shield, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FNEInvoice, InvoiceData } from "@/components/merchant/FNEInvoice";
import { generateSecurityHash, generateVerificationUrl } from "@/lib/invoiceUtils";

interface Invoice {
  id: string;
  invoice_number: string;
  amount_ttc: number;
  customer_name: string | null;
  status: string;
  created_at: string;
  signature_hash: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
}

interface MerchantData {
  id: string;
  full_name: string;
  phone: string;
  ncc: string | null;
  fiscal_regime: string | null;
  invoice_counter: number | null;
}

export default function MerchantInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null);

  const navItems = [
    { icon: Home, label: "Accueil", href: "/marchand" },
    { icon: Package, label: "Stock", href: "/marchand/stock" },
    { icon: Wallet, label: "Encaisser", href: "/marchand/encaisser" },
    { icon: User, label: "Profil", href: "/marchand/profil" },
  ];

  // New invoice form
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Vente marchandises diverses");
  const [isCreating, setIsCreating] = useState(false);

  // Generated invoice preview
  const [generatedInvoice, setGeneratedInvoice] = useState<InvoiceData | null>(null);

  // Cancellation states
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [invoiceToCancel, setInvoiceToCancel] = useState<Invoice | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchMerchantAndInvoices();
  }, [user]);

  const fetchMerchantAndInvoices = async () => {
    if (!user) return;

    try {
      // Get merchant data including fiscal_regime
      const { data: merchant, error: merchantError } = await supabase
        .from("merchants")
        .select("id, full_name, phone, ncc, fiscal_regime, invoice_counter")
        .eq("user_id", user.id)
        .single();

      if (merchantError) throw merchantError;

      setMerchantData(merchant as MerchantData);

      // Get invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select("id, invoice_number, amount_ttc, customer_name, status, created_at, signature_hash, cancellation_reason, cancelled_at")
        .eq("merchant_id", merchant.id)
        .order("created_at", { ascending: false });

      if (invoicesError) throw invoicesError;

      setInvoices((invoicesData as Invoice[]) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erreur lors du chargement des factures");
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = async (): Promise<string> => {
    if (!merchantData) throw new Error("Merchant data not found");

    const year = new Date().getFullYear();

    // Get current counter
    const { data: merchant, error } = await supabase
      .from("merchants")
      .select("invoice_counter")
      .eq("id", merchantData.id)
      .single();

    if (error) throw error;

    const counter = ((merchant?.invoice_counter as number) || 0) + 1;

    // Update counter
    await supabase
      .from("merchants")
      .update({ invoice_counter: counter } as any)
      .eq("id", merchantData.id);

    return `IFN-${year}-${counter.toString().padStart(6, "0")}`;
  };

  const handleCreateInvoice = async () => {
    if (!merchantData) return;

    const numericAmount = parseInt(amount.replace(/\D/g, ""), 10);
    if (!numericAmount || numericAmount <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    setIsCreating(true);

    try {
      const invoiceNumber = await generateInvoiceNumber();
      const tvaRate = 0; // No VAT for informal sector (TSU)
      const tvaAmount = 0;
      const amountHt = numericAmount;
      const amountTtc = numericAmount;
      const now = new Date();

      // Generate security hash
      const securityHash = await generateSecurityHash({
        invoiceNumber,
        merchantNcc: merchantData.ncc || merchantData.id,
        amountTtc,
        date: now.toISOString().split('T')[0],
      });

      // Generate verification URL
      const verificationUrl = generateVerificationUrl(invoiceNumber, securityHash);

      // Insert invoice with security hash
      const { error } = await supabase.from("invoices").insert({
        invoice_number: invoiceNumber,
        merchant_id: merchantData.id,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        amount_ht: amountHt,
        tva_rate: tvaRate,
        tva_amount: tvaAmount,
        amount_ttc: amountTtc,
        status: "issued",
        signature_hash: securityHash,
        qr_code_data: verificationUrl,
      } as any);

      if (error) throw error;

      // Create invoice data for preview
      const invoiceData: InvoiceData = {
        invoiceNumber,
        merchantName: merchantData.full_name,
        merchantPhone: merchantData.phone,
        merchantNcc: merchantData.ncc || undefined,
        fiscalRegime: merchantData.fiscal_regime || "TSU",
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        amountHt,
        tvaRate,
        tvaAmount,
        amountTtc,
        description,
        date: now,
        securityHash,
        verificationUrl,
      };

      setGeneratedInvoice(invoiceData);
      setShowNewInvoice(false);

      // Reset form
      setCustomerName("");
      setCustomerPhone("");
      setAmount("");
      setDescription("Vente marchandises diverses");

      // Refresh list
      fetchMerchantAndInvoices();

      toast.success("Facture FNE créée avec succès !");
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Erreur lors de la création de la facture");
    } finally {
      setIsCreating(false);
    }
  };

  const formatAmount = (value: string) => {
    const num = parseInt(value.replace(/\D/g, ""), 10);
    if (isNaN(num)) return "";
    return num.toLocaleString("fr-FR");
  };

  const handleOpenCancelDialog = (invoice: Invoice) => {
    setInvoiceToCancel(invoice);
    setCancellationReason("");
    setShowCancelDialog(true);
  };

  const handleCancelInvoice = async () => {
    if (!invoiceToCancel) return;
    
    const trimmedReason = cancellationReason.trim();
    if (trimmedReason.length < 10) {
      toast.error("Le motif doit contenir au moins 10 caractères");
      return;
    }

    setIsCancelling(true);

    try {
      const { error } = await supabase
        .from("invoices")
        .update({
          status: "cancelled",
          cancellation_reason: trimmedReason,
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", invoiceToCancel.id);

      if (error) throw error;

      toast.success("Facture annulée avec succès");
      setShowCancelDialog(false);
      setInvoiceToCancel(null);
      setCancellationReason("");
      fetchMerchantAndInvoices();
    } catch (error) {
      console.error("Error cancelling invoice:", error);
      toast.error("Erreur lors de l'annulation de la facture");
    } finally {
      setIsCancelling(false);
    }
  };

  if (generatedInvoice) {
    return (
      <PageWrapper>
        <div className="p-4 max-w-md mx-auto">
          <FNEInvoice
            invoice={generatedInvoice}
            onClose={() => setGeneratedInvoice(null)}
          />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Mes Factures"
        subtitle="Factures Normalisées Électroniques"
        showBack
      />

      <div className="p-4 pb-24 space-y-4">
        {/* FNE Info Banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Format FNE Conforme</p>
            <p className="text-xs text-muted-foreground">
              Vos factures respectent le format DGI avec hash de sécurité et QR code de vérification.
            </p>
          </div>
        </div>

        {/* Create New Invoice Button */}
        <Button
          className="w-full h-16 rounded-2xl text-lg shadow-lg"
          onClick={() => setShowNewInvoice(true)}
        >
          <Plus className="w-6 h-6 mr-2" />
          Créer une nouvelle facture
        </Button>

        {/* Invoices List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Factures récentes
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-16 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aucune facture créée pour le moment
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Créez votre première facture normalisée
                </p>
              </CardContent>
            </Card>
          ) : (
            invoices.map((invoice) => {
              const isCancelled = invoice.status === "cancelled";
              return (
                <Card
                  key={invoice.id}
                  className={`hover:shadow-md transition-shadow ${isCancelled ? 'opacity-60 border-destructive/30' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isCancelled ? 'bg-destructive/10' : 'bg-primary/10'
                        }`}>
                          {isCancelled ? (
                            <XCircle className="w-6 h-6 text-destructive" />
                          ) : (
                            <FileText className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className={`font-mono font-bold ${isCancelled ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {invoice.invoice_number}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {invoice.customer_name || "Client non spécifié"}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {new Date(invoice.created_at).toLocaleDateString("fr-FR")}
                            </div>
                            {invoice.signature_hash && !isCancelled && (
                              <div className="flex items-center gap-1 text-xs text-primary">
                                <Shield className="w-3 h-3" />
                                <span className="font-mono">{invoice.signature_hash.substring(0, 8)}...</span>
                              </div>
                            )}
                            {isCancelled && (
                              <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                                Annulée
                              </span>
                            )}
                          </div>
                          {isCancelled && invoice.cancellation_reason && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              Motif: {invoice.cancellation_reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div>
                          <p className={`font-bold text-lg ${isCancelled ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {Number(invoice.amount_ttc).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">FCFA</p>
                        </div>
                        {!isCancelled && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenCancelDialog(invoice);
                            }}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 text-xs"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Annuler
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* New Invoice Dialog */}
      <Dialog open={showNewInvoice} onOpenChange={setShowNewInvoice}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Nouvelle Facture FNE
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Fiscal Regime Info */}
            {merchantData?.fiscal_regime && (
              <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Régime fiscal: <span className="font-medium text-foreground">{merchantData.fiscal_regime}</span>
                </span>
              </div>
            )}

            <div>
              <Label htmlFor="amount">Montant (FCFA) *</Label>
              <Input
                id="amount"
                type="text"
                inputMode="numeric"
                placeholder="Ex: 15 000"
                value={amount}
                onChange={(e) => setAmount(formatAmount(e.target.value))}
                className="text-xl font-bold h-14"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description de la vente"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-3">
                Informations client (optionnel)
              </p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="customerName">Nom du client</Label>
                  <Input
                    id="customerName"
                    placeholder="Ex: M. Kouassi Jean"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Téléphone du client</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    placeholder="Ex: 07 00 00 00 00"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button
              className="w-full h-14 rounded-xl text-lg"
              onClick={handleCreateInvoice}
              disabled={isCreating || !amount}
            >
              {isCreating ? "Création en cours..." : "Créer la facture FNE"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Invoice Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Annuler la facture
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {invoiceToCancel && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-mono font-bold text-foreground">
                  {invoiceToCancel.invoice_number}
                </p>
                <p className="text-sm text-muted-foreground">
                  Montant: {Number(invoiceToCancel.amount_ttc).toLocaleString()} FCFA
                </p>
              </div>
            )}

            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive font-medium">
                ⚠️ Attention : Cette action est irréversible
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Une facture annulée reste visible dans l'historique mais ne peut plus être modifiée.
              </p>
            </div>

            <div>
              <Label htmlFor="cancellationReason" className="text-destructive">
                Motif d'annulation (obligatoire) *
              </Label>
              <Textarea
                id="cancellationReason"
                placeholder="Ex: Erreur sur le montant, doublon, demande client..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum 10 caractères ({cancellationReason.trim().length}/10)
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCancelDialog(false)}
                disabled={isCancelling}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancelInvoice}
                disabled={isCancelling || cancellationReason.trim().length < 10}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Annulation...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Confirmer l'annulation
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav items={navItems} />
    </PageWrapper>
  );
}
