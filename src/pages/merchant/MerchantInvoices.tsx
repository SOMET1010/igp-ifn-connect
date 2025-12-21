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
import { FileText, Plus, Calendar, Home, Wallet, User, Package } from "lucide-react";
import { toast } from "sonner";
import { FNEInvoice, InvoiceData } from "@/components/merchant/FNEInvoice";

interface Invoice {
  id: string;
  invoice_number: string;
  amount_ttc: number;
  customer_name: string | null;
  status: string;
  created_at: string;
}

export default function MerchantInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [merchantData, setMerchantData] = useState<{
    full_name: string;
    phone: string;
    ncc: string | null;
  } | null>(null);

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
  const [generatedInvoice, setGeneratedInvoice] = useState<InvoiceData | null>(
    null
  );

  useEffect(() => {
    fetchMerchantAndInvoices();
  }, [user]);

  const fetchMerchantAndInvoices = async () => {
    if (!user) return;

    try {
      // Get merchant data
      const { data: merchant, error: merchantError } = await supabase
        .from("merchants")
        .select("id, full_name, phone, ncc, invoice_counter")
        .eq("user_id", user.id)
        .single();

      if (merchantError) throw merchantError;

      setMerchantId(merchant.id);
      setMerchantData({
        full_name: merchant.full_name,
        phone: merchant.phone,
        ncc: merchant.ncc,
      });

      // Get invoices - cast to handle type issue
      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select("id, invoice_number, amount_ttc, customer_name, status, created_at")
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
    if (!merchantId) throw new Error("Merchant ID not found");

    const year = new Date().getFullYear();

    // Get current counter
    const { data: merchant, error } = await supabase
      .from("merchants")
      .select("invoice_counter")
      .eq("id", merchantId)
      .single();

    if (error) throw error;

    const counter = ((merchant?.invoice_counter as number) || 0) + 1;

    // Update counter - use type assertion
    await supabase
      .from("merchants")
      .update({ invoice_counter: counter } as any)
      .eq("id", merchantId);

    return `IFN-${year}-${counter.toString().padStart(6, "0")}`;
  };

  const handleCreateInvoice = async () => {
    if (!merchantId || !merchantData) return;

    const numericAmount = parseInt(amount.replace(/\D/g, ""), 10);
    if (!numericAmount || numericAmount <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    setIsCreating(true);

    try {
      const invoiceNumber = await generateInvoiceNumber();
      const tvaRate = 0; // No VAT for informal sector
      const tvaAmount = 0;
      const amountHt = numericAmount;
      const amountTtc = numericAmount;
      const now = new Date();

      // Insert invoice - use type assertion for new columns
      const { error } = await supabase.from("invoices").insert({
        invoice_number: invoiceNumber,
        merchant_id: merchantId,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        amount_ht: amountHt,
        tva_rate: tvaRate,
        tva_amount: tvaAmount,
        amount_ttc: amountTtc,
        status: "issued",
      } as any);

      if (error) throw error;

      // Create invoice data for preview
      const invoiceData: InvoiceData = {
        invoiceNumber,
        merchantName: merchantData.full_name,
        merchantPhone: merchantData.phone,
        merchantNcc: merchantData.ncc || undefined,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        amountHt,
        tvaRate,
        tvaAmount,
        amountTtc,
        description,
        date: now,
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

      toast.success("Facture créée avec succès !");
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
            invoices.map((invoice) => (
              <Card
                key={invoice.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-mono font-bold text-foreground">
                          {invoice.invoice_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.customer_name || "Client non spécifié"}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(invoice.created_at).toLocaleDateString(
                            "fr-FR"
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-foreground">
                        {Number(invoice.amount_ttc).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">FCFA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
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
              {isCreating ? "Création en cours..." : "Créer la facture"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav items={navItems} />
    </PageWrapper>
  );
}
