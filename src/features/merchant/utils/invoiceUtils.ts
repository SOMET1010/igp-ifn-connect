/**
 * Utilitaires pour la génération de factures FNE conformes
 */

/**
 * Génère un hash de sécurité SHA-256 tronqué pour une facture
 * Ce hash est utilisé pour la vérification d'authenticité locale
 */
export async function generateSecurityHash(data: {
  invoiceNumber: string;
  merchantNcc: string;
  amountTtc: number;
  date: string;
}): Promise<string> {
  const hashInput = `${data.invoiceNumber}|${data.merchantNcc}|${data.amountTtc}|${data.date}|IFN-DGI`;
  
  // Encode the string to bytes
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(hashInput);
  
  // Generate SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Return first 16 characters (truncated for display)
  return hashHex.substring(0, 16).toUpperCase();
}

/**
 * Labels pour les régimes fiscaux
 */
export const FISCAL_REGIME_LABELS: Record<string, string> = {
  'TSU': 'Taxe Synthétique Unique',
  'RSI': 'Régime Simplifié d\'Imposition',
  'RNI': 'Régime Normal d\'Imposition',
  'ME': 'Micro-Entreprise',
};

/**
 * Génère l'URL de vérification fictive pour le QR code
 */
export function generateVerificationUrl(invoiceNumber: string, hash: string): string {
  return `https://fne.dgi.gouv.ci/verify/${invoiceNumber}?h=${hash}`;
}
