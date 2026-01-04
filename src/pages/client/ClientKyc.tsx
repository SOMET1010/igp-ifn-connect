import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Phone, Mail, MapPin, FileText, Camera,
  CheckCircle2, Lock, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { clientNavItems } from '@/config/clientNavigation';
import { useClientData, KYC_LEVEL_INFO } from '@/features/client';
import type { KycLevel } from '@/features/client';
import { toast } from 'sonner';

const KYC_STEPS = [
  {
    level: 'level_0' as KycLevel,
    icon: <Phone className="w-5 h-5" />,
    title: 'Vérification téléphone',
    description: 'Votre numéro de téléphone a été vérifié par OTP',
    completed: true,
  },
  {
    level: 'level_1' as KycLevel,
    icon: <Mail className="w-5 h-5" />,
    title: 'Informations personnelles',
    description: 'Email, adresse et date de naissance',
    fields: ['email', 'address', 'date_of_birth'],
  },
  {
    level: 'level_2' as KycLevel,
    icon: <FileText className="w-5 h-5" />,
    title: 'Document d\'identité',
    description: 'Carte d\'identité et photo selfie',
    fields: ['id_document', 'selfie'],
  },
];

const ClientKyc: React.FC = () => {
  const navigate = useNavigate();
  const { client, updateClient, isUpdating } = useClientData();

  const [email, setEmail] = useState(client?.email || '');
  const [address, setAddress] = useState(client?.address || '');
  const [city, setCity] = useState(client?.city || '');
  const [dateOfBirth, setDateOfBirth] = useState(client?.date_of_birth || '');

  const currentLevel = (client?.kyc_level || 'level_0') as KycLevel;
  const kycLevelOrder: KycLevel[] = ['level_0', 'level_1', 'level_2'];
  const currentLevelIndex = kycLevelOrder.indexOf(currentLevel);

  const handleUpgradeToLevel1 = () => {
    if (!email || !address || !dateOfBirth) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    updateClient({
      email,
      address,
      city,
      date_of_birth: dateOfBirth,
      kyc_level: 'level_1',
    });
  };

  const handleUpgradeToLevel2 = () => {
    toast.info('La vérification de document sera bientôt disponible');
  };

  const isStepCompleted = (stepLevel: KycLevel) => {
    const stepIndex = kycLevelOrder.indexOf(stepLevel);
    return stepIndex <= currentLevelIndex;
  };

  const isStepCurrent = (stepLevel: KycLevel) => {
    const stepIndex = kycLevelOrder.indexOf(stepLevel);
    return stepIndex === currentLevelIndex + 1;
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
          <h1 className="text-xl font-bold flex-1">Vérification KYC</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Current Level Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6 bg-gradient-to-br from-teal-600 to-teal-700 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="font-bold text-lg">{KYC_LEVEL_INFO[currentLevel].label}</h2>
                <p className="text-teal-100 text-sm">{KYC_LEVEL_INFO[currentLevel].description}</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* KYC Steps */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h3 className="text-sm font-medium text-muted-foreground">Étapes de vérification</h3>
          
          {KYC_STEPS.map((step, index) => {
            const completed = isStepCompleted(step.level);
            const current = isStepCurrent(step.level);
            
            return (
              <GlassCard 
                key={step.level}
                className={`p-4 ${current ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    completed 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : current 
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {completed ? <CheckCircle2 className="w-6 h-6" /> : step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{step.title}</h4>
                      {completed && (
                        <Badge className="bg-emerald-500 text-white">Complété</Badge>
                      )}
                      {!completed && !current && (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Lock className="w-3 h-3 mr-1" />
                          Verrouillé
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    
                    {/* Level 1 Form */}
                    {current && step.level === 'level_1' && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            placeholder="votre@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Adresse</Label>
                          <Input
                            placeholder="Quartier, rue, etc."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Ville</Label>
                          <Input
                            placeholder="Abidjan"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Date de naissance</Label>
                          <Input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                          />
                        </div>
                        <Button 
                          onClick={handleUpgradeToLevel1}
                          disabled={isUpdating}
                          className="w-full"
                        >
                          {isUpdating ? 'En cours...' : 'Valider Niveau 1'}
                        </Button>
                      </div>
                    )}

                    {/* Level 2 Form */}
                    {current && step.level === 'level_2' && (
                      <div className="mt-4 space-y-4">
                        <Button 
                          variant="outline"
                          className="w-full h-24 flex flex-col items-center justify-center gap-2"
                        >
                          <FileText className="w-6 h-6" />
                          <span>Charger un document d'identité</span>
                        </Button>
                        <Button 
                          variant="outline"
                          className="w-full h-24 flex flex-col items-center justify-center gap-2"
                        >
                          <Camera className="w-6 h-6" />
                          <span>Prendre un selfie</span>
                        </Button>
                        <Button 
                          onClick={handleUpgradeToLevel2}
                          className="w-full"
                        >
                          Soumettre pour vérification
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </motion.section>

        {/* Benefits */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Avantages par niveau</h3>
          <GlassCard className="p-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">Niveau 0</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Transferts basiques, mobile money
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-amber-50 border-amber-300">Niveau 1</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  + Épargne, assurance, limites augmentées
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-emerald-50 border-emerald-300">Niveau 2</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  + Crédit, limites maximales, tous les services
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.section>
      </main>

      <UnifiedBottomNav items={clientNavItems} />
    </div>
  );
};

export default ClientKyc;
