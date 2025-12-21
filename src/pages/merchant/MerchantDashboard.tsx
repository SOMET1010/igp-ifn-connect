import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/shared/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Home, 
  Wallet, 
  Heart, 
  User,
  Banknote,
  TrendingUp,
  Shield,
  ArrowRight,
  Loader2
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Accueil", href: "/marchand" },
  { icon: Wallet, label: "Encaisser", href: "/marchand/encaisser" },
  { icon: Heart, label: "CMU", href: "/marchand/cmu" },
  { icon: User, label: "Profil", href: "/marchand/profil" },
];

interface MerchantData {
  full_name: string;
  cmu_number: string;
  rsti_balance: number;
  activity_type: string;
}

export default function MerchantDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [merchant, setMerchant] = useState<MerchantData | null>(null);
  const [todayTotal, setTodayTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch merchant data
      const { data: merchantData } = await supabase
        .from("merchants")
        .select("full_name, cmu_number, rsti_balance, activity_type")
        .eq("user_id", user.id)
        .single();

      if (merchantData) {
        setMerchant(merchantData);

        // Fetch today's transactions
        const today = new Date().toISOString().split("T")[0];
        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount")
          .gte("created_at", today);

        if (transactions) {
          const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
          setTodayTotal(total);
        }
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-forest text-primary-foreground p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center text-3xl">
            💵
          </div>
          <div className="flex-1">
            <p className="text-sm text-primary-foreground/80">Bienvenue,</p>
            <h1 className="text-xl font-bold">{merchant?.full_name || "Marchand"}</h1>
            <p className="text-sm text-primary-foreground/70">
              {merchant?.activity_type || "Commerce"}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-5">
        {/* Solde du jour */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ventes du jour</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {todayTotal.toLocaleString()} <span className="text-lg">FCFA</span>
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action principale - Encaisser */}
        <Button
          onClick={() => navigate("/marchand/encaisser")}
          className="w-full h-20 text-xl font-bold rounded-2xl bg-secondary hover:bg-secondary/90 shadow-forest pulse-glow"
        >
          <Banknote className="w-8 h-8 mr-3" />
          Encaisser un paiement
        </Button>

        {/* Grille actions */}
        <div className="grid grid-cols-2 gap-4">
          {/* CMU */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/30"
            onClick={() => navigate("/marchand/cmu")}
          >
            <CardContent className="p-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold text-foreground">Protection CMU</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Cotisation & avantages
              </p>
              <div className="flex items-center text-primary text-sm mt-2 font-medium">
                Voir <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </CardContent>
          </Card>

          {/* Solde RSTI */}
          <Card className="border-2 border-secondary/20 bg-secondary/5">
            <CardContent className="p-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
                <Wallet className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-bold text-foreground">Solde RSTI</h3>
              <p className="text-2xl font-bold text-secondary mt-1">
                {(merchant?.rsti_balance || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">FCFA disponibles</p>
            </CardContent>
          </Card>
        </div>

        {/* Info CMU */}
        {merchant?.cmu_number && (
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <span className="text-2xl">🏥</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Numéro CMU</p>
                <p className="font-bold text-foreground">{merchant.cmu_number}</p>
              </div>
              <div className="text-secondary text-sm font-medium">
                Actif ✓
              </div>
            </CardContent>
          </Card>
        )}

        {/* Guide rapide */}
        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              💡 Astuce du jour
            </h3>
            <p className="text-sm text-muted-foreground">
              Chaque vente que vous enregistrez contribue à votre protection sociale CMU. 
              Plus vous vendez, plus vous êtes protégé !
            </p>
          </CardContent>
        </Card>
      </main>

      <BottomNav items={navItems} />
    </div>
  );
}
