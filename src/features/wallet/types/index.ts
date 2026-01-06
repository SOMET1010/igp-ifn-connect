/**
 * Barrel export - Wallet Types
 */

export type {
  Wallet,
  WalletTransactionType,
  WalletTransactionStatus,
  WalletTransaction,
  Beneficiary,
  TransferInput,
  TransferResponse,
  WalletDashboardData,
  TransactionFilter,
} from './wallet.types';

export {
  TransferInputSchema,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_ICONS,
} from './wallet.types';
