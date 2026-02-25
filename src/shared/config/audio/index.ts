/**
 * Scripts audio JÙLABA - Architecture à 3 voix
 * 
 * RÈGLE ABSOLUE : Une seule voix active par écran
 * - SUTA : Connexion, erreurs, navigation
 * - ASSISTANT : Vente, journée, encouragements  
 * - CASHIER : Encaissement uniquement
 */

// Voix principales JÙLABA
export * from './suta';
export * from './assistant';
export * from './cashierScripts';

// Scripts contextuels
export * from './stockScripts';
export * from './profileScripts';
