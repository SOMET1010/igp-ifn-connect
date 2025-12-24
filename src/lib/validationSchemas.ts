import { z } from 'zod';

// === Phone validation for Côte d'Ivoire ===

// Valid prefixes for Ivorian operators: 01, 05, 07
const CI_PHONE_REGEX = /^(01|05|07)[0-9]{8}$/;
const CI_FULL_PHONE_REGEX = /^225(01|05|07)[0-9]{8}$/;

// Local format: 10 digits starting with 01, 05, or 07
export const phoneLocalSchema = z
  .string()
  .min(1, 'Le numéro de téléphone est requis')
  .regex(CI_PHONE_REGEX, 'Numéro invalide. Doit commencer par 01, 05 ou 07 (10 chiffres)')
  .transform(val => val.replace(/\s/g, ''));

// Full format with country code: 225 + 10 digits
export const phoneFullSchema = z
  .string()
  .min(1, 'Le numéro de téléphone est requis')
  .regex(CI_FULL_PHONE_REGEX, 'Format invalide (225 + 10 chiffres, commence par 01, 05 ou 07)')
  .transform(val => val.replace(/\s/g, ''));

// Optional local phone schema
export const phoneLocalOptionalSchema = z
  .string()
  .regex(CI_PHONE_REGEX, 'Numéro invalide. Doit commencer par 01, 05 ou 07 (10 chiffres)')
  .optional()
  .nullable()
  .or(z.literal(''));

// Legacy schema for backward compatibility
export const phoneSchema = phoneLocalSchema;

// === Phone helpers ===

// Normalize phone to full format (add 225 prefix if needed)
export function normalizePhoneCI(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10 && CI_PHONE_REGEX.test(cleaned)) {
    return `225${cleaned}`;
  }
  if (cleaned.startsWith('225') && cleaned.length === 13) {
    return cleaned;
  }
  return cleaned;
}

// Format phone for display (with spaces)
export function formatPhoneCI(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const local = cleaned.length === 13 ? cleaned.slice(3) : cleaned;
  if (local.length !== 10) return phone;
  return local.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
}

// Check if phone has valid Ivorian prefix
export function isValidCIPhonePrefix(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 0) return true;
  return cleaned.startsWith('01') || cleaned.startsWith('05') || cleaned.startsWith('07');
}

// Email validation
export const emailSchema = z
  .string()
  .min(1, 'L\'adresse email est requise')
  .email('Adresse email invalide')
  .max(255, 'Email trop long (max 255 caractères)')
  .transform(val => val.toLowerCase().trim());

// Password validation
export const passwordSchema = z
  .string()
  .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
  .max(72, 'Le mot de passe est trop long (max 72 caractères)');

// Strong password validation (for registration)
export const strongPasswordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(72, 'Le mot de passe est trop long')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre');

// Full name validation
export const fullNameSchema = z
  .string()
  .min(3, 'Le nom doit contenir au moins 3 caractères')
  .max(100, 'Le nom est trop long (max 100 caractères)')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom contient des caractères non autorisés')
  .transform(val => val.trim());

// OTP validation
export const otpSchema = z
  .string()
  .length(6, 'Le code doit contenir 6 chiffres')
  .regex(/^[0-9]{6}$/, 'Le code doit contenir uniquement des chiffres');

// Login form schema
export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Signup form schema
export const signupFormSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
  fullName: fullNameSchema,
});

// Phone login form schema
export const phoneLoginSchema = z.object({
  phone: phoneSchema,
});

// Type exports
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type SignupFormData = z.infer<typeof signupFormSchema>;
export type PhoneLoginData = z.infer<typeof phoneLoginSchema>;

// Helper to get first error message from Zod error
export function getZodErrorMessage(error: z.ZodError): string {
  const firstError = error.errors[0];
  return firstError?.message ?? 'Données invalides';
}

// Safe parse helper that returns error message
export function validateField<T>(
  schema: z.ZodType<T>,
  value: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(value);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: getZodErrorMessage(result.error) };
}

// Simple validation that just returns error string or null
export function getValidationError<T>(
  schema: z.ZodType<T>,
  value: unknown
): string | null {
  const result = schema.safeParse(value);
  if (result.success) {
    return null;
  }
  return getZodErrorMessage(result.error);
}
