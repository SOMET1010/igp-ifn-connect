/**
 * PersonaSelector - Sélecteur visuel de persona avec avatars
 * Permet de choisir entre Tantie Sagesse et Gbairai
 */

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { PERSONAS, PersonaType } from '../config/personas';
import { cn } from '@/lib/utils';

interface PersonaSelectorProps {
  selectedPersona: PersonaType;
  onSelect: (persona: PersonaType) => void;
  className?: string;
}

export function PersonaSelector({ selectedPersona, onSelect, className }: PersonaSelectorProps) {
  const personas: { type: PersonaType; description: string }[] = [
    { type: 'tantie', description: 'Guide bienveillant pour tous' },
    { type: 'jeune', description: 'Style urbain et dynamique' },
  ];

  return (
    <div className={cn('w-full', className)}>
      <h3 className="text-center text-lg font-medium text-foreground mb-2">
        Choisis ton guide
      </h3>
      <p className="text-center text-sm text-muted-foreground mb-6">
        Qui t'accompagne aujourd'hui ?
      </p>

      <div className="grid grid-cols-2 gap-4">
        {personas.map(({ type, description }) => {
          const persona = PERSONAS[type];
          const isSelected = selectedPersona === type;

          return (
            <motion.button
              key={type}
              onClick={() => onSelect(type)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200',
                'bg-card hover:bg-accent/50',
                isSelected
                  ? 'border-primary shadow-lg ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              )}
            >
              {/* Badge de sélection */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md"
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}

              {/* Avatar */}
              <motion.div
                animate={{ scale: isSelected ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="relative w-20 h-20 mb-3"
              >
                <img
                  src={persona.avatar}
                  alt={persona.name}
                  className="w-full h-full object-cover rounded-full border-2 border-background shadow-md"
                  onError={(e) => {
                    // Fallback avec initiales si l'image ne charge pas
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement?.classList.add('bg-primary/20');
                  }}
                />
                {/* Fallback initiales */}
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-primary opacity-0">
                  {type === 'tantie' ? 'TS' : 'GB'}
                </div>
              </motion.div>

              {/* Nom */}
              <span className={cn(
                'font-semibold text-sm',
                isSelected ? 'text-primary' : 'text-foreground'
              )}>
                {persona.name}
              </span>

              {/* Description */}
              <span className="text-xs text-muted-foreground text-center mt-1">
                {description}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Message du persona sélectionné */}
      <motion.div
        key={selectedPersona}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20"
      >
        <p className="text-center text-sm text-foreground italic">
          "{PERSONAS[selectedPersona].greetings.welcome}"
        </p>
      </motion.div>
    </div>
  );
}
