/**
 * EnrollmentWizard - Wizard d'enrôlement marchand
 * Refonte Jùlaba Design System
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  JulabaPageLayout,
  JulabaHeader,
  JulabaButton,
  JulabaStepIndicator,
  type JulabaStep,
} from "@/shared/ui/julaba";
import { Step1Identity } from "@/features/agent/components/enrollment/Step1Identity";
import { Step2Documents } from "@/features/agent/components/enrollment/Step2Documents";
import { Step3Location } from "@/features/agent/components/enrollment/Step3Location";
import { Step4Activity } from "@/features/agent/components/enrollment/Step4Activity";
import { Step5Confirm } from "@/features/agent/components/enrollment/Step5Confirm";
import { useEnrollmentForm, enrollmentService } from "@/features/agent";
import { useOfflineSync } from "@/shared/hooks";
import { useAuth } from "@/shared/contexts";
import { supabase } from "@/integrations/supabase/client";

const STEPS: JulabaStep[] = [
  { id: "identity", label: "Identité", emoji: "👤" },
  { id: "documents", label: "Documents", emoji: "📄" },
  { id: "location", label: "Lieu", emoji: "📍" },
  { id: "activity", label: "Activité", emoji: "🏪" },
  { id: "confirm", label: "Confirmer", emoji: "✅" },
];

export default function EnrollmentWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOnline, addToQueue } = useOfflineSync();
  const {
    data,
    currentStep,
    updateField,
    nextStep,
    prevStep,
    clearDraft,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStep4Valid,
    phoneError,
    isCheckingPhone,
    checkPhoneUnique,
  } = useEnrollmentForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handlePhoneBlur = async () => {
    if (data.phone.length >= 8) {
      await checkPhoneUnique(data.phone);
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return isStep1Valid() && !phoneError;
      case 1:
        return isStep2Valid();
      case 2:
        return isStep3Valid();
      case 3:
        return isStep4Valid();
      case 4:
        return confirmed;
      default:
        return false;
    }
  };

  const uploadPhoto = async (
    base64: string,
    folder: string,
    filename: string
  ): Promise<string | null> => {
    if (!base64) return null;

    try {
      const res = await fetch(base64);
      const blob = await res.blob();

      const path = `${folder}/${filename}_${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from("merchant-photos")
        .upload(path, blob, { contentType: "image/jpeg" });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("merchant-photos")
        .getPublicUrl(path);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    if (!confirmed) {
      toast.error("Veuillez confirmer les informations");
      return;
    }

    setIsSubmitting(true);

    try {
      const agentId = await enrollmentService.getAgentId(user.id);
      if (!agentId) {
        toast.error("Profil agent non trouvé");
        setIsSubmitting(false);
        return;
      }

      const phoneUnique = await checkPhoneUnique(data.phone);
      if (!phoneUnique) {
        toast.error("Ce numéro de téléphone est déjà enregistré");
        setIsSubmitting(false);
        return;
      }

      if (isOnline) {
        const [cmuPhotoUrl, locationPhotoUrl, idDocPhotoUrl] = await Promise.all([
          uploadPhoto(data.cmu_photo_base64, "cmu", data.cmu_number),
          uploadPhoto(data.location_photo_base64, "locations", data.phone),
          uploadPhoto(data.id_doc_photo_base64, "id-docs", data.id_doc_number),
        ]);

        await enrollmentService.submitEnrollment({
          cmu_number: data.cmu_number.trim(),
          full_name: data.full_name.trim(),
          phone: data.phone.trim(),
          dob: data.dob,
          activity_type: data.activity_type,
          activity_description: data.activity_description || undefined,
          market_id: data.market_id,
          latitude: data.latitude,
          longitude: data.longitude,
          cmu_photo_url: cmuPhotoUrl,
          location_photo_url: locationPhotoUrl,
          id_doc_type: data.id_doc_type,
          id_doc_number: data.id_doc_number,
          id_doc_photo_url: idDocPhotoUrl,
          has_cnps: data.has_cnps,
          cnps_number: data.has_cnps ? data.cnps_number : null,
          enrolled_by: agentId,
        });

        toast.success("Marchand enregistré avec succès !");
      } else {
        const offlineData = {
          ...data,
          enrolled_by: agentId,
          created_at: new Date().toISOString(),
        };

        addToQueue("merchant_enrollment", "create", offlineData);
        toast.success("Inscription sauvegardée (hors ligne)");
      }

      clearDraft();
      navigate("/agent/marchands");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Erreur lors de l'inscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearDraft = () => {
    if (confirm("Effacer le brouillon ?")) {
      clearDraft();
      toast.info("Brouillon effacé");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1Identity 
            data={data} 
            updateField={updateField}
            phoneError={phoneError}
            isCheckingPhone={isCheckingPhone}
            onPhoneBlur={handlePhoneBlur}
          />
        );
      case 1:
        return <Step2Documents data={data} updateField={updateField} />;
      case 2:
        return <Step3Location data={data} updateField={updateField} />;
      case 3:
        return <Step4Activity data={data} updateField={updateField} />;
      case 4:
        return (
          <Step5Confirm
            data={data}
            confirmed={confirmed}
            onConfirmChange={setConfirmed}
            isOnline={isOnline}
          />
        );
      default:
        return null;
    }
  };

  return (
    <JulabaPageLayout background="gradient" withBottomNav={false}>
      {/* Header */}
      <JulabaHeader
        title="Nouvel Enrôlement"
        subtitle={`Étape ${currentStep + 1} sur 5`}
        showBack
        backPath="/agent"
        rightAction={{
          emoji: "🗑️",
          onClick: handleClearDraft,
          label: "Effacer brouillon"
        }}
      />

      {/* Indicateur d'étapes */}
      <div className="px-4 py-3 bg-white/80 backdrop-blur sticky top-16 z-40">
        <JulabaStepIndicator
          steps={STEPS}
          currentStep={currentStep}
        />
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto pb-32">
        {renderStep()}
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t p-4 max-w-[428px] mx-auto">
        <div className="flex gap-3">
          {currentStep > 0 && (
            <JulabaButton
              variant="secondary"
              onClick={prevStep}
              disabled={isSubmitting}
              className="flex-1"
              emoji="⬅️"
            >
              Précédent
            </JulabaButton>
          )}
          
          {currentStep < 4 ? (
            <JulabaButton
              variant="primary"
              onClick={nextStep}
              disabled={!canProceed() || isCheckingPhone}
              className="flex-1"
              emoji="➡️"
            >
              Suivant
            </JulabaButton>
          ) : (
            <JulabaButton
              variant="hero"
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              isLoading={isSubmitting}
              className="flex-1"
              emoji="✅"
            >
              {isSubmitting ? "Envoi..." : "Enregistrer"}
            </JulabaButton>
          )}
        </div>
      </div>
    </JulabaPageLayout>
  );
}
