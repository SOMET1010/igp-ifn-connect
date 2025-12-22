import { z } from 'zod';

// Phone validation for Côte d'Ivoire (10 digits)
export const phoneSchema = z
  .string()
  .min(1, 'Le numéro de téléphone est requis')
  .regex(/^[0-9]{10}$/, 'Numéro de téléphone invalide (10 chiffres requis)')
  .transform(val => val.replace(/\s/g, ''));

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
