import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnifiedBottomNav } from "@/components/shared/UnifiedBottomNav";
import { merchantNavItems } from "@/config/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Plus,
  Phone,
  UserCircle,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Banknote
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";


interface CustomerCredit {
  id: string;
  customer_name: string;
  customer_phone: string;
  amount_owed: number;
  amount_paid: number;
  due_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export default function MerchantCredits() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [credits, setCredits] = useState<CustomerCredit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<CustomerCredit | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "overdue" | "paid">("all");
  
  // Form states
  const [newCredit, setNewCredit] = useState({
    customer_name: "",
    customer_phone: "",
    amount_owed: "",
    due_date: "",
    notes: ""
  });
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    fetchCredits();
  }, [user]);

  const fetchCredits = async () => {
    if (!user) return;

    const { data: merchant } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (merchant) {
      setMerchantId(merchant.id);

      const { data: creditsData } = await supabase
        .from("customer_credits")
        .select("*")
        .eq("merchant_id", merchant.id)
        .order("created_at", { ascending: false });

      if (creditsData) {
        setCredits(creditsData);
      }
    }
    setIsLoading(false);
  };

  const handleAddCredit = async () => {
    if (!merchantId || !newCredit.customer_name || !newCredit.amount_owed) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase.from("customer_credits").insert({
      merchant_id: merchantId,
      customer_name: newCredit.customer_name,
      customer_phone: newCredit.customer_phone,
      amount_owed: parseFloat(newCredit.amount_owed),
      due_date: newCredit.due_date || null,
      notes: newCredit.notes || null,
      status: "pending"
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le crédit",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Succès",
        description: "Crédit ajouté avec succès"
      });
      setNewCredit({ customer_name: "", customer_phone: "", amount_owed: "", due_date: "", notes: "" });
      setIsAddDialogOpen(false);
      fetchCredits();
    }
  };

  const handlePayment = async () => {
    if (!selectedCredit || !paymentAmount) return;

    const payment = parseFloat(paymentAmount);
    const newPaid = selectedCredit.amount_paid + payment;
    const remaining = selectedCredit.amount_owed - newPaid;
    const newStatus = remaining <= 0 ? "paid" : newPaid > 0 ? "partially_paid" : "pending";

    const { error } = await supabase
      .from("customer_credits")
      .update({
        amount_paid: newPaid,
        status: newStatus
      })
      .eq("id", selectedCredit.id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Succès",
        description: `Paiement de ${payment.toLocaleString()} FCFA enregistré`
      });
      setPaymentAmount("");
      setIsPaymentDialogOpen(false);
      setSelectedCredit(null);
      fetchCredits();
    }
  };

  const getStatusBadge = (credit: CustomerCredit) => {
    const isOverdue = credit.due_date && new Date(credit.due_date) < new Date() && credit.status !== "paid";
    
    if (credit.status === "paid") {
      return <Badge className="bg-secondary text-secondary-foreground"><CheckCircle className="w-3 h-3 mr-1" /> Payé</Badge>;
    }
    if (isOverdue) {
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" /> En retard</Badge>;
    }
    if (credit.status === "partially_paid") {
      return <Badge className="bg-accent text-accent-foreground"><Clock className="w-3 h-3 mr-1" /> Partiel</Badge>;
    }
    return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" /> En cours</Badge>;
  };

  const filteredCredits = credits.filter(credit => {
    const isOverdue = credit.due_date && new Date(credit.due_date) < new Date() && credit.status !== "paid";
    
    switch (filter) {
      case "pending": return credit.status === "pending" || credit.status === "partially_paid";
      case "overdue": return isOverdue;
      case "paid": return credit.status === "paid";
      default: return true;
    }
  });

  const totalOwed = credits.reduce((sum, c) => sum + (c.amount_owed - c.amount_paid), 0);
  const overdueCount = credits.filter(c => c.due_date && new Date(c.due_date) < new Date() && c.status !== "paid").length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-gradient-forest text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => navigate("/marchand")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Crédits Clients</h1>
            <p className="text-sm text-primary-foreground/80">Gérez vos créances</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Total créances</p>
              <p className="text-xl font-bold text-primary">{totalOwed.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">FCFA</p>
            </CardContent>
          </Card>
          <Card className={`${overdueCount > 0 ? 'bg-destructive/10 border-destructive/20' : 'bg-secondary/10 border-secondary/20'}`}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">En retard</p>
              <p className={`text-xl font-bold ${overdueCount > 0 ? 'text-destructive' : 'text-secondary'}`}>{overdueCount}</p>
              <p className="text-xs text-muted-foreground">crédit{overdueCount !== 1 ? 's' : ''}</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-14 text-lg font-semibold rounded-xl shadow-africa">
              <Plus className="w-5 h-5 mr-2" /> Nouveau crédit client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un crédit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-sm font-medium">Nom du client *</Label>
                <Input
                  placeholder="Ex: Koné Amadou"
                  value={newCredit.customer_name}
                  onChange={(e) => setNewCredit({...newCredit, customer_name: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Téléphone</Label>
                <Input
                  placeholder="07 XX XX XX XX"
                  value={newCredit.customer_phone}
                  onChange={(e) => setNewCredit({...newCredit, customer_phone: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Montant *</Label>
                <Input
                  type="number"
                  placeholder="25000"
                  value={newCredit.amount_owed}
                  onChange={(e) => setNewCredit({...newCredit, amount_owed: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Date d'échéance</Label>
                <Input
                  type="date"
                  value={newCredit.due_date}
                  onChange={(e) => setNewCredit({...newCredit, due_date: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Notes</Label>
                <Textarea
                  placeholder="Détails supplémentaires..."
                  value={newCredit.notes}
                  onChange={(e) => setNewCredit({...newCredit, notes: e.target.value})}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleAddCredit} className="w-full h-12 text-lg">
                Enregistrer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: "all", label: "Tous" },
            { key: "pending", label: "En cours" },
            { key: "overdue", label: "En retard" },
            { key: "paid", label: "Payés" }
          ].map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              className="rounded-full whitespace-nowrap"
              onClick={() => setFilter(f.key as typeof filter)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Credits List */}
        <div className="space-y-3">
          {filteredCredits.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="p-8 text-center">
                <UserCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Aucun crédit client</p>
              </CardContent>
            </Card>
          ) : (
            filteredCredits.map((credit) => (
              <Card key={credit.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{credit.customer_name}</h3>
                        {credit.customer_phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {credit.customer_phone}
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(credit)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Montant dû</p>
                      <p className="font-bold text-foreground">{credit.amount_owed.toLocaleString()} FCFA</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Reste à payer</p>
                      <p className="font-bold text-primary">{(credit.amount_owed - credit.amount_paid).toLocaleString()} FCFA</p>
                    </div>
                  </div>

                  {credit.due_date && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                      <Calendar className="w-3 h-3" /> Échéance: {new Date(credit.due_date).toLocaleDateString('fr-FR')}
                    </p>
                  )}

                  {credit.status !== "paid" && (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => {
                        setSelectedCredit(credit);
                        setIsPaymentDialogOpen(true);
                      }}
                    >
                      <Banknote className="w-4 h-4 mr-2" /> Encaisser un paiement
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Encaisser un paiement</DialogTitle>
          </DialogHeader>
          {selectedCredit && (
            <div className="space-y-4 mt-4">
              <Card className="bg-muted/30">
                <CardContent className="p-3">
                  <p className="font-bold">{selectedCredit.customer_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Reste à payer: <span className="text-primary font-bold">{(selectedCredit.amount_owed - selectedCredit.amount_paid).toLocaleString()} FCFA</span>
                  </p>
                </CardContent>
              </Card>
              <div>
                <Label className="text-sm font-medium">Montant reçu</Label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="mt-1 h-14 text-xl text-center"
                />
              </div>
              <Button onClick={handlePayment} className="w-full h-12 text-lg">
                Confirmer le paiement
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <UnifiedBottomNav items={merchantNavItems} />
    </div>
  );
}
