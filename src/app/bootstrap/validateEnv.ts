/**
 * Validation des variables d'environnement au boot
 * Fail fast avec messages clairs pour la préprod P.NA.VIM
 */

interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
] as const;

const OPTIONAL_ENV_VARS = [
  'VITE_SUPABASE_PROJECT_ID',
  'VITE_APP_VERSION',
] as const;

export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Vérifier les variables requises
  for (const key of REQUIRED_ENV_VARS) {
    const value = import.meta.env[key];
    if (!value || value === 'undefined' || value === '') {
      errors.push(`Variable d'environnement manquante: ${key}`);
    }
  }

  // Vérifier les variables optionnelles
  for (const key of OPTIONAL_ENV_VARS) {
    const value = import.meta.env[key];
    if (!value || value === 'undefined' || value === '') {
      warnings.push(`Variable optionnelle manquante: ${key}`);
    }
  }

  // Validation format URL Supabase
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes('supabase')) {
    warnings.push('VITE_SUPABASE_URL ne semble pas être une URL Supabase valide');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function bootstrapEnvironment(): void {
  try {
    const result = validateEnvironment();

    if (!result.valid) {
      console.error('❌ P.NA.VIM - Erreurs de configuration:');
      result.errors.forEach(err => console.error(`  • ${err}`));
      console.warn('⚠️ L\'application continue malgré les erreurs de configuration');
    }

    if (result.warnings.length > 0) {
      console.warn('⚠️ P.NA.VIM - Avertissements de configuration:');
      result.warnings.forEach(warn => console.warn(`  • ${warn}`));
    }

    if (result.valid) {
      console.log('✅ P.NA.VIM - Environnement validé');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la validation environnement:', error);
    // Ne jamais bloquer le rendu
  }
}

export function getEnvStatus(): Record<string, { set: boolean; value?: string }> {
  const status: Record<string, { set: boolean; value?: string }> = {};

  for (const key of [...REQUIRED_ENV_VARS, ...OPTIONAL_ENV_VARS]) {
    const value = import.meta.env[key];
    status[key] = {
      set: Boolean(value && value !== 'undefined' && value !== ''),
      // Masquer les clés sensibles
      value: key.includes('KEY') ? '***' : value,
    };
  }

  return status;
}
