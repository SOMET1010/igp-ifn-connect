import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EnrollmentData } from "@/features/agent";
import { VoiceInput } from "@/components/shared/VoiceInput";
import { useLanguage } from "@/contexts/LanguageContext";
import { PhoneInput } from "@/components/shared/PhoneInput";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface Step1IdentityProps {
  data: EnrollmentData;
  updateField: <K extends keyof EnrollmentData>(field: K, value: EnrollmentData[K]) => void;
  phoneError: string | null;
  isCheckingPhone: boolean;
  onPhoneBlur: () => void;
}

export function Step1Identity({ 
  data, 
  updateField, 
  phoneError, 
  isCheckingPhone,
  onPhoneBlur 
}: Step1IdentityProps) {
  const { language } = useLanguage();

  // Calculate age for display
  const getAge = (dob: string): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = getAge(data.dob);
  const isAdult = age !== null && age >= 18;

  return (
    <div className="space-y-6 px-4">
      <div className="space-y-2">
        <Label htmlFor="cmu_number" className="text-base font-semibold flex items-center gap-2">
          📋 Numéro CMU *
        </Label>
        <Input
          id="cmu_number"
          type="text"
          placeholder="Ex: CI-2024-123456"
          value={data.cmu_number}
          onChange={(e) => updateField("cmu_number", e.target.value)}
          className="input-kpata"
        />
        <p className="text-sm text-muted-foreground">
          Numéro figurant sur la carte CMU du marchand
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name" className="text-base font-semibold flex items-center gap-2">
          👤 Nom complet *
        </Label>
        <div className="flex gap-2">
          <Input
            id="full_name"
            type="text"
            placeholder="Ex: Kouamé Adjoua"
            value={data.full_name}
            onChange={(e) => updateField("full_name", e.target.value)}
            className="input-kpata flex-1"
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
        <Label htmlFor="dob" className="text-base font-semibold flex items-center gap-2">
          🎂 Date de naissance *
        </Label>
        <Input
          id="dob"
          type="date"
          value={data.dob}
          onChange={(e) => updateField("dob", e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          className="input-kpata"
        />
        {data.dob && (
          <div className={`flex items-center gap-2 text-sm ${isAdult ? "text-green-600" : "text-destructive"}`}>
            {isAdult ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>{age} ans - Majeur ✓</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                <span>{age} ans - Le marchand doit avoir au moins 18 ans</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <PhoneInput
          value={data.phone}
          onChange={(value) => updateField("phone", value)}
          onBlur={onPhoneBlur}
          label="📱 Téléphone *"
          placeholder="07 01 02 03 04"
        />
        {isCheckingPhone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Vérification du numéro...</span>
          </div>
        )}
        {phoneError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{phoneError}</span>
          </div>
        )}
        {!phoneError && !isCheckingPhone && data.phone.length >= 8 && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Numéro disponible</span>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Numéro Mobile Money du marchand (unique)
        </p>
      </div>
    </div>
  );
}
