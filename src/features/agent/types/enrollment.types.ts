import { z } from "zod";
import { phoneLocalSchema } from "@/lib/validationSchemas";

// === Types de documents d'identité ===
export type IdDocType = 'cni' | 'attestation' | 'passport' | 'autre' | '';

// === Enrollment Form Data ===

export interface EnrollmentData {
  // Step 1 - Identity
  cmu_number: string;
  full_name: string;
  phone: string;
  dob: string; // YYYY-MM-DD
  
  // Step 2 - Documents (Pièces d'identité)
  id_doc_type: IdDocType;
  id_doc_number: string;
  id_doc_photo_file: File | null;
  id_doc_photo_base64: string;
  cmu_photo_file: File | null;
  cmu_photo_base64: string;
  
  // Step 3 - Location
  market_id: string;
  latitude: number | null;
  longitude: number | null;
  
  // Step 4 - Activity & Coverage
  activity_type: string;
  activity_description: string;
  has_cnps: boolean;
  cnps_number: string;
  location_photo_file: File | null;
  location_photo_base64: string;
}

export const initialEnrollmentData: EnrollmentData = {
  // Step 1
  cmu_number: "",
  full_name: "",
  phone: "",
  dob: "",
  
  // Step 2
  id_doc_type: "",
  id_doc_number: "",
  id_doc_photo_file: null,
  id_doc_photo_base64: "",
  cmu_photo_file: null,
  cmu_photo_base64: "",
  
  // Step 3
  market_id: "",
  latitude: null,
  longitude: null,
  
  // Step 4
  activity_type: "",
  activity_description: "",
  has_cnps: false,
  cnps_number: "",
  location_photo_file: null,
  location_photo_base64: "",
};

// === Enrollment Validation Schemas ===

// Validation âge >= 18 ans
const isAdult = (dob: string): boolean => {
  if (!dob) return false;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 18;
};

export const EnrollmentStep1Schema = z.object({
  cmu_number: z.string().min(5, "Le numéro CMU doit contenir au moins 5 caractères"),
  full_name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  phone: phoneLocalSchema,
  dob: z.string()
    .min(1, "La date de naissance est requise")
    .refine(isAdult, "Le marchand doit avoir au moins 18 ans"),
});

export const EnrollmentStep2Schema = z.object({
  id_doc_type: z.string().min(1, "Veuillez sélectionner un type de pièce"),
  id_doc_number: z.string().min(3, "Le numéro de pièce doit contenir au moins 3 caractères"),
  id_doc_photo_base64: z.string().min(1, "La photo de la pièce d'identité est requise"),
  cmu_photo_base64: z.string().min(1, "La photo de la carte CMU est requise"),
});

export const EnrollmentStep3Schema = z.object({
  market_id: z.string().uuid("Veuillez sélectionner un marché"),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

export const EnrollmentStep4Schema = z.object({
  activity_type: z.string().min(1, "Veuillez sélectionner un type d'activité"),
  activity_description: z.string().optional(),
  has_cnps: z.boolean(),
  cnps_number: z.string().optional(),
}).refine(
  (data) => !data.has_cnps || (data.cnps_number && data.cnps_number.length >= 5),
  {
    message: "Le numéro CNPS doit contenir au moins 5 caractères",
    path: ["cnps_number"],
  }
);

// === Enrollment Constants ===

export const ENROLLMENT_DRAFT_KEY = "igp_enrollment_draft";

export const ENROLLMENT_STEPS = [
  "Identité",
  "Documents", 
  "Localisation",
  "Activité",
  "Confirmation",
] as const;

export type EnrollmentStep = typeof ENROLLMENT_STEPS[number];

export const ID_DOC_TYPES: { value: IdDocType; label: string }[] = [
  { value: "cni", label: "Carte Nationale d'Identité" },
  { value: "attestation", label: "Attestation d'identité" },
  { value: "passport", label: "Passeport" },
  { value: "autre", label: "Autre document" },
];
