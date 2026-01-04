/**
 * PersonaSelector - Sélecteur visuel de persona style PNAVIM
 * Design avec cartes colorées orange/vert
 */

import { motion } from 'framer-motion';
import { Check, Volume2 } from 'lucide-react';
import { PERSONAS, PersonaType } from '@/features/auth/config/personas';
import { cn } from '@/lib/utils';

interface PersonaSelectorProps {
  selectedPersona: PersonaType;
  onSelect: (persona: PersonaType) => void;
  className?: string;
}

export function PersonaSelector({ selectedPersona, onSelect, className }: PersonaSelectorProps) {
  const personas: { type: PersonaType; description: string; color: string }[] = [
    { type: 'tantie', description: 'Guide bienveillant', color: 'bg-amber-500' },
    { type: 'jeune', description: 'Style dynamique', color: 'bg-emerald-500' },
  ];

  return (
    <div className={cn('w-full max-w-sm', className)}>
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-foreground mb-1">
          Choisis ton guide
        </h3>
        <p className="text-sm text-muted-foreground">
          Qui t'accompagne aujourd'hui ?
        </p>
      </div>

      {/* Persona Cards */}
      <div className="grid grid-cols-2 gap-4">
        {personas.map(({ type, description, color }) => {
          const persona = PERSONAS[type];
          const isSelected = selectedPersona === type;

          return (
            <motion.button
              key={type}
              onClick={() => onSelect(type)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'relative flex flex-col items-center p-5 rounded-2xl transition-all duration-200',
                color,
                isSelected
                  ? 'ring-4 ring-white shadow-xl'
                  : 'opacity-80 hover:opacity-100'
              )}
            >
              {/* Badge de sélection */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <Check className="w-5 h-5 text-emerald-600" />
                </motion.div>
              )}

              {/* Avatar avec cercle blanc */}
              <motion.div
                animate={{ scale: isSelected ? 1.05 : 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="relative w-24 h-24 mb-3"
              >
                <div className="w-full h-full rounded-full bg-white/90 p-1 shadow-lg">
                  <img
                    src={persona.avatar}
                    alt={persona.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.name)}&background=fff&color=f97316&size=128&bold=true`;
                    }}
                  />
                </div>
              </motion.div>

              {/* Nom badge */}
              <div className="bg-white/95 px-4 py-1.5 rounded-full shadow-md">
                <span className="font-bold text-sm text-gray-800">
                  {persona.name}
                </span>
              </div>

              {/* Description */}
              <span className="text-xs text-white/90 text-center mt-2 font-medium">
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
        className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Volume2 className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/80 mb-1">
              {PERSONAS[selectedPersona].name} dit :
            </p>
            <p className="text-foreground font-medium">
              "{PERSONAS[selectedPersona].greetings.welcome}"
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
