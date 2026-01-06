/**
 * Logger centralisé - Re-export de compatibilité
 * @deprecated Utiliser import depuis '@/shared/services/logger'
 * 
 * Ce fichier maintient la compatibilité avec les imports existants
 * depuis '@/infra/logger' tout en pointant vers l'implémentation unifiée.
 */

// Re-export tout depuis le logger partagé
export * from '@/shared/services/logger';
export { logger as default } from '@/shared/services/logger';
