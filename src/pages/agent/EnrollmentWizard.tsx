import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Send, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepProgress } from "@/components/shared/StepProgress";
import { Step1Identity } from "@/components/agent/enrollment/Step1Identity";
import { Step2Documents } from "@/components/agent/enrollment/Step2Documents";
import { Step3Location } from "@/components/agent/enrollment/Step3Location";
import { Step4Activity } from "@/components/agent/enrollment/Step4Activity";
import { Step5Confirm } from "@/components/agent/enrollment/Step5Confirm";
import { useEnrollmentForm, enrollmentService } from "@/features/agent";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STEPS = ["Identité", "Documents", "Localisation", "Activité", "Confirmation"];

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
      // Get agent ID
      const agentId = await enrollmentService.getAgentId(user.id);
      if (!agentId) {
        toast.error("Profil agent non trouvé");
        setIsSubmitting(false);
        return;
      }

      // Final phone check
      const phoneUnique = await checkPhoneUnique(data.phone);
      if (!phoneUnique) {
        toast.error("Ce numéro de téléphone est déjà enregistré");
        setIsSubmitting(false);
        return;
      }

      if (isOnline) {
        // Upload photos in parallel
        const [cmuPhotoUrl, locationPhotoUrl, idDocPhotoUrl] = await Promise.all([
          uploadPhoto(data.cmu_photo_base64, "cmu", data.cmu_number),
          uploadPhoto(data.location_photo_base64, "locations", data.phone),
          uploadPhoto(data.id_doc_photo_base64, "id-docs", data.id_doc_number),
        ]);

        // Submit to database
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
        // Save for offline sync
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 h-16">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/agent")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-lg">Nouvel Enrôlement</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm("Effacer le brouillon ?")) {
                clearDraft();
                toast.info("Brouillon effacé");
              }
            }}
          >
            <Trash2 className="w-5 h-5 text-destructive" />
          </Button>
        </div>
      </header>

      {/* Step Progress */}
      <StepProgress steps={STEPS} currentStep={currentStep} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-32">{renderStep()}</div>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-4">
        <div className="flex gap-3 max-w-lg mx-auto">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
              className="flex-1 h-14 text-lg rounded-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Précédent
            </Button>
          )}
          
          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed() || isCheckingPhone}
              className="flex-1 h-14 text-lg rounded-xl"
            >
              Suivant
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="flex-1 h-14 text-lg rounded-xl bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
