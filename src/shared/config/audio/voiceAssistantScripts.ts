/**
 * Scripts vocaux pour l'assistant
 * Voix "Tantie Awa" - Française Ivoirienne
 */

// Scripts par contexte temporel
export const VOICE_SCRIPTS = {
  // 05h30-06h30 ARRIVÉE AU MARCHÉ
  arrival: {
    welcome: "Bonjour ma sœur. Bienvenue sur Pé-Na-Vim.",
    ready: "Est-ce que tu es bien installée au marché ?",
    start: "Quand tu es prête, appuie sur le gros bouton pour commencer.",
    motivation: "C'est parti pour une bonne journée de vente !"
  },
  
  // 07h00-09h00 OUVERTURE - SAISIE STOCK
  opening: {
    prompt: "Dis-moi ce que tu vends aujourd'hui.",
    products: "Tu peux dire : tomate, igname, banane...",
    heard: "J'ai entendu : {product}.",
    quantity: "Quelle quantité tu as aujourd'hui ?",
    price: "À combien tu vends une bassine ?",
    confirm: "Tu confirmes ?",
    saved: "D'accord. C'est enregistré.",
    next: "Autre chose ?"
  },
  
  // 09h00-12h00 VENTE ACTIVE
  sales: {
    ready: "Je t'écoute. Dis-moi ce que le client a acheté.",
    prompt: "Combien il a payé ?",
    heard: "J'ai entendu {amount} francs.",
    product: "C'était quoi comme produit ?",
    confirm: "Je note : {product} à {amount} francs. C'est bon ?",
    saved: "Parfait. C'est enregistré.",
    encourage: "C'est bien ! Continue comme ça.",
    congrats: "Belle vente ma sœur !"
  },
  
  // 12h00-14h00 PAUSE MIDI
  break: {
    pause: "C'est l'heure de la pause. Mange bien !",
    reminder: "N'oublie pas de surveiller ton étal.",
    resume: "Prête à reprendre les ventes ?"
  },
  
  // 14h00-17h00 APRÈS-MIDI
  afternoon: {
    check: "Tu veux voir combien tu as fait ce matin ?",
    summary: "Ce matin tu as fait {amount} francs avec {count} ventes.",
    stock: "Tu veux vérifier ton stock ?"
  },
  
  // 17h00-18h30 FERMETURE
  closing: {
    endDay: "La journée se termine bientôt.",
    summary: "Aujourd'hui tu as vendu pour {amount} francs.",
    congrats: "Bravo pour cette journée !",
    tomorrow: "À demain ma sœur. Rentre bien !"
  },
  
  // CONTRÔLE GLOBAL
  control: {
    repeat: "Je répète : {lastPhrase}",
    cancel: "D'accord, j'annule.",
    undo: "C'est défait.",
    help: "Dis ce que le client a acheté, ou le montant. Par exemple : tomate mille francs.",
    notUnderstood: "Je n'ai pas compris. Tu peux répéter ?",
    confirm: "Oui ou non ?",
    ok: "D'accord.",
    error: "Il y a eu une erreur. Réessaie."
  },
  
  // OFFLINE
  offline: {
    detected: "Tu n'as pas de connexion. Mais je note quand même.",
    saved: "C'est noté. On enverra après.",
    synced: "C'est parti ! Tout est synchronisé.",
    pending: "Tu as {count} ventes en attente de synchronisation."
  },
  
  // STOCK
  stock: {
    low: "Attention ! Ton stock de {product} est bas.",
    empty: "Tu n'as plus de {product}.",
    added: "J'ai ajouté {quantity} {unit} de {product}.",
    check: "Tu as {quantity} {unit} de {product} en stock."
  }
};

// Scripts en langues locales
export const DIOULA_SCRIPTS = {
  welcome: "I ni sogoma, n'soro.",
  thanks: "A ni cé.",
  goodbye: "K'an bé.",
  yes: "Awo.",
  no: "Ayi.",
  help: "Pé-Na-Vim bé i démen."
};

export const BAOULE_SCRIPTS = {
  welcome: "Mo akpe.",
  thanks: "Akpe.",
  goodbye: "Yako.",
  yes: "Iin.",
  no: "Cèeci."
};

/**
 * Obtient le script approprié selon l'heure
 */
export function getTimeBasedScript(): keyof typeof VOICE_SCRIPTS {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 7) return 'arrival';
  if (hour >= 7 && hour < 9) return 'opening';
  if (hour >= 9 && hour < 12) return 'sales';
  if (hour >= 12 && hour < 14) return 'break';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 19) return 'closing';
  
  return 'sales'; // Défaut
}

/**
 * Remplace les variables dans un script
 */
export function formatScript(script: string, variables: Record<string, string | number>): string {
  let result = script;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }
  return result;
}

/**
 * Obtient un message de félicitation aléatoire
 */
export function getRandomCongrats(): string {
  const messages = [
    "Belle vente !",
    "Bravo ma sœur !",
    "C'est bien !",
    "Continue comme ça !",
    "Parfait !"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}
