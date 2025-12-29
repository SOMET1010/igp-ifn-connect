/**
 * Scripts vocaux SUTA pour la gestion du stock marchand
 * Guidage audio inclusif pour utilisateurs non-lecteurs
 */

export interface StockAudioScript {
  key: string;
  fr: string;
  dioula?: string;
  nouchi?: string;
}

export const stockScripts: Record<string, StockAudioScript> = {
  // Accueil et navigation
  stock_welcome: {
    key: 'stock_welcome',
    fr: 'Voici ton stock. Appuie sur un produit pour modifier.',
    dioula: 'I ka stock ye nin ye. Produit dɔ kɔ don ka a changé.',
  },
  stock_empty: {
    key: 'stock_empty',
    fr: 'Ton stock est vide. Appuie sur le plus pour ajouter.',
    dioula: 'I ka stock ye bagan ye. Plus kɔ don ka fara kan.',
  },
  stock_count: {
    key: 'stock_count',
    fr: '{count} produits dans ton stock.',
    dioula: 'Produit {count} bɛ i ka stock kɔnɔ.',
  },

  // Alertes
  stock_alert_out: {
    key: 'stock_alert_out',
    fr: 'Attention ! {count} produit en rupture de stock.',
    dioula: 'Kɛlɛ! Produit {count} banna!',
  },
  stock_alert_low: {
    key: 'stock_alert_low',
    fr: '{count} produit avec stock bas. Pense à réapprovisionner.',
    dioula: 'Produit {count} ka stock ye dɔgɔ ye. A miiri ka stock dɔ fara kan.',
  },
  stock_all_ok: {
    key: 'stock_all_ok',
    fr: 'Tout va bien ! Tous tes produits sont en stock.',
    dioula: 'A ka di! I ka produit bɛɛ bɛ stock kɔnɔ.',
  },

  // Actions
  stock_add: {
    key: 'stock_add',
    fr: 'Ajouter un nouveau produit au stock.',
    dioula: 'Produit kura dɔ fara stock kan.',
  },
  stock_restock: {
    key: 'stock_restock',
    fr: 'Combien tu ajoutes ?',
    dioula: 'I bɛ joli fara kan?',
  },
  stock_edit: {
    key: 'stock_edit',
    fr: 'Modifier la quantité.',
    dioula: 'Quantité changé.',
  },
  stock_delete: {
    key: 'stock_delete',
    fr: 'Veux-tu vraiment supprimer ce produit ?',
    dioula: 'I bɛ fɛ ka nin produit bɔ tiɛn?',
  },
  stock_saved: {
    key: 'stock_saved',
    fr: "C'est enregistré !",
    dioula: 'A sɛbɛnna!',
  },
  stock_deleted: {
    key: 'stock_deleted',
    fr: 'Produit supprimé.',
    dioula: 'Produit bɔra.',
  },

  // Filtres
  stock_filter_all: {
    key: 'stock_filter_all',
    fr: 'Tous les produits.',
    dioula: 'Produit bɛɛ.',
  },
  stock_filter_out: {
    key: 'stock_filter_out',
    fr: 'Produits en rupture.',
    dioula: 'Produit minnu banna.',
  },
  stock_filter_low: {
    key: 'stock_filter_low',
    fr: 'Produits avec stock bas.',
    dioula: 'Produit minnu ka stock ye dɔgɔ ye.',
  },
  stock_filter_ok: {
    key: 'stock_filter_ok',
    fr: 'Produits en stock.',
    dioula: 'Produit minnu bɛ stock kɔnɔ.',
  },

  // Quantités rapides
  stock_add_five: {
    key: 'stock_add_five',
    fr: 'Plus cinq.',
    dioula: 'Fara duuru kan.',
  },
  stock_add_ten: {
    key: 'stock_add_ten',
    fr: 'Plus dix.',
    dioula: 'Fara tan kan.',
  },
  stock_add_twenty: {
    key: 'stock_add_twenty',
    fr: 'Plus vingt.',
    dioula: 'Fara mugan kan.',
  },

  // Produit individuel
  stock_product_info: {
    key: 'stock_product_info',
    fr: '{name}. {quantity} {unit} en stock.',
    dioula: '{name}. {quantity} {unit} bɛ stock kɔnɔ.',
  },
};

/**
 * Retourne le script audio avec les variables remplacées
 */
export function getStockScript(
  key: string,
  variables?: Record<string, string | number>,
  language: 'fr' | 'dioula' | 'nouchi' = 'fr'
): string {
  const script = stockScripts[key];
  if (!script) {
    console.warn(`Stock script "${key}" not found`);
    return '';
  }

  let text = script[language] || script.fr;

  if (variables) {
    Object.entries(variables).forEach(([varKey, value]) => {
      text = text.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(value));
    });
  }

  return text;
}
