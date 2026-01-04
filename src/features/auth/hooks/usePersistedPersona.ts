/**
 * Hook pour persister le choix de persona dans localStorage
 * Clé: 'pnavim_preferred_persona'
 */

import { useState, useEffect, useCallback } from 'react';
import { PersonaType } from '@/features/auth/config/personas';

const STORAGE_KEY = 'pnavim_preferred_persona';
const DEFAULT_PERSONA: PersonaType = 'tantie';

export function usePersistedPersona() {
  const [persona, setPersonaState] = useState<PersonaType>(DEFAULT_PERSONA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  // Charger le persona depuis localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'tantie' || stored === 'jeune') {
      setPersonaState(stored);
      setIsFirstVisit(false);
    } else {
      setIsFirstVisit(true);
    }
    setIsLoaded(true);
  }, []);

  // Sauvegarder le persona dans localStorage
  const setPersona = useCallback((newPersona: PersonaType) => {
    setPersonaState(newPersona);
    localStorage.setItem(STORAGE_KEY, newPersona);
    setIsFirstVisit(false);
  }, []);

  return {
    persona,
    setPersona,
    isLoaded,
    isFirstVisit,
  };
}
