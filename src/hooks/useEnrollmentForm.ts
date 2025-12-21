import { useState, useEffect, useCallback } from "react";

export interface EnrollmentData {
  // Step 1 - Identity
  cmu_number: string;
  full_name: string;
  phone: string;
  
  // Step 2 - Activity
  activity_type: string;
  activity_description: string;
  
  // Step 3 - Location
  market_id: string;
  latitude: number | null;
  longitude: number | null;
  
  // Step 4 - Photos (base64 for offline)
  cmu_photo_file: File | null;
  cmu_photo_base64: string;
  location_photo_file: File | null;
  location_photo_base64: string;
}

const DRAFT_KEY = "igp_enrollment_draft";

const initialData: EnrollmentData = {
  cmu_number: "",
  full_name: "",
  phone: "",
  activity_type: "",
  activity_description: "",
  market_id: "",
  latitude: null,
  longitude: null,
  cmu_photo_file: null,
  cmu_photo_base64: "",
  location_photo_file: null,
  location_photo_base64: "",
};

export function useEnrollmentForm() {
  const [data, setData] = useState<EnrollmentData>(initialData);
  const [currentStep, setCurrentStep] = useState(0);

  // Load draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Restore all except File objects
        setData({
          ...initialData,
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
      localStorage.setItem(DRAFT_KEY, JSON.stringify(toSave));
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
    localStorage.removeItem(DRAFT_KEY);
    setData(initialData);
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
