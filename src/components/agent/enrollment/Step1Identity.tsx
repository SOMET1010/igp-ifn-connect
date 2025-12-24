import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EnrollmentData } from "@/features/agent";
import { VoiceInput } from "@/components/shared/VoiceInput";
import { useLanguage } from "@/contexts/LanguageContext";

interface Step1IdentityProps {
  data: EnrollmentData;
  updateField: <K extends keyof EnrollmentData>(field: K, value: EnrollmentData[K]) => void;
}

export function Step1Identity({ data, updateField }: Step1IdentityProps) {
  const { language } = useLanguage();

  return (
    <div className="space-y-6 px-4">
      <div className="space-y-2">
        <Label htmlFor="cmu_number" className="text-base font-semibold flex items-center gap-2">
          📋 Numéro CMU
        </Label>
        <Input
          id="cmu_number"
          type="text"
          placeholder="Ex: CI-2024-123456"
          value={data.cmu_number}
          onChange={(e) => updateField("cmu_number", e.target.value)}
          className="h-14 text-lg rounded-xl border-2 focus:border-primary"
        />
        <p className="text-sm text-muted-foreground">
          Numéro figurant sur la carte CMU du marchand
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name" className="text-base font-semibold flex items-center gap-2">
          👤 Nom complet
        </Label>
        <div className="flex gap-2">
          <Input
            id="full_name"
            type="text"
            placeholder="Ex: Kouamé Adjoua"
            value={data.full_name}
            onChange={(e) => updateField("full_name", e.target.value)}
            className="h-14 text-lg rounded-xl border-2 focus:border-primary flex-1"
          />
          <VoiceInput
            language={language}
            onResult={(text) => updateField("full_name", data.full_name ? `${data.full_name} ${text}` : text)}
            className="h-14"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Nom et prénom(s) du marchand
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-base font-semibold flex items-center gap-2">
          📱 Téléphone
        </Label>
        <div className="flex gap-2">
          <div className="flex items-center justify-center h-14 px-4 bg-muted rounded-xl text-lg font-medium">
            +225
          </div>
          <Input
            id="phone"
            type="tel"
            placeholder="07 12 34 56 78"
            value={data.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className="h-14 text-lg rounded-xl border-2 focus:border-primary flex-1"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Numéro Mobile Money du marchand
        </p>
      </div>
    </div>
  );
}
