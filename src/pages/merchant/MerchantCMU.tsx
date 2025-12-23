import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Calendar, FileText, Check } from "lucide-react";
import { UnifiedHeader } from "@/components/shared/UnifiedHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UnifiedBottomNav } from "@/components/shared/UnifiedBottomNav";
import { merchantNavItems } from "@/config/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface CMUData {
  cmu_number: string;
  cmu_valid_until: string | null;
  full_name: string;
}

interface CMUPayment {
  period_start: string;
  period_end: string;
  amount: number;
}

const benefits = [
  { icon: "🏥", title: "Consultations médicales", description: "Accès aux centres de santé" },
  { icon: "💊", title: "Médicaments essentiels", description: "Prise en charge partielle" },
  { icon: "🚑", title: "Urgences", description: "Évacuation et soins d'urgence" },
  { icon: "👶", title: "Maternité", description: "Suivi grossesse et accouchement" },
];

export default function MerchantCMU() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cmuData, setCmuData] = useState<CMUData | null>(null);
  const [payments, setPayments] = useState<CMUPayment[]>([]);
  const [yearlyTotal, setYearlyTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const yearlyTarget = 24000; // 2000 FCFA/mois x 12
  const progressPercent = Math.min((yearlyTotal / yearlyTarget) * 100, 100);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch merchant CMU data
      const { data: merchantData } = await supabase
        .from("merchants")
        .select("id, cmu_number, cmu_valid_until, full_name")
        .eq("user_id", user.id)
        .single();

      if (merchantData) {
        setCmuData(merchantData);

        // Fetch CMU payments
        const { data: paymentsData } = await supabase
          .from("cmu_payments")
          .select("period_start, period_end, amount")
          .eq("merchant_id", merchantData.id)
          .order("period_start", { ascending: false })
          .limit(6);

        if (paymentsData) {
          setPayments(paymentsData);
          const total = paymentsData.reduce((sum, p) => sum + Number(p.amount), 0);
          setYearlyTotal(total);
        }
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  const isValid = cmuData?.cmu_valid_until 
    ? new Date(cmuData.cmu_valid_until) > new Date()
    : false;

  return (
    <div className="min-h-screen bg-background pb-24">
      <UnifiedHeader
        title="Protection CMU"
        subtitle="Couverture Maladie Universelle"
        showBack
        backTo="/marchand"
        rightContent={<Shield className="h-6 w-6 text-muted-foreground" />}
      />

      <main className="p-4 space-y-5">
        {/* Carte CMU */}
        <Card className={`border-2 ${isValid ? "border-secondary bg-secondary/5" : "border-destructive/30 bg-destructive/5"}`}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Numéro CMU</p>
                <p className="text-xl font-bold text-foreground font-mono">
                  {cmuData?.cmu_number || "—"}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isValid 
                  ? "bg-secondary text-secondary-foreground" 
                  : "bg-destructive text-destructive-foreground"
              }`}>
                {isValid ? "✓ Actif" : "Expiré"}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">Titulaire</p>
              <p className="font-semibold text-foreground">{cmuData?.full_name || "—"}</p>
            </div>

            {cmuData?.cmu_valid_until && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Valide jusqu'au {new Date(cmuData.cmu_valid_until).toLocaleDateString("fr-FR")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progression cotisations */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Cotisations 2024</h3>
              <span className="text-sm text-muted-foreground">
                {yearlyTotal.toLocaleString()} / {yearlyTarget.toLocaleString()} FCFA
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(progressPercent)}% de votre cotisation annuelle
            </p>
          </CardContent>
        </Card>

        {/* Avantages */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Vos avantages</h3>
          <div className="grid grid-cols-2 gap-3">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="text-2xl mb-2">{benefit.icon}</div>
                  <h4 className="font-medium text-foreground text-sm">{benefit.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Historique paiements */}
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Dernières cotisations
          </h3>
          
          {payments.length > 0 ? (
            <div className="space-y-2">
              {payments.map((payment, index) => (
                <Card key={index}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                        <Check className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {new Date(payment.period_start).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                        </p>
                        <p className="text-xs text-muted-foreground">Cotisation mensuelle</p>
                      </div>
                    </div>
                    <p className="font-bold text-secondary">
                      {Number(payment.amount).toLocaleString()} FCFA
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground text-sm">
                  Vos cotisations CMU apparaîtront ici
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info */}
        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-2">💡 Comment ça marche ?</h3>
            <p className="text-sm text-muted-foreground">
              À chaque vente, 1% est automatiquement prélevé pour votre cotisation CMU. 
              Vous êtes ainsi protégé tout en travaillant !
            </p>
          </CardContent>
        </Card>
      </main>

      <UnifiedBottomNav items={merchantNavItems} />
    </div>
  );
}
