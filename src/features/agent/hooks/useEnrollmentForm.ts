import { useState, useEffect, useCallback } from "react";
import { 
  EnrollmentData, 
  initialEnrollmentData, 
  ENROLLMENT_DRAFT_KEY 
} from "../types/enrollment.types";

export function useEnrollmentForm() {
  const [data, setData] = useState<EnrollmentData>(initialEnrollmentData);
  const [currentStep, setCurrentStep] = useState(0);

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
  }, []);

  const isStep1Valid = useCallback(() => {
    return (
      data.cmu_number.trim().length >= 5 &&
      data.full_name.trim().length >= 3 &&
      data.phone.trim().length >= 8
    );
  }, [data.cmu_number, data.full_name, data.phone]);

  const isStep2Valid = useCallback(() => {
    return data.activity_type.trim().length > 0;
  }, [data.activity_type]);

  const isStep3Valid = useCallback(() => {
    return (
      data.market_id.trim().length > 0 &&
      data.latitude !== null &&
      data.longitude !== null
    );
  }, [data.market_id, data.latitude, data.longitude]);

  const isStep4Valid = useCallback(() => {
    return data.cmu_photo_base64.length > 0 || data.cmu_photo_file !== null;
  }, [data.cmu_photo_base64, data.cmu_photo_file]);

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
  };
}
