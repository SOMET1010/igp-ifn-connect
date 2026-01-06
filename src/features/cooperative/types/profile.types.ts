import { z } from 'zod';
import { phoneLocalOptionalSchema, emailSchema } from '@/shared/lib';

// === Cooperative Profile Data ===

export interface CooperativeProfileData {
  id: string;
  name: string;
  code: string;
  region: string;
  commune: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  igp_certified: boolean;
  total_members: number;
  latitude: number | null;
  longitude: number | null;
}

// === Form Data ===

export interface CooperativeProfileFormData {
  address: string;
  region: string;
  commune: string;
  phone: string;
  email: string;
  latitude: number | null;
  longitude: number | null;
}

// === Validation Schema ===

export const cooperativeProfileSchema = z.object({
  address: z.string().max(500, 'Adresse trop longue').optional().or(z.literal('')),
  region: z.string().min(1, 'La région est obligatoire'),
  commune: z.string().min(1, 'La commune est obligatoire'),
  phone: phoneLocalOptionalSchema,
  email: z.string().email('Format d\'email invalide').optional().or(z.literal('')),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

export type CooperativeProfileFormSchema = z.infer<typeof cooperativeProfileSchema>;

// === Regions list (Côte d'Ivoire) ===

export const REGIONS_CI = [
  'Abidjan', 'Abengourou', 'Adzopé', 'Agboville', 'Bondoukou', 
  'Bongouanou', 'Bouaflé', 'Bouaké', 'Bouna', 'Dabou', 
  'Daloa', 'Dimbokro', 'Divo', 'Ferkessédougou', 'Gagnoa', 
  'Korhogo', 'Man', 'Odienné', 'San-Pédro', 'Yamoussoukro'
] as const;

export type RegionCI = typeof REGIONS_CI[number];
