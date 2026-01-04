import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Minus, Plus, Calculator, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechTts } from '@/features/social-auth/hooks/useSpeechTts';

interface DenominationCount {
  value: number;
  count: number;
  label: string;
  color: string;
}

const DENOMINATIONS: DenominationCount[] = [
  { value: 10000, count: 0, label: '10 000 F', color: 'bg-blue-500' },
  { value: 5000, count: 0, label: '5 000 F', color: 'bg-green-600' },
  { value: 2000, count: 0, label: '2 000 F', color: 'bg-yellow-500' },
  { value: 1000, count: 0, label: '1 000 F', color: 'bg-orange-500' },
  { value: 500, count: 0, label: '500 F', color: 'bg-amber-600' },
  { value: 200, count: 0, label: '200 F', color: 'bg-purple-500' },
  { value: 100, count: 0, label: '100 F', color: 'bg-gray-500' },
  { value: 50, count: 0, label: '50 F', color: 'bg-rose-500' },
  { value: 25, count: 0, label: '25 F', color: 'bg-teal-500' },
  { value: 10, count: 0, label: '10 F', color: 'bg-slate-400' },
  { value: 5, count: 0, label: '5 F', color: 'bg-zinc-400' },
];

interface CurrencyCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (total: number) => void;
}

export const CurrencyCalculator: React.FC<CurrencyCalculatorProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [denominations, setDenominations] = useState<DenominationCount[]>(
    DENOMINATIONS.map(d => ({ ...d }))
  );
  const { speak, isSpeaking } = useSpeechTts();

  const total = useMemo(() => {
    return denominations.reduce((sum, d) => sum + (d.value * d.count), 0);
  }, [denominations]);

  const handleIncrement = useCallback((value: number) => {
    setDenominations(prev => 
      prev.map(d => d.value === value ? { ...d, count: d.count + 1 } : d)
    );
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  }, []);

  const handleDecrement = useCallback((value: number) => {
    setDenominations(prev => 
      prev.map(d => d.value === value && d.count > 0 ? { ...d, count: d.count - 1 } : d)
    );
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  }, []);

  const handleReset = useCallback(() => {
    setDenominations(DENOMINATIONS.map(d => ({ ...d })));
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]);
    }
  }, []);

  const handleSpeakTotal = useCallback(() => {
    const formatted = new Intl.NumberFormat('fr-FR').format(total);
    speak(`Le total est de ${formatted} francs CFA.`);
  }, [total, speak]);

  const handleConfirm = useCallback(() => {
    onConfirm?.(total);
    onClose();
  }, [total, onConfirm, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-card rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-orange-sanguine p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-lg">Calculateur</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Total Display */}
          <div className="p-4 bg-muted/50 border-b shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Total :</span>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-foreground">
                  {new Intl.NumberFormat('fr-FR').format(total)} F
                </span>
                <button
                  onClick={handleSpeakTotal}
                  className={`p-2 rounded-full transition-colors ${
                    isSpeaking ? 'bg-secondary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Denominations Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {denominations.map((denom) => (
                <div
                  key={denom.value}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                >
                  {/* Denomination Label */}
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-8 rounded ${denom.color} flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">
                        {denom.value >= 1000 ? `${denom.value / 1000}K` : denom.value}
                      </span>
                    </div>
                    <span className="font-medium text-foreground">{denom.label}</span>
                  </div>

                  {/* Counter */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecrement(denom.value)}
                      disabled={denom.count === 0}
                      className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    
                    <span className="w-12 text-center text-xl font-bold text-foreground">
                      {denom.count}
                    </span>
                    
                    <button
                      onClick={() => handleIncrement(denom.value)}
                      className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Plus className="w-5 h-5" />
                    </button>

                    {/* Subtotal */}
                    {denom.count > 0 && (
                      <span className="ml-2 text-sm text-muted-foreground w-20 text-right">
                        = {new Intl.NumberFormat('fr-FR').format(denom.value * denom.count)} F
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-muted/30 shrink-0 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 h-12 btn-kpata-primary"
            >
              Confirmer {total > 0 && `(${new Intl.NumberFormat('fr-FR').format(total)} F)`}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
