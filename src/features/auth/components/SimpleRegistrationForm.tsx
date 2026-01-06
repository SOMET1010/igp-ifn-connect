import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, ShoppingBag, MapPin, ArrowRight, Loader2, CheckCircle2, Mic, MicOff } from 'lucide-react';
import { cn } from '@/shared/lib';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useVoiceQueue } from '@/shared/hooks/useVoiceQueue';

interface SimpleRegistrationFormProps {
  phone: string;
  onSuccess: () => void;
  onCancel: () => void;
  voiceEnabled?: boolean;
}

interface Market {
  id: string;
  name: string;
  commune: string;
}

const ACTIVITY_TYPES = [
  { value: 'Fruits & Légumes', icon: '🥬', label: 'Fruits & Légumes' },
  { value: 'Viandes & Poissons', icon: '🐟', label: 'Viandes & Poissons' },
  { value: 'Céréales', icon: '🌾', label: 'Céréales' },
  { value: 'Épicerie', icon: '🛒', label: 'Épicerie' },
  { value: 'Restauration', icon: '🍲', label: 'Restauration' },
  { value: 'Autre', icon: '📦', label: 'Autre' },
];

/**
 * SimpleRegistrationForm - Formulaire minimal d'inscription
 * 
 * Collecte seulement : nom, activité, marché
 * Crée un marchand en status "pending" pour validation agent
 */
