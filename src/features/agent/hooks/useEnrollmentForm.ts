import { useState, useEffect, useCallback } from "react";
import { 
  EnrollmentData, 
  initialEnrollmentData, 
  ENROLLMENT_DRAFT_KEY,
  EnrollmentStep1Schema,
  EnrollmentStep2Schema,
  EnrollmentStep3Schema,
  EnrollmentStep4Schema,
} from "../types/enrollment.types";
import { supabase } from "@/integrations/supabase/client";

export function useEnrollmentForm() {
  const [data, setData] = useState<EnrollmentData>(initialEnrollmentData);
  const [currentStep, setCurrentStep] = useState(0);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);

  // Load draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ENROLLMENT_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Restore all except File objects
        setData({
          ...initialEnrollmentData,
          ...parsed,
          cmu_photo_file: null,
          location_photo_file: null,
          id_doc_photo_file: null,
        });
        setCurrentStep(parsed.currentStep || 0);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save draft on data change
  const saveDraft = useCallback(() => {
    try {
      const toSave = {
        ...data,
        cmu_photo_file: null,
        location_photo_file: null,
        id_doc_photo_file: null,
        currentStep,
      };
      localStorage.setItem(ENROLLMENT_DRAFT_KEY, JSON.stringify(toSave));
    } catch {
      // Ignore storage errors
    }
  }, [data, currentStep]);

  useEffect(() => {
    saveDraft();
  }, [saveDraft]);

  const updateField = useCallback(<K extends keyof EnrollmentData>(
    field: K,
    value: EnrollmentData[K]
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
    
    // Clear phone error when phone changes
    if (field === "phone") {
      setPhoneError(null);
    }
  }, []);

  // Check if phone is unique
  const checkPhoneUnique = useCallback(async (phone: string): Promise<boolean> => {
    if (!phone || phone.length < 8) return true;
    
    setIsCheckingPhone(true);
    try {
      const { data: existing, error } = await supabase
        .from("merchants")
        .select("id")
        .eq("phone", phone)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking phone:", error);
        return true; // Allow to proceed on error
      }
      
      if (existing) {
        setPhoneError("Ce numéro de téléphone est déjà enregistré");
        return false;
      }
      
      setPhoneError(null);
      return true;
    } finally {
      setIsCheckingPhone(false);
    }
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, 4)));
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(ENROLLMENT_DRAFT_KEY);
    setData(initialEnrollmentData);
    setCurrentStep(0);
    setPhoneError(null);
  }, []);

  // Step validations using Zod schemas
  const isStep1Valid = useCallback((): boolean => {
    const result = EnrollmentStep1Schema.safeParse(data);
    return result.success && !phoneError;
  }, [data, phoneError]);

  const isStep2Valid = useCallback((): boolean => {
    const result = EnrollmentStep2Schema.safeParse(data);
    return result.success;
  }, [data]);

  const isStep3Valid = useCallback((): boolean => {
    const result = EnrollmentStep3Schema.safeParse(data);
    return result.success;
  }, [data]);

  const isStep4Valid = useCallback((): boolean => {
    const result = EnrollmentStep4Schema.safeParse(data);
    return result.success;
  }, [data]);

  // Get validation errors for current step
  const getStep1Errors = useCallback(() => {
    const result = EnrollmentStep1Schema.safeParse(data);
    if (!result.success) {
      return result.error.flatten().fieldErrors;
    }
    return {};
  }, [data]);

  const getStep2Errors = useCallback(() => {
    const result = EnrollmentStep2Schema.safeParse(data);
    if (!result.success) {
      return result.error.flatten().fieldErrors;
    }
    return {};
  }, [data]);

  return {
    data,
    currentStep,
    updateField,
    nextStep,
    prevStep,
    goToStep,
    clearDraft,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isStep4Valid,
    getStep1Errors,
    getStep2Errors,
    phoneError,
    isCheckingPhone,
    checkPhoneUnique,
  };
}
