/**
 * Scripts audio SUTA pour l'écran Profil Marchand
 * Ces scripts sont conçus pour être simples, rassurants et inclusifs
 */

export const PROFILE_SCRIPTS = {
  // Accueil
  profile_welcome: "Voici ton profil. Tu peux voir et modifier tes informations ici.",
  
  // Statuts
  profile_validated: "Ton compte est validé. Tu peux continuer à travailler.",
  profile_pending: "Ton compte est en attente de validation.",
  profile_rejected: "Ton compte doit être vérifié. Contacte un agent.",
  
  // Informations
  profile_phone: "Voici ton numéro de téléphone.",
  profile_date: "Voici ta date d'inscription.",
  profile_cmu: "Voici ton numéro CMU.",
  profile_ncc: "Voici ton numéro NCC.",
  
  // Actions
  profile_modify: "Appuie ici pour modifier tes informations.",
  profile_modify_success: "Tes informations ont été enregistrées.",
  
  // Langue
  profile_language: "Choisis la langue que tu comprends le mieux.",
  profile_language_changed: "La langue a été changée.",
  
  // Son et notifications
  profile_sound_on: "Le son est activé.",
  profile_sound_off: "Le son est désactivé.",
  profile_notif_on: "Les notifications sont activées.",
  profile_notif_off: "Les notifications sont désactivées.",
  
  // Déconnexion
  profile_logout: "Veux-tu vraiment te déconnecter ?",
  profile_logout_confirm: "Tu es déconnecté. À bientôt.",
  
  // Erreurs
  profile_error: "Ce n'est pas grave. On va recommencer ensemble.",
} as const;

export type ProfileScriptKey = keyof typeof PROFILE_SCRIPTS;

/**
 * Récupère un script audio pour le profil
 */
export function getProfileScript(key: ProfileScriptKey): string {
  return PROFILE_SCRIPTS[key];
}

/**
 * Génère un script avec le montant dynamique
 */
export function getProfileScriptWithName(key: ProfileScriptKey, name: string): string {
  const script = PROFILE_SCRIPTS[key];
  return script.replace('{name}', name);
}
