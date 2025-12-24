import { z } from "zod";

// === Enrollment Form Data ===

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

export const initialEnrollmentData: EnrollmentData = {
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

// === Enrollment Validation Schema ===

export const EnrollmentStep1Schema = z.object({
  cmu_number: z.string().min(5, "Le numéro CMU doit contenir au moins 5 caractères"),
  full_name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  phone: z.string().min(8, "Le téléphone doit contenir au moins 8 chiffres"),
});

export const EnrollmentStep2Schema = z.object({
  activity_type: z.string().min(1, "Veuillez sélectionner un type d'activité"),
  activity_description: z.string().optional(),
});

export const EnrollmentStep3Schema = z.object({
  market_id: z.string().uuid("Veuillez sélectionner un marché"),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

// === Enrollment Constants ===

export const ENROLLMENT_DRAFT_KEY = "igp_enrollment_draft";

export const ENROLLMENT_STEPS = [
  "Identité",
  "Activité", 
  "Localisation",
  "Photos",
  "Confirmation",
] as const;

export type EnrollmentStep = typeof ENROLLMENT_STEPS[number];
