/**
 * Page Protection CMU - /marchand/cmu
 * Refactorisée avec Design System Jùlaba
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  JulabaPageLayout,
  JulabaHeader,
  JulabaCard,
  JulabaStatCard,
  JulabaListItem,
  JulabaBottomNav,
} from "@/shared/ui/julaba";
import { MERCHANT_NAV_ITEMS } from "@/config/navigation-julaba";
import { Progress } from "@/components/ui/progress";
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
  { emoji: "🏥", title: "Consultations", description: "Accès aux centres de santé" },
  { emoji: "💊", title: "Médicaments", description: "Prise en charge partielle" },
  { emoji: "🚑", title: "Urgences", description: "Évacuation et soins" },
  { emoji: "👶", title: "Maternité", description: "Suivi et accouchement" },
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

      const { data: merchantData } = await supabase
        .from("merchants")
        .select("id, cmu_number, cmu_valid_until, full_name")
        .eq("user_id", user.id)
        .single();

      if (merchantData) {
        setCmuData(merchantData);

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

  if (isLoading) {
    return (
      <JulabaPageLayout background="warm" className="flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-pulse">🏥</div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </JulabaPageLayout>
    );
  }

  return (
    <JulabaPageLayout background="warm" className="pb-24">
      <JulabaHeader
        title="🏥 Protection CMU"
        backPath="/marchand"
      />

      <main className="p-4 space-y-5 max-w-lg mx-auto">
        {/* Carte CMU */}
        <JulabaCard 
          accent={isValid ? "green" : "orange"}
          className="relative overflow-hidden"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Numéro CMU</p>
              <p className="text-xl font-bold text-foreground font-mono">
                {cmuData?.cmu_number || "—"}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              isValid 
                ? "bg-green-100 text-green-700" 
                : "bg-orange-100 text-orange-700"
            }`}>
              {isValid ? "✓ Actif" : "Expiré"}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">Titulaire</p>
            <p className="font-semibold text-foreground">{cmuData?.full_name || "—"}</p>
          </div>

          {cmuData?.cmu_valid_until && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <span>📅</span>
              Valide jusqu'au {new Date(cmuData.cmu_valid_until).toLocaleDateString("fr-FR")}
            </div>
          )}
        </JulabaCard>

        {/* Progression cotisations */}
        <JulabaCard>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <span>📊</span> Cotisations 2024
            </h3>
            <span className="text-sm text-muted-foreground">
              {yearlyTotal.toLocaleString()} / {yearlyTarget.toLocaleString()} F
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(progressPercent)}% de ta cotisation annuelle
          </p>
        </JulabaCard>

        {/* Avantages */}
        <div>
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <span>🎁</span> Tes avantages
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {benefits.map((benefit, index) => (
              <JulabaCard key={index} className="text-center py-4">
                <div className="text-3xl mb-2">{benefit.emoji}</div>
                <h4 className="font-bold text-foreground text-sm">{benefit.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{benefit.description}</p>
              </JulabaCard>
            ))}
          </div>
        </div>

        {/* Historique paiements */}
        <div>
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <span>📜</span> Dernières cotisations
          </h3>
          
          {payments.length > 0 ? (
            <div className="space-y-2">
              {payments.map((payment, index) => (
                <JulabaListItem
                  key={index}
                  emoji="✅"
                  title={new Date(payment.period_start).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                  subtitle="Cotisation mensuelle"
                  value={`${Number(payment.amount).toLocaleString()} F`}
                />
              ))}
            </div>
          ) : (
            <JulabaCard className="text-center py-6">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-muted-foreground text-sm">
                Tes cotisations apparaîtront ici
              </p>
            </JulabaCard>
          )}
        </div>

        {/* Info */}
        <JulabaCard accent="blue">
          <div className="flex items-start gap-3">
            <span className="text-3xl">💡</span>
            <div>
              <h3 className="font-bold text-foreground mb-1">Comment ça marche ?</h3>
              <p className="text-sm text-muted-foreground">
                À chaque vente, 1% est automatiquement prélevé pour ta cotisation CMU. 
                Tu es protégé tout en travaillant !
              </p>
            </div>
          </div>
        </JulabaCard>
      </main>

      <JulabaBottomNav items={MERCHANT_NAV_ITEMS} />
    </JulabaPageLayout>
  );
}
