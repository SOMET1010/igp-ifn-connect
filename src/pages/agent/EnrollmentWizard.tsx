import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepProgress } from "@/components/shared/StepProgress";
import { Step1Identity } from "@/components/agent/enrollment/Step1Identity";
import { Step2Activity } from "@/components/agent/enrollment/Step2Activity";
import { Step3Location } from "@/components/agent/enrollment/Step3Location";
import { Step4Photos } from "@/components/agent/enrollment/Step4Photos";
import { Step5Confirm } from "@/components/agent/enrollment/Step5Confirm";
import { useEnrollmentForm } from "@/hooks/useEnrollmentForm";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STEPS = ["Identité", "Activité", "Localisation", "Photos", "Confirmation"];

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
  } = useEnrollmentForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return isStep1Valid();
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

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get agent ID
      const { data: agentData } = await supabase
        .from("agents")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!agentData) {
        toast.error("Profil agent non trouvé");
        setIsSubmitting(false);
        return;
      }

      const merchantData = {
        cmu_number: data.cmu_number.trim(),
        full_name: data.full_name.trim(),
        phone: data.phone.trim(),
        activity_type: data.activity_type,
        activity_description: data.activity_description || null,
        market_id: data.market_id,
        latitude: data.latitude,
        longitude: data.longitude,
        enrolled_by: agentData.id,
        status: "pending" as const,
        // Photos stored as base64 for now (will be uploaded to storage later)
        cmu_photo_url: data.cmu_photo_base64 || null,
        location_photo_url: data.location_photo_base64 || null,
      };

      if (isOnline) {
        // Direct insert to Supabase
        const { error } = await supabase.from("merchants").insert(merchantData);

        if (error) {
          console.error("Insert error:", error);
          toast.error("Erreur lors de l'enregistrement");
          setIsSubmitting(false);
          return;
        }

        // Update agent enrollment count
        await supabase
          .from("agents")
          .update({ total_enrollments: (agentData as any).total_enrollments + 1 || 1 })
          .eq("id", agentData.id)
          .then(() => {
          // Ignore if RPC doesn't exist
        });

        toast.success("Marchand enrôlé avec succès !");
      } else {
        // Save to offline queue
        addToQueue("merchants", "insert", {
          ...merchantData,
          id: crypto.randomUUID(),
        });
        toast.success("Enrôlement sauvegardé. Synchronisation automatique à la reconnexion.");
      }

      clearDraft();
      navigate("/agent");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1Identity data={data} updateField={updateField} />;
      case 1:
        return <Step2Activity data={data} updateField={updateField} />;
      case 2:
        return <Step3Location data={data} updateField={updateField} />;
      case 3:
        return <Step4Photos data={data} updateField={updateField} />;
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
            onClick={() => (currentStep > 0 ? prevStep() : navigate("/agent"))}
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
      <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-4 space-y-3">
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={prevStep}
              className="flex-1 h-14 text-lg rounded-xl"
            >
              Précédent
            </Button>
          )}
          
          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex-1 h-14 text-lg rounded-xl bg-gradient-africa hover:opacity-90"
            >
              Suivant
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="flex-1 h-14 text-lg rounded-xl bg-gradient-forest hover:opacity-90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Enregistrement...
                </>
              ) : (
                <>✅ Enregistrer le Marchand</>
              )}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
