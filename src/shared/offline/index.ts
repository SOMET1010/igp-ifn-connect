/**
 * Offline Module - Capability partagée pour le mode hors-ligne
 * 
 * Fournit :
 * - Stockage local (IndexedDB)
 * - Queues pour actions en attente
 * - Sync engine pour synchronisation automatique
 * - Résolution de conflits
 */

export * from './storage';
export * from './queues';
export * from './syncEngine';
export * from './conflictResolver';
