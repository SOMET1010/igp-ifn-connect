/**
 * Contenu de la section CMU (intégré dans MerchantProfile)
 * Extrait de MerchantCMU.tsx
 */

import { useEffect, useState } from "react";
import { Shield, Calendar, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
  { icon: "🏥", title: "Consultations", description: "Centres de santé" },
  { icon: "💊", title: "Médicaments", description: "Prise en charge" },
  { icon: "🚑", title: "Urgences", description: "Soins d'urgence" },
  { icon: "👶", title: "Maternité", description: "Suivi grossesse" },
];

export function CMUSectionContent() {
  const { user } = useAuth();
  const [cmuData, setCmuData] = useState<CMUData | null>(null);
  const [payments, setPayments] = useState<CMUPayment[]>([]);
  const [yearlyTotal, setYearlyTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const yearlyTarget = 24000;
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
          .limit(4);

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
    return <div className="py-4 text-center text-muted-foreground">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Carte CMU */}
      <div className={`p-4 rounded-xl border-2 ${isValid ? "border-pnavim-secondary bg-pnavim-secondary/5" : "border-destructive/30 bg-destructive/5"}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Numéro CMU</p>
            <p className="text-lg font-bold text-foreground font-mono">
              {cmuData?.cmu_number || "—"}
            </p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isValid 
              ? "bg-pnavim-secondary text-white" 
              : "bg-destructive text-white"
          }`}>
            {isValid ? "✓ Actif" : "Expiré"}
          </div>
        </div>

        {cmuData?.cmu_valid_until && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Valide jusqu'au {new Date(cmuData.cmu_valid_until).toLocaleDateString("fr-FR")}</span>
          </div>
        )}
      </div>

      {/* Progression cotisations */}
      <div className="p-3 bg-muted/50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Cotisations 2024</span>
          <span className="text-xs text-muted-foreground">
            {yearlyTotal.toLocaleString()} / {yearlyTarget.toLocaleString()} F
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1">
          {Math.round(progressPercent)}% de l'année
        </p>
      </div>

      {/* Avantages */}
      <div className="grid grid-cols-2 gap-2">
        {benefits.map((benefit, index) => (
          <div key={index} className="p-2 bg-muted/30 rounded-lg text-center">
            <div className="text-xl mb-1">{benefit.icon}</div>
            <p className="text-xs font-medium text-foreground">{benefit.title}</p>
          </div>
        ))}
      </div>

      {/* Dernières cotisations */}
      {payments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Dernières cotisations</p>
          {payments.slice(0, 2).map((payment, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-pnavim-secondary" />
                <span className="text-sm">
                  {new Date(payment.period_start).toLocaleDateString("fr-FR", { month: "short" })}
                </span>
              </div>
              <span className="text-sm font-bold text-pnavim-secondary">
                {Number(payment.amount).toLocaleString()} F
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
