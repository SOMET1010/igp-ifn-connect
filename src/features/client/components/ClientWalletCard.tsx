import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Send, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';

interface ClientWalletCardProps {
  balance: number;
  currency?: string;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  onTransfer?: () => void;
}

export const ClientWalletCard: React.FC<ClientWalletCardProps> = ({
  balance,
  currency = 'FCFA',
  onDeposit,
  onWithdraw,
  onTransfer,
}) => {
  const [showBalance, setShowBalance] = useState(false);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  return (
    <GlassCard className="bg-gradient-to-br from-teal-600 to-teal-800 text-white p-6 rounded-3xl">
      {/* Balance Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-teal-100 text-sm font-medium">Solde disponible</span>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            {showBalance ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-baseline gap-2"
        >
          <span className="text-4xl font-bold tracking-tight">
            {showBalance ? formatAmount(balance) : '••••••'}
          </span>
          <span className="text-teal-100 text-lg">{currency}</span>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="ghost"
          onClick={onDeposit}
          className="flex flex-col items-center gap-2 h-auto py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center">
            <Plus className="w-5 h-5 text-emerald-300" />
          </div>
          <span className="text-xs font-medium">Dépôt</span>
        </Button>

        <Button
          variant="ghost"
          onClick={onWithdraw}
          className="flex flex-col items-center gap-2 h-auto py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl"
        >
          <div className="w-10 h-10 rounded-full bg-orange-400/20 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-orange-300" />
          </div>
          <span className="text-xs font-medium">Retrait</span>
        </Button>

        <Button
          variant="ghost"
          onClick={onTransfer}
          className="flex flex-col items-center gap-2 h-auto py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl"
        >
          <div className="w-10 h-10 rounded-full bg-violet-400/20 flex items-center justify-center">
            <Send className="w-5 h-5 text-violet-300" />
          </div>
          <span className="text-xs font-medium">Transfert</span>
        </Button>
      </div>
    </GlassCard>
  );
};
