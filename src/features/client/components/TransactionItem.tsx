import React from 'react';
import { 
  ArrowUpRight, ArrowDownLeft, Send, CreditCard, 
  Minus, CheckCircle2, Clock, XCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ClientTransaction, TransactionType, TransactionStatus } from '../types/client.types';

interface TransactionItemProps {
  transaction: ClientTransaction;
  onClick?: () => void;
}

const TRANSACTION_ICONS: Record<TransactionType, React.ReactNode> = {
  deposit: <ArrowDownLeft className="w-5 h-5" />,
  withdrawal: <ArrowUpRight className="w-5 h-5" />,
  transfer_in: <ArrowDownLeft className="w-5 h-5" />,
  transfer_out: <Send className="w-5 h-5" />,
  payment: <CreditCard className="w-5 h-5" />,
  fee: <Minus className="w-5 h-5" />,
};

const TRANSACTION_LABELS: Record<TransactionType, string> = {
  deposit: 'Dépôt',
  withdrawal: 'Retrait',
  transfer_in: 'Reçu',
  transfer_out: 'Envoyé',
  payment: 'Paiement',
  fee: 'Frais',
};

const TRANSACTION_COLORS: Record<TransactionType, { bg: string; text: string }> = {
  deposit: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  withdrawal: { bg: 'bg-orange-100', text: 'text-orange-600' },
  transfer_in: { bg: 'bg-teal-100', text: 'text-teal-600' },
  transfer_out: { bg: 'bg-violet-100', text: 'text-violet-600' },
  payment: { bg: 'bg-blue-100', text: 'text-blue-600' },
  fee: { bg: 'bg-red-100', text: 'text-red-600' },
};

const STATUS_ICONS: Record<TransactionStatus, React.ReactNode> = {
  completed: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  pending: <Clock className="w-4 h-4 text-amber-500" />,
  failed: <XCircle className="w-4 h-4 text-red-500" />,
  cancelled: <XCircle className="w-4 h-4 text-muted-foreground" />,
};

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onClick,
}) => {
  const type = transaction.type as TransactionType;
  const status = transaction.status as TransactionStatus;
  const colors = TRANSACTION_COLORS[type] || TRANSACTION_COLORS.deposit;
  const isIncoming = ['deposit', 'transfer_in'].includes(type);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const getDescription = () => {
    if (transaction.counterparty_name) {
      return transaction.counterparty_name;
    }
    if (transaction.counterparty_phone) {
      return transaction.counterparty_phone;
    }
    return transaction.description || TRANSACTION_LABELS[type];
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center ${colors.text}`}>
        {TRANSACTION_ICONS[type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">
            {getDescription()}
          </span>
          {STATUS_ICONS[status]}
        </div>
        <p className="text-sm text-muted-foreground">
          {format(new Date(transaction.created_at), "d MMM 'à' HH:mm", { locale: fr })}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right">
        <span className={`font-semibold ${isIncoming ? 'text-emerald-600' : 'text-foreground'}`}>
          {isIncoming ? '+' : '-'}{formatAmount(transaction.amount)}
        </span>
        <p className="text-xs text-muted-foreground">FCFA</p>
      </div>
    </button>
  );
};