export function SimpleRegistrationForm({
  phone,
  onSuccess,
  onCancel,
  voiceEnabled = true,
}: SimpleRegistrationFormProps) {
  const { speak, stop } = useVoiceQueue();
  
  const [step, setStep] = useState<'name' | 'activity' | 'market' | 'submitting' | 'success'>('name');
  const [name, setName] = useState('');
  const [activity, setActivity] = useState('');
  const [marketId, setMarketId] = useState('');
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les marchés
  useEffect(() => {
    const fetchMarkets = async () => {
      const { data } = await supabase
        .from('markets')
        .select('id, name, commune')
        .order('name');
      if (data) setMarkets(data);
    };
    fetchMarkets();
  }, []);

  // Message d'accueil vocal
  useEffect(() => {
    if (voiceEnabled) {
      speak("Tu n'es pas encore inscrit. On va faire ça ensemble. C'est rapide. Dis-moi ton nom.", { priority: 'high' });
    }
  }, [voiceEnabled, speak]);

  // Vibration
  const vibrate = (duration: number = 30) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(duration);
    }
  };

  // Passer à l'étape suivante
  const handleNameSubmit = () => {
    if (name.trim().length < 2) {
      setError('Dis-moi ton nom');
      if (voiceEnabled) speak('Dis-moi ton nom', { priority: 'high' });
      return;
    }
    vibrate(50);
    setStep('activity');
    if (voiceEnabled) speak('Bien. Tu vends quoi ?', { priority: 'high' });
  };

  const handleActivitySelect = (value: string) => {
    vibrate(50);
    setActivity(value);
    setStep('market');
    if (voiceEnabled) speak('D\'accord. Tu es dans quel marché ?', { priority: 'high' });
  };

  const handleMarketSelect = async (id: string) => {
    vibrate(50);
    setMarketId(id);
    await submitRegistration(id);
  };

  // Soumettre l'inscription
  const submitRegistration = async (selectedMarketId: string) => {
    setStep('submitting');
    setIsLoading(true);
    setError(null);

    try {
      // Nettoyer le téléphone
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('225') ? cleanPhone : cleanPhone;

      // Créer le marchand en status pending
      const { data: merchant, error: insertError } = await supabase
        .from('merchants')
        .insert({
          full_name: name.trim(),
          phone: formattedPhone,
          activity_type: activity,
          market_id: selectedMarketId || null,
          cmu_number: `PEND-${Date.now()}`, // Temporaire
          status: 'pending' as const,
          enrolled_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error('Erreur lors de l\'inscription');
      }

      // Créer une notification pour les agents
      await supabase
        .from('notifications')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // Placeholder - sera remplacé par broadcast
          type: 'new_merchant_pending',
          category: 'agent',
          title: 'Nouveau marchand à valider',
          message: `${name.trim()} (${formattedPhone}) attend validation`,
          metadata: { merchant_id: merchant.id, phone: formattedPhone },
        });

      setStep('success');
      vibrate(100);
      
      if (voiceEnabled) {
        speak('C\'est fait ! Un agent va te contacter pour valider ton inscription. Attends un peu, on te rappelle.', { priority: 'high' });
      }
      
      toast.success('Inscription enregistrée !');

      // Attendre un peu puis revenir
      setTimeout(() => {
        onSuccess();
      }, 4000);

    } catch (err) {
      console.error('Registration error:', err);
      setError('Erreur. Réessaye.');
      if (voiceEnabled) speak('Il y a eu un problème. Réessaye.', { priority: 'high' });
      setStep('market');
    } finally {
      setIsLoading(false);
    }
  };

  // Render étape Nom
  const renderNameStep = () => (
    <motion.div
      key="name"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-white text-lg font-semibold">Comment tu t'appelles ?</h3>
        <p className="text-white/70 text-sm">Ton prénom et nom</p>
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError(null);
        }}
        placeholder="Mamadou Koné"
        className="w-full bg-white/10 border-2 border-white/30 rounded-2xl px-4 py-4 text-white text-xl text-center placeholder:text-white/50 focus:outline-none focus:border-white/60"
        autoFocus
      />

      {error && (
        <p className="text-red-200 text-sm text-center">{error}</p>
      )}

      <Button
        onClick={handleNameSubmit}
        disabled={name.trim().length < 2}
        className="w-full h-14 bg-white text-amber-600 hover:bg-white/90 rounded-2xl text-lg font-semibold"
      >
        Continuer <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  );

  // Render étape Activité
  const renderActivityStep = () => (
    <motion.div
      key="activity"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <ShoppingBag className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-white text-lg font-semibold">Tu vends quoi ?</h3>
        <p className="text-white/70 text-sm">Choisis ta catégorie</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ACTIVITY_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => handleActivitySelect(type.value)}
            className="bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-white/60 rounded-xl p-4 flex flex-col items-center gap-2 transition-all"
          >
            <span className="text-3xl">{type.icon}</span>
            <span className="text-white text-sm font-medium">{type.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );

  // Render étape Marché
  const renderMarketStep = () => (
    <motion.div
      key="market"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <MapPin className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-white text-lg font-semibold">Tu es dans quel marché ?</h3>
        <p className="text-white/70 text-sm">Choisis ton marché</p>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
        {markets.slice(0, 8).map((market) => (
          <button
            key={market.id}
            onClick={() => handleMarketSelect(market.id)}
            className="w-full bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-white/60 rounded-xl p-3 flex items-center justify-between transition-all"
          >
            <div className="text-left">
              <span className="text-white font-medium">{market.name}</span>
              <span className="text-white/60 text-sm ml-2">({market.commune})</span>
            </div>
            <ArrowRight className="w-5 h-5 text-white/60" />
          </button>
        ))}
        
        {/* Option "Autre" si pas de marché dans la liste */}
        <button
          onClick={() => handleMarketSelect('')}
          className="w-full bg-white/10 hover:bg-white/20 border-2 border-dashed border-white/30 hover:border-white/60 rounded-xl p-3 flex items-center justify-center gap-2 transition-all"
        >
          <span className="text-white/80">Autre marché</span>
        </button>
      </div>
    </motion.div>
  );

  // Render étape Soumission
  const renderSubmittingStep = () => (
    <motion.div
      key="submitting"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-8 text-center"
    >
      <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
      <p className="text-white text-lg">Un instant...</p>
    </motion.div>
  );

  // Render étape Succès
  const renderSuccessStep = () => (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
        className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <CheckCircle2 className="w-12 h-12 text-white" />
      </motion.div>
      
      <h3 className="text-white text-xl font-bold mb-2">C'est fait !</h3>
      <p className="text-white/80 text-sm mb-4">
        Un agent va te contacter pour valider ton inscription.
      </p>
      <p className="text-white/60 text-xs">
        📞 On te rappelle bientôt
      </p>
    </motion.div>
  );

  return (
    <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
          📝 Inscription rapide
        </span>
        {step !== 'success' && step !== 'submitting' && (
          <button
            onClick={onCancel}
            className="text-white/60 hover:text-white text-sm"
          >
            Annuler
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {['name', 'activity', 'market'].map((s, i) => {
          const stepOrder = { name: 0, activity: 1, market: 2, submitting: 3, success: 3 };
          const currentOrder = stepOrder[step as keyof typeof stepOrder] || 0;
          return (
            <React.Fragment key={s}>
              <div
                className={cn(
                  "w-3 h-3 rounded-full transition-all",
                  i <= currentOrder ? "bg-white" : "bg-white/30"
                )}
              />
              {i < 2 && (
                <div className={cn(
                  "w-8 h-0.5 rounded-full",
                  i < currentOrder ? "bg-white" : "bg-white/30"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Content */}
      {step === 'name' && renderNameStep()}
      {step === 'activity' && renderActivityStep()}
      {step === 'market' && renderMarketStep()}
      {step === 'submitting' && renderSubmittingStep()}
      {step === 'success' && renderSuccessStep()}
    </div>
  );
}
