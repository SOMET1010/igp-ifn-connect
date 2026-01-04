/**
 * Client Feature - Module d'export centralisé
 */

// Types
export * from './types/client.types';

// Hooks
export { useClientData, useCreateClient } from './hooks/useClientData';
export { useFinancialServices, useClientServices, useActivateService } from './hooks/useClientServices';
export { useClientTransactions, useCreateTransaction } from './hooks/useClientTransactions';

// Components
export { ClientWalletCard } from './components/ClientWalletCard';
export { ServiceCard } from './components/ServiceCard';
export { TransactionItem } from './components/TransactionItem';
