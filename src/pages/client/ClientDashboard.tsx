import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Grid, FileText, Bell, Settings, ChevronRight,
  User, ShieldCheck, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ImmersiveBackground } from '@/components/shared/ImmersiveBackground';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { clientNavItems } from '@/config/clientNavigation';
import { 
  ClientWalletCard, 
  TransactionItem,
  useClientData,
  useClientTransactions,
  useClientServices,
  KYC_LEVEL_INFO,
} from '@/features/client';
import type { KycLevel } from '@/features/client';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { client, isLoading } = useClientData();
  const { data: transactions = [] } = useClientTransactions(client?.id, 5);
  const { data: services = [] } = useClientServices(client?.id);

  const activeServices = services.filter(s => s.status === 'active');
  const kycLevel = (client?.kyc_level || 'level_0') as KycLevel;
  const kycInfo = KYC_LEVEL_INFO[kycLevel];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-6 text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <h2 className="text-xl font-bold mb-2">Compte non trouvé</h2>
          <p className="text-muted-foreground mb-4">
            Veuillez compléter votre inscription pour accéder à votre espace client.
          </p>
          <Button onClick={() => navigate('/auth?role=client')}>
            S'inscrire
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-background">
      <ImmersiveBackground variant="solar" showMarketPhoto={false} />

      {/* Header */}
      <header className="relative z-10 px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Bonjour,</p>
            <h1 className="text-2xl font-bold text-foreground">{client.full_name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/client/notifications')}
              className="relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/client/profile')}
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* KYC Status Banner */}
        {kycLevel !== 'level_2' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
          <Card 
            className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50"
            onClick={() => navigate('/client/kyc')}
          >
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{kycInfo.label}</p>
              <p className="text-xs text-muted-foreground">Complétez votre KYC pour plus d'accès</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Card>
          </motion.div>
        )}
      </header>

      <main className="relative z-10 px-4 space-y-6">
        {/* Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ClientWalletCard
            balance={client.balance || 0}
            onDeposit={() => navigate('/client/wallet?action=deposit')}
            onWithdraw={() => navigate('/client/wallet?action=withdraw')}
            onTransfer={() => navigate('/client/wallet?action=transfer')}
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: <Grid className="w-5 h-5" />, label: 'Services', path: '/client/services' },
              { icon: <FileText className="w-5 h-5" />, label: 'Historique', path: '/client/transactions' },
              { icon: <ShieldCheck className="w-5 h-5" />, label: 'KYC', path: '/client/kyc' },
              { icon: <Settings className="w-5 h-5" />, label: 'Paramètres', path: '/client/profile' },
            ].map((item, index) => (
              <Button
                key={item.label}
                variant="outline"
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                {item.icon}
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Active Services */}
        {activeServices.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground">Mes services actifs</h2>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => navigate('/client/services')}
                className="text-primary"
              >
                Voir tout
              </Button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {activeServices.map((service) => (
                <Card 
                  key={service.id} 
                  className="flex-shrink-0 w-40 p-4 text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                    <Grid className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium text-sm truncate">{service.service?.name}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Actif
                  </Badge>
                </Card>
              ))}
            </div>
          </motion.section>
        )}

        {/* Recent Transactions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Dernières transactions</h2>
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => navigate('/client/transactions')}
              className="text-primary"
            >
              Voir tout
            </Button>
          </div>
          <Card className="divide-y divide-border">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Aucune transaction</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onClick={() => navigate(`/client/transactions/${tx.id}`)}
                />
              ))
            )}
          </Card>
        </motion.section>
      </main>

      {/* Bottom Navigation */}
      <UnifiedBottomNav items={clientNavItems} />
    </div>
  );
};

export default ClientDashboard;
