import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, Phone, Mail, MapPin, Calendar,
  ShieldCheck, Bell, Moon, HelpCircle, LogOut, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { clientNavItems } from '@/config/clientNavigation';
import { useClientData, KYC_LEVEL_INFO } from '@/features/client';
import { useAuth } from '@/contexts/AuthContext';
import type { KycLevel } from '@/features/client';

const ClientProfile: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { client, isLoading } = useClientData();

  const kycLevel = (client?.kyc_level || 'level_0') as KycLevel;
  const kycInfo = KYC_LEVEL_INFO[kycLevel];

  const handleLogout = async () => {
    await signOut();
    navigate('/client/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

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
          <h1 className="text-xl font-bold flex-1">Mon Profil</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6 text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold">
              {client?.full_name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <h2 className="text-xl font-bold">{client?.full_name}</h2>
            <p className="text-muted-foreground">{client?.phone}</p>
            
            {/* KYC Badge */}
            <div className="mt-4 flex justify-center">
              <Badge 
                variant="outline" 
                className={`
                  ${kycLevel === 'level_2' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : ''}
                  ${kycLevel === 'level_1' ? 'bg-amber-100 text-amber-700 border-amber-300' : ''}
                  ${kycLevel === 'level_0' ? 'bg-gray-100 text-gray-700 border-gray-300' : ''}
                `}
              >
                <ShieldCheck className="w-3 h-3 mr-1" />
                {kycInfo.label}
              </Badge>
            </div>
          </GlassCard>
        </motion.div>

        {/* Personal Info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Informations personnelles</h3>
          <GlassCard className="divide-y divide-border">
            <div className="flex items-center gap-3 p-4">
              <User className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium">{client?.full_name || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{client?.phone || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{client?.email || 'Non renseigné'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-medium">{client?.address || 'Non renseignée'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Membre depuis</p>
                <p className="font-medium">
                  {client?.created_at 
                    ? format(new Date(client.created_at), 'd MMMM yyyy', { locale: fr })
                    : '-'
                  }
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.section>

        {/* Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Paramètres</h3>
          <GlassCard className="divide-y divide-border">
            <button
              onClick={() => navigate('/client/kyc')}
              className="flex items-center gap-3 p-4 w-full text-left hover:bg-muted/50 transition-colors"
            >
              <ShieldCheck className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Vérification KYC</p>
                <p className="text-sm text-muted-foreground">{kycInfo.label}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-3 p-4">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">Recevoir les alertes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center gap-3 p-4">
              <Moon className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Mode sombre</p>
                <p className="text-sm text-muted-foreground">Changer l'apparence</p>
              </div>
              <Switch />
            </div>
            <button
              onClick={() => navigate('/aide')}
              className="flex items-center gap-3 p-4 w-full text-left hover:bg-muted/50 transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Aide & Support</p>
                <p className="text-sm text-muted-foreground">FAQ et contact</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </GlassCard>
        </motion.section>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </Button>
        </motion.div>
      </main>

      <UnifiedBottomNav items={clientNavItems} />
    </div>
  );
};

export default ClientProfile;
