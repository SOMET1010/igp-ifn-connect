import React, { useState, useCallback } from 'react';
import { Loader2, ArrowRight, Phone, RotateCcw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/lib';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SimplePhoneAuthProps {
  redirectPath: string;
  userType: 'merchant' | 'cooperative' | 'agent';
  className?: string;
}

type Step = 'phone' | 'otp' | 'success';

/**
 * SimplePhoneAuth - Authentification simplifiée par téléphone
 * Flow linéaire : Téléphone → OTP → Connecté
 * 
 * AUCUNE couche complexe, AUCUN persona, AUCUN trust score
 * Juste : entre ton numéro, reçois un code, connecte-toi
 */
export function SimplePhoneAuth({ 
  redirectPath, 
  userType,
  className 
}: SimplePhoneAuthProps) {
  const navigate = useNavigate();
  
  // État simple et linéaire
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Format visuel du téléphone : "07 01 02 03 04"
  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  };

  // Gérer la saisie téléphone
  const handlePhoneChange = (digit: string) => {
    if (phone.length >= 10) return;
    setPhone(prev => prev + digit);
    setError(null);
  };

  const handlePhoneBackspace = () => {
    setPhone(prev => prev.slice(0, -1));
    setError(null);
  };

  const handlePhoneClear = () => {
    setPhone('');
    setError(null);
  };

  // Étape 1 : Envoyer le numéro et recevoir OTP
  const handleSubmitPhone = useCallback(async () => {
    if (phone.length !== 10) {
      setError('Le numéro doit avoir 10 chiffres');
      return;
    }

    // Valider le préfixe ivoirien
    const validPrefixes = ['01', '05', '07', '21', '25', '27'];
    const prefix = phone.substring(0, 2);
    if (!validPrefixes.includes(prefix)) {
      setError('Numéro ivoirien invalide');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formattedPhone = `+225${phone}`;
      
      // Générer OTP pour le dev (en prod, utiliser SMS)
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setDevOtp(generatedOtp);
      
      console.log(`[DEV] OTP pour ${formattedPhone}: ${generatedOtp}`);
      toast.info(`Code: ${generatedOtp}`, { duration: 15000 });

      // Passer à l'étape OTP
      setStep('otp');
      
    } catch (err) {
      console.error('Erreur envoi OTP:', err);
      setError('Impossible d\'envoyer le code. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  }, [phone]);

  // Étape 2 : Vérifier l'OTP
  const handleSubmitOtp = useCallback(async () => {
    if (otp.length !== 6) {
      setError('Le code doit avoir 6 chiffres');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // En dev, vérifier avec le code généré
      if (devOtp && otp === devOtp) {
        setStep('success');
        toast.success('Connexion réussie !');
        
        // Rediriger après 1.5s
        setTimeout(() => {
          navigate(redirectPath);
        }, 1500);
        return;
      }

      // Sinon, erreur
      setError('Code incorrect');
      
    } catch (err) {
      console.error('Erreur vérification OTP:', err);
      setError('Erreur de vérification');
    } finally {
      setIsLoading(false);
    }
  }, [otp, devOtp, navigate, redirectPath]);

  // Gérer la saisie OTP
  const handleOtpChange = (digit: string) => {
    if (otp.length >= 6) return;
    const newOtp = otp + digit;
    setOtp(newOtp);
    setError(null);
    
    // Auto-submit quand 6 chiffres
    if (newOtp.length === 6) {
      setTimeout(() => {
        // On vérifie directement
        if (devOtp && newOtp === devOtp) {
          setStep('success');
          toast.success('Connexion réussie !');
          setTimeout(() => navigate(redirectPath), 1500);
        } else {
          setError('Code incorrect');
        }
      }, 300);
    }
  };

  const handleOtpBackspace = () => {
    setOtp(prev => prev.slice(0, -1));
    setError(null);
  };

  // Reset complet
  const handleReset = () => {
    setStep('phone');
    setPhone('');
    setOtp('');
    setError(null);
    setDevOtp(null);
  };

  // Couleurs par type d'utilisateur
  const colors = {
    merchant: 'bg-gradient-to-br from-orange-500 to-amber-500',
    agent: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    cooperative: 'bg-gradient-to-br from-violet-500 to-purple-500',
  }[userType];

  const labels = {
    merchant: 'Commerçant',
    agent: 'Agent',
    cooperative: 'Coopérative',
  }[userType];

  // Clavier numérique réutilisable
  const NumPad = ({ onDigit, onBackspace, onClear }: { 
    onDigit: (d: string) => void;
    onBackspace: () => void;
    onClear?: () => void;
  }) => (
    <div className="grid grid-cols-3 gap-2 w-full max-w-xs mx-auto">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
        <button
          key={digit}
          type="button"
          onClick={() => onDigit(digit)}
          className="h-14 rounded-xl bg-white/10 hover:bg-white/20 text-white text-2xl font-bold transition-all active:scale-95"
        >
          {digit}
        </button>
      ))}
      <button
        type="button"
        onClick={onClear || onBackspace}
        className="h-14 rounded-xl bg-white/10 hover:bg-white/20 text-white text-lg font-medium transition-all"
      >
        {onClear ? 'C' : '⌫'}
      </button>
      <button
        type="button"
        onClick={() => onDigit('0')}
        className="h-14 rounded-xl bg-white/10 hover:bg-white/20 text-white text-2xl font-bold transition-all active:scale-95"
      >
        0
      </button>
      <button
        type="button"
        onClick={onBackspace}
        className="h-14 rounded-xl bg-white/10 hover:bg-white/20 text-white text-lg transition-all"
      >
        ⌫
      </button>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("w-full max-w-sm mx-auto", className)}
    >
      {/* Card principale */}
      <div className={cn("rounded-3xl p-6 shadow-xl", colors)}>
        {/* Badge type */}
        <div className="flex justify-center mb-4">
          <span className="bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
            Accès {labels}
          </span>
        </div>

        {/* Étape 1 : Téléphone */}
        {step === 'phone' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Icône */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Phone className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Titre */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">Ton numéro</h2>
              <p className="text-white/80 text-sm">Entre ton numéro de téléphone</p>
            </div>

            {/* Affichage numéro */}
            <div className="bg-white/95 rounded-2xl p-4 text-center">
              <p className="text-2xl font-mono font-bold text-gray-800 tracking-wider min-h-[2rem]">
                {formatPhoneDisplay(phone) || '__ __ __ __ __'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {phone.length}/10 chiffres
              </p>
            </div>

            {/* Clavier */}
            <NumPad 
              onDigit={handlePhoneChange}
              onBackspace={handlePhoneBackspace}
              onClear={handlePhoneClear}
            />

            {/* Erreur */}
            {error && (
              <p className="text-center text-white bg-red-500/30 rounded-lg py-2 text-sm">
                {error}
              </p>
            )}

            {/* Bouton continuer */}
            <Button
              onClick={handleSubmitPhone}
              disabled={phone.length !== 10 || isLoading}
              className="w-full h-12 bg-white text-amber-600 hover:bg-white/90 font-bold rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Continuer
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Étape 2 : OTP */}
        {step === 'otp' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Titre */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">Code de vérification</h2>
              <p className="text-white/80 text-sm">
                Envoyé au {formatPhoneDisplay(phone)}
              </p>
            </div>

            {/* Affichage code */}
            <div className="bg-white/95 rounded-2xl p-4 text-center">
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className={cn(
                      "w-10 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold",
                      otp[i] ? "border-amber-500 bg-amber-50 text-amber-600" : "border-gray-300 bg-gray-50"
                    )}
                  >
                    {otp[i] || ''}
                  </div>
                ))}
              </div>
              {devOtp && (
                <p className="text-xs text-gray-400 mt-2">
                  [DEV] Code: {devOtp}
                </p>
              )}
            </div>

            {/* Clavier */}
            <NumPad 
              onDigit={handleOtpChange}
              onBackspace={handleOtpBackspace}
            />

            {/* Erreur */}
            {error && (
              <p className="text-center text-white bg-red-500/30 rounded-lg py-2 text-sm">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleReset}
                variant="ghost"
                className="flex-1 text-white hover:bg-white/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Changer de numéro
              </Button>
            </div>
          </motion.div>
        )}

        {/* Étape 3 : Succès */}
        {step === 'success' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4 py-8"
          >
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Bienvenue !</h2>
              <p className="text-white/80 text-sm">Connexion réussie</p>
            </div>
            <Loader2 className="w-6 h-6 animate-spin text-white mx-auto" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
