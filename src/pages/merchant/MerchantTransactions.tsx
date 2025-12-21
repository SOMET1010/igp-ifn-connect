import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Banknote, Smartphone, CreditCard, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/shared/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Home, Wallet, User, History, Package } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const navItems = [
  { icon: Home, label: "Accueil", href: "/marchand" },
  { icon: Package, label: "Stock", href: "/marchand/stock" },
  { icon: Wallet, label: "Encaisser", href: "/marchand/encaisser" },
  { icon: User, label: "Profil", href: "/marchand/profil" },
];

interface Transaction {
  id: string;
  amount: number;
  transaction_type: "cash" | "mobile_money" | "transfer";
  cmu_deduction: number;
  rsti_deduction: number;
  reference: string;
  created_at: string;
}

type PeriodFilter = "today" | "week" | "month" | "all";
type TypeFilter = "all" | "cash" | "mobile_money" | "transfer";

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "cash":
      return <Banknote className="w-5 h-5" />;
    case "mobile_money":
      return <Smartphone className="w-5 h-5" />;
    case "transfer":
      return <CreditCard className="w-5 h-5" />;
    default:
      return <Banknote className="w-5 h-5" />;
  }
};

const getTransactionLabel = (type: string) => {
  switch (type) {
    case "cash":
      return "Espèces";
    case "mobile_money":
      return "Mobile Money";
    case "transfer":
      return "Virement";
    default:
      return type;
  }
};

export default function MerchantTransactions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("today");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  // Summary calculations
  const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalCMU = transactions.reduce((sum, t) => sum + Number(t.cmu_deduction || 0), 0);
  const totalRSTI = transactions.reduce((sum, t) => sum + Number(t.rsti_deduction || 0), 0);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      setIsLoading(true);

      // Get merchant ID first
      const { data: merchantData } = await supabase
        .from("merchants")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!merchantData) {
        setIsLoading(false);
        return;
      }

      // Build date filter
      let dateFilter = "";
      const now = new Date();
      
      if (periodFilter === "today") {
        dateFilter = now.toISOString().split("T")[0];
      } else if (periodFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = weekAgo.toISOString();
      } else if (periodFilter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = monthAgo.toISOString();
      }

      // Fetch transactions
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("merchant_id", merchantData.id)
        .order("created_at", { ascending: false });

      if (dateFilter) {
        query = query.gte("created_at", dateFilter);
      }

      if (typeFilter !== "all") {
        query = query.eq("transaction_type", typeFilter);
      }

      const { data } = await query;
      setTransactions(data || []);
      setIsLoading(false);
    };

    fetchTransactions();
  }, [user, periodFilter, typeFilter]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/marchand")}
            className="text-secondary-foreground hover:bg-secondary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Historique</h1>
            <p className="text-sm text-secondary-foreground/80">
              {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Filters */}
        <div className="flex gap-3">
          <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
            <SelectTrigger className="flex-1">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">7 derniers jours</SelectItem>
              <SelectItem value="month">30 derniers jours</SelectItem>
              <SelectItem value="all">Tout</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
            <SelectTrigger className="flex-1">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              <SelectItem value="cash">Espèces</SelectItem>
              <SelectItem value="mobile_money">Mobile Money</SelectItem>
              <SelectItem value="transfer">Virement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <CardContent className="p-4">
            <div className="text-center mb-3">
              <p className="text-sm text-muted-foreground">Total des ventes</p>
              <p className="text-3xl font-bold text-foreground">
                {totalAmount.toLocaleString()} <span className="text-lg">FCFA</span>
              </p>
            </div>
            <div className="flex justify-around border-t border-border pt-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">CMU déduit</p>
                <p className="font-semibold text-red-500">-{totalCMU.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">RSTI épargné</p>
                <p className="font-semibold text-secondary">+{totalRSTI.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
          </div>
        ) : transactions.length === 0 ? (
          <Card className="bg-muted/30">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Aucune transaction pour cette période</p>
              <Button
                onClick={() => navigate("/marchand/encaisser")}
                className="mt-4 bg-secondary hover:bg-secondary/90"
              >
                Encaisser une vente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <Card key={tx.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                      {getTransactionIcon(tx.transaction_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-foreground">
                          {Number(tx.amount).toLocaleString()} FCFA
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.created_at), "HH:mm", { locale: fr })}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-muted-foreground">
                          {getTransactionLabel(tx.transaction_type)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.created_at), "dd MMM yyyy", { locale: fr })}
                        </p>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="text-red-500">CMU: -{tx.cmu_deduction || 0}</span>
                        <span className="text-secondary">RSTI: +{tx.rsti_deduction || 0}</span>
                      </div>
                      {tx.reference && (
                        <p className="text-xs font-mono text-muted-foreground mt-1">
                          {tx.reference}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNav items={navItems} />
    </div>
  );
}
