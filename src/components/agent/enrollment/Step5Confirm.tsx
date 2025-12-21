import { useEffect, useState } from "react";
import { Check, MapPin, Camera, Store, User } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { EnrollmentData } from "@/hooks/useEnrollmentForm";

interface Step5ConfirmProps {
  data: EnrollmentData;
  confirmed: boolean;
  onConfirmChange: (confirmed: boolean) => void;
  isOnline: boolean;
}

export function Step5Confirm({ data, confirmed, onConfirmChange, isOnline }: Step5ConfirmProps) {
  const [marketName, setMarketName] = useState("");

  useEffect(() => {
    const fetchMarket = async () => {
      if (data.market_id) {
        const { data: market } = await supabase
          .from("markets")
          .select("name")
          .eq("id", data.market_id)
          .single();
        
        if (market) {
          setMarketName(market.name);
        }
      }
    };
    fetchMarket();
  }, [data.market_id]);

  const SummaryItem = ({ 
    icon: Icon, 
    label, 
    value, 
    valid 
  }: { 
    icon: React.ElementType; 
    label: string; 
    value: string; 
    valid: boolean;
  }) => (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-card border">
      <div className={`p-2 rounded-lg ${valid ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium truncate">{value || "—"}</p>
      </div>
      {valid && (
        <div className="p-1 rounded-full bg-secondary text-secondary-foreground">
          <Check className="w-4 h-4" />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 px-4">
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
        <h3 className="font-semibold text-primary mb-1">📋 Récapitulatif</h3>
        <p className="text-sm text-muted-foreground">
          Vérifiez les informations avant de valider l'enrôlement
        </p>
      </div>

      <div className="space-y-3">
        <SummaryItem
          icon={User}
          label="Numéro CMU"
          value={data.cmu_number}
          valid={data.cmu_number.length >= 5}
        />

        <SummaryItem
          icon={User}
          label="Nom complet"
          value={data.full_name}
          valid={data.full_name.length >= 3}
        />

        <SummaryItem
          icon={User}
          label="Téléphone"
          value={data.phone ? `+225 ${data.phone}` : ""}
          valid={data.phone.length >= 8}
        />

        <SummaryItem
          icon={Store}
          label="Type d'activité"
          value={data.activity_type}
          valid={data.activity_type.length > 0}
        />

        <SummaryItem
          icon={MapPin}
          label="Marché"
          value={marketName}
          valid={data.market_id.length > 0}
        />

        <SummaryItem
          icon={MapPin}
          label="Position GPS"
          value={
            data.latitude && data.longitude
              ? `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`
              : ""
          }
          valid={data.latitude !== null && data.longitude !== null}
        />

        <SummaryItem
          icon={Camera}
          label="Photos"
          value={`${data.cmu_photo_base64 ? "✅ CMU" : "❌ CMU"} | ${data.location_photo_base64 ? "✅ Lieu" : "— Lieu"}`}
          valid={data.cmu_photo_base64.length > 0}
        />
      </div>

      <div className="pt-4">
        <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-primary/30 bg-primary/5">
          <Checkbox
            id="confirm"
            checked={confirmed}
            onCheckedChange={(checked) => onConfirmChange(checked as boolean)}
            className="mt-1"
          />
          <Label htmlFor="confirm" className="text-sm leading-relaxed cursor-pointer">
            Je confirme que toutes les informations saisies sont exactes et que le marchand 
            a donné son consentement pour l'enrôlement.
          </Label>
        </div>
      </div>

      {!isOnline && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            ⚠️ Vous êtes hors-ligne. Les données seront synchronisées automatiquement 
            dès que la connexion sera rétablie.
          </p>
        </div>
      )}
    </div>
  );
}
