/**
 * Scripts vocaux SUTA pour le Dashboard Marchand
 * Voix institutionnelle, bienveillante, rassurante
 */

export type DashboardScriptKey = 
  | 'dashboard_welcome'
  | 'day_closed'
  | 'day_opened'
  | 'cashier_hint'
  | 'today_amount'
  | 'stock_hint'
  | 'history_hint'
  | 'profile_hint'
  | 'suppliers_hint'
  | 'assistant_prompt'
  | 'error_generic';

export interface DashboardScripts {
  [key: string]: string;
}

/**
 * Scripts SUTA pour le dashboard marchand
 * Ton formel mais chaleureux, phrases courtes, rythme lent
 */
export const DASHBOARD_SCRIPTS: DashboardScripts = {
  // Accueil
  dashboard_welcome: "Bonjour. Bienvenue sur ton espace marchand. Je suis là pour t'aider. Que veux-tu faire aujourd'hui ?",
  
  // États de la journée
  day_closed: "Ta journée n'est pas encore ouverte. Appuie sur Ouvrir ma journée pour commencer à encaisser.",
  day_opened: "C'est bon. Ta journée est ouverte. Tu peux maintenant encaisser tes clients.",
  
  // Action principale
  cashier_hint: "Pour encaisser un client, appuie ici.",
  
  // Montant du jour
  today_amount: "Voici ce que tu as encaissé aujourd'hui. {amount} francs CFA.",
  
  // Tuiles outils
  stock_hint: "Ici, tu peux voir et gérer tes produits.",
  history_hint: "Ici, tu peux revoir tes ventes passées.",
  profile_hint: "Ici, tu peux modifier tes informations.",
  suppliers_hint: "Ici, tu peux commander chez les coopératives.",
  
  // Assistant vocal
  assistant_prompt: "Dis-moi ce que tu veux faire. Encaisser. Voir mon argent. Voir mon stock.",
  
  // Erreur générique
  error_generic: "Ce n'est pas grave. On va recommencer ensemble.",
};

/**
 * Récupère un script SUTA pour le dashboard avec interpolation de variables
 */
export function getDashboardScript(
  key: DashboardScriptKey, 
  variables?: Record<string, string | number>
): string {
  let script = DASHBOARD_SCRIPTS[key] || '';
  
  if (variables) {
    Object.entries(variables).forEach(([varKey, value]) => {
      script = script.replace(`{${varKey}}`, String(value));
    });
  }
  
  return script;
}

/**
 * Formate un montant pour la lecture vocale
 */
export function formatAmountForSpeech(amount: number): string {
  if (amount === 0) {
    return "zéro";
  }
  return amount.toLocaleString('fr-FR');
}
