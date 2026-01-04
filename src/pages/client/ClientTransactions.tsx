import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { clientNavItems } from '@/config/clientNavigation';
import { TransactionItem, useClientTransactions, useClientData } from '@/features/client';
import type { TransactionType } from '@/features/client';

const TRANSACTION_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tout' },
  { value: 'deposit', label: 'Dépôts' },
  { value: 'withdrawal', label: 'Retraits' },
  { value: 'transfer', label: 'Transferts' },
  { value: 'payment', label: 'Paiements' },
];

const ClientTransactions: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const { client } = useClientData();
  const { data: transactions = [], isLoading } = useClientTransactions(client?.id);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.counterparty_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || 
      tx.type === activeFilter ||
      (activeFilter === 'transfer' && ['transfer_in', 'transfer_out'].includes(tx.type));
    
    return matchesSearch && matchesFilter;
  });

  // Group by date
  const groupedTransactions = filteredTransactions.reduce((groups, tx) => {
    const date = format(new Date(tx.created_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(tx);
    return groups;
  }, {} as Record<string, typeof filteredTransactions>);

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return "Aujourd'hui";
    }
    if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Hier';
    }
    return format(date, 'EEEE d MMMM', { locale: fr });
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold flex-1">Historique</h1>
          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une transaction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 pb-3 overflow-x-auto">
          <div className="flex gap-2">
            {TRANSACTION_FILTERS.map((filter) => (
              <Button
                key={filter.value}
                variant={activeFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(filter.value)}
                className="flex-shrink-0"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : Object.keys(groupedTransactions).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune transaction</p>
          </div>
        ) : (
          Object.entries(groupedTransactions).map(([date, txs], groupIndex) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              <h3 className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                {formatDateHeader(date)}
              </h3>
              <Card className="divide-y divide-border">
                {txs.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    onClick={() => navigate(`/client/transactions/${tx.id}`)}
                  />
                ))}
              </Card>
            </motion.div>
          ))
        )}
      </main>

      <UnifiedBottomNav items={clientNavItems} />
    </div>
  );
};

export default ClientTransactions;
