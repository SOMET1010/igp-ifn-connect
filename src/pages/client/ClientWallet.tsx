import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, ArrowUpRight, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { clientNavItems } from '@/config/clientNavigation';
import { ClientWalletCard, useClientData, useCreateTransaction } from '@/features/client';
import { toast } from 'sonner';

const ClientWallet: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialAction = searchParams.get('action') || '';

  const { client } = useClientData();
  const createTransaction = useCreateTransaction(client?.id);

  const [activeDialog, setActiveDialog] = useState<'deposit' | 'withdraw' | 'transfer' | null>(
    initialAction as 'deposit' | 'withdraw' | 'transfer' | null
  );
  const [amount, setAmount] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setAmount('');
    setRecipientPhone('');
    setRecipientName('');
    setDescription('');
  };

  const handleDeposit = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Montant invalide');
      return;
    }

    createTransaction.mutate({
      type: 'deposit',
      amount: amountNum,
      description: description || 'Dépôt',
    }, {
      onSuccess: () => {
        setActiveDialog(null);
        resetForm();
      }
    });
  };

  const handleWithdraw = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Montant invalide');
      return;
    }

    createTransaction.mutate({
      type: 'withdrawal',
      amount: amountNum,
      description: description || 'Retrait',
    }, {
      onSuccess: () => {
        setActiveDialog(null);
        resetForm();
      }
    });
  };

  const handleTransfer = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Montant invalide');
      return;
    }
    if (!recipientPhone) {
      toast.error('Numéro du bénéficiaire requis');
      return;
    }

    createTransaction.mutate({
      type: 'transfer_out',
      amount: amountNum,
      counterparty_phone: recipientPhone,
      counterparty_name: recipientName,
      description: description || 'Transfert',
    }, {
      onSuccess: () => {
        setActiveDialog(null);
        resetForm();
      }
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const quickAmounts = [5000, 10000, 25000, 50000, 100000];

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
          <h1 className="text-xl font-bold flex-1">Mon Portefeuille</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ClientWalletCard
            balance={client?.balance || 0}
            onDeposit={() => setActiveDialog('deposit')}
            onWithdraw={() => setActiveDialog('withdraw')}
            onTransfer={() => setActiveDialog('transfer')}
          />
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Actions rapides</h3>
          <div className="grid grid-cols-3 gap-3">
            <Card 
              className="p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setActiveDialog('deposit')}
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-emerald-100 flex items-center justify-center">
                <Plus className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="font-medium text-sm">Dépôt</p>
            </Card>
            <Card 
              className="p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setActiveDialog('withdraw')}
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-orange-600" />
              </div>
              <p className="font-medium text-sm">Retrait</p>
            </Card>
            <Card 
              className="p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setActiveDialog('transfer')}
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-violet-100 flex items-center justify-center">
                <Send className="w-6 h-6 text-violet-600" />
              </div>
              <p className="font-medium text-sm">Transfert</p>
            </Card>
          </div>
        </motion.section>

        {/* Transaction History Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/client/transactions')}
          >
            Voir l'historique complet
          </Button>
        </motion.div>
      </main>

      {/* Deposit Dialog */}
      <Dialog open={activeDialog === 'deposit'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dépôt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Montant (FCFA)</Label>
              <Input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl font-bold h-14"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(String(amt))}
                >
                  {formatAmount(amt)}
                </Button>
              ))}
            </div>
            <div>
              <Label>Description (optionnel)</Label>
              <Input
                placeholder="Ex: Dépôt mensuel"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleDeposit} 
              className="w-full"
              disabled={createTransaction.isPending}
            >
              {createTransaction.isPending ? 'En cours...' : 'Confirmer le dépôt'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={activeDialog === 'withdraw'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retrait</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Solde disponible: {formatAmount(client?.balance || 0)} FCFA
            </p>
            <div>
              <Label>Montant (FCFA)</Label>
              <Input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl font-bold h-14"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(String(amt))}
                  disabled={amt > (client?.balance || 0)}
                >
                  {formatAmount(amt)}
                </Button>
              ))}
            </div>
            <Button 
              onClick={handleWithdraw} 
              className="w-full"
              disabled={createTransaction.isPending}
            >
              {createTransaction.isPending ? 'En cours...' : 'Confirmer le retrait'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={activeDialog === 'transfer'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfert</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Solde disponible: {formatAmount(client?.balance || 0)} FCFA
            </p>
            <div>
              <Label>Numéro du bénéficiaire</Label>
              <Input
                type="tel"
                placeholder="07 00 00 00 00"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
              />
            </div>
            <div>
              <Label>Nom du bénéficiaire (optionnel)</Label>
              <Input
                placeholder="Ex: Kouamé Jean"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
            <div>
              <Label>Montant (FCFA)</Label>
              <Input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl font-bold h-14"
              />
            </div>
            <Button 
              onClick={handleTransfer} 
              className="w-full"
              disabled={createTransaction.isPending}
            >
              {createTransaction.isPending ? 'En cours...' : 'Envoyer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <UnifiedBottomNav items={clientNavItems} />
    </div>
  );
};

export default ClientWallet;
