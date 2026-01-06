import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Volume2, X, ChevronRight } from 'lucide-react';
import { useTts } from '@/shared/hooks/useTts';

interface HelpItem {
  id: string;
  title: string;
  description: string;
  audioText: string;
}

interface ContextualHelpProps {
  pageKey: string;
  className?: string;
}

const HELP_CONTENT: Record<string, HelpItem[]> = {
  'merchant-dashboard': [
    {
      id: '1',
      title: 'Encaisser un paiement',
      description: 'Appuyez sur le bouton vert pour recevoir un paiement de votre client.',
      audioText: 'Pour encaisser un paiement, appuyez sur le bouton vert. Ensuite, entrez le montant à recevoir.'
    },
    {
      id: '2',
      title: 'Voir mon historique',
      description: 'Consultez toutes vos ventes du jour et des jours précédents.',
      audioText: 'Pour voir votre historique de ventes, appuyez sur le bouton historique. Vous verrez toutes vos transactions.'
    },
    {
      id: '3',
      title: 'Mon solde CMU',
      description: 'Vérifiez votre couverture santé et vos cotisations.',
      audioText: 'Pour vérifier votre couverture santé CMU, appuyez sur le bouton CMU en bas de l\'écran.'
    }
  ],
  'merchant-cashier': [
    {
      id: '1',
      title: 'Ajouter un produit',
      description: 'Scannez le code ou cherchez le produit dans la liste.',
      audioText: 'Pour ajouter un produit, vous pouvez scanner son code-barres ou le chercher dans la liste des produits.'
    },
    {
      id: '2',
      title: 'Modifier la quantité',
      description: 'Utilisez les boutons + et - pour changer la quantité.',
      audioText: 'Pour modifier la quantité d\'un produit, utilisez les boutons plus et moins à côté du produit.'
    },
    {
      id: '3',
      title: 'Valider la vente',
      description: 'Appuyez sur le bouton orange pour confirmer et encaisser.',
      audioText: 'Quand vous avez terminé, appuyez sur le bouton orange pour valider et encaisser la vente.'
    }
  ],
  'agent-dashboard': [
    {
      id: '1',
      title: 'Enrôler un marchand',
      description: 'Inscrivez un nouveau commerçant sur la plateforme.',
      audioText: 'Pour enrôler un nouveau marchand, appuyez sur le bouton d\'enrôlement et suivez les étapes.'
    },
    {
      id: '2',
      title: 'Mes marchands',
      description: 'Voir la liste des marchands que vous avez enrôlés.',
      audioText: 'Pour voir vos marchands, appuyez sur le bouton Mes Marchands. Vous verrez tous les commerçants que vous avez inscrits.'
    }
  ],
  'login': [
    {
      id: '1',
      title: 'Se connecter par la voix',
      description: 'Appuyez sur le micro et dites votre numéro de téléphone.',
      audioText: 'Pour vous connecter, appuyez sur le bouton micro orange et dites votre numéro de téléphone clairement.'
    },
    {
      id: '2',
      title: 'Taper mon numéro',
      description: 'Si vous préférez, vous pouvez taper votre numéro au clavier.',
      audioText: 'Si vous préférez taper votre numéro, appuyez sur le bouton Je préfère taper en bas de l\'écran.'
    }
  ]
};

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  pageKey,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const { speak, isSpeaking, stop } = useTts();

  const helpItems = HELP_CONTENT[pageKey] || [];

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    stop();
    setExpandedItem(null);
  }, [stop]);

  const handlePlayAudio = useCallback((item: HelpItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stop();
    } else {
      speak(item.audioText);
    }
  }, [speak, stop, isSpeaking]);

  const handleToggleItem = useCallback((itemId: string) => {
    setExpandedItem(prev => prev === itemId ? null : itemId);
  }, []);

  if (helpItems.length === 0) return null;

  return (
    <>
      {/* Floating Help Button */}
      <motion.button
        onClick={handleOpen}
        className={`fixed z-40 w-14 h-14 rounded-full bg-secondary text-secondary-foreground shadow-lg flex items-center justify-center ${className}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <HelpCircle className="w-7 h-7" />
      </motion.button>

      {/* Help Panel */}
      <AnimatePresence>
        {isOpen && (
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
              className="bg-card rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-secondary to-vert-manioc p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-6 h-6 text-white" />
                  <span className="text-white font-bold text-lg">Besoin d'aide ?</span>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/80 hover:text-white p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Help Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {helpItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className="bg-muted/30 rounded-xl overflow-hidden"
                    initial={false}
                  >
                    <button
                      onClick={() => handleToggleItem(item.id)}
                      className="w-full p-4 flex items-center justify-between text-left"
                    >
                      <span className="font-semibold text-foreground">{item.title}</span>
                      <ChevronRight 
                        className={`w-5 h-5 text-muted-foreground transition-transform ${
                          expandedItem === item.id ? 'rotate-90' : ''
                        }`} 
                      />
                    </button>

                    <AnimatePresence>
                      {expandedItem === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3">
                            <p className="text-muted-foreground">
                              {item.description}
                            </p>
                            <button
                              onClick={(e) => handlePlayAudio(item, e)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                                isSpeaking
                                  ? 'bg-secondary text-secondary-foreground'
                                  : 'bg-primary/10 text-primary hover:bg-primary/20'
                              }`}
                            >
                              <Volume2 className="w-5 h-5" />
                              <span className="font-medium">
                                {isSpeaking ? 'En cours...' : 'Écouter'}
                              </span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Footer tip */}
              <div className="p-4 bg-muted/30 shrink-0">
                <p className="text-center text-sm text-muted-foreground">
                  💡 Appuyez sur "Écouter" pour entendre l'explication
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
