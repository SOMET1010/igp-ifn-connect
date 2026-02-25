import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import type { DesignMode } from '@/styles/design-tokens';

interface DesignModeContextType {
  mode: DesignMode;
  setMode: (mode: DesignMode) => void;
  isInstitutional: boolean;
  isTerrain: boolean;
}

const DesignModeContext = createContext<DesignModeContextType | undefined>(undefined);

const STORAGE_KEY = 'julaba-design-mode';

/** Routes qui forcent le mode institutionnel */
const INSTITUTIONAL_ROUTES = ['/admin', '/presentation'];

interface DesignModeProviderProps {
  children: ReactNode;
  defaultMode?: DesignMode;
}

export function DesignModeProvider({ children, defaultMode }: DesignModeProviderProps) {
  const [mode, setModeState] = useState<DesignMode>(() => {
    if (defaultMode) return defaultMode;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'institutional' || stored === 'terrain') return stored;
    }
    return 'terrain';
  });

  const setMode = useCallback((newMode: DesignMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  }, []);

  // Appliquer la classe CSS sur <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('mode-institutional', 'mode-terrain');
    root.classList.add(`mode-${mode}`);
    
    if (mode === 'institutional') {
      root.style.setProperty('--font-body', "'Montserrat', 'Inter', system-ui, sans-serif");
    } else {
      root.style.setProperty('--font-body', "'Nunito', 'Segoe UI', system-ui, sans-serif");
    }
  }, [mode]);

  const value: DesignModeContextType = {
    mode,
    setMode,
    isInstitutional: mode === 'institutional',
    isTerrain: mode === 'terrain',
  };

  return (
    <DesignModeContext.Provider value={value}>
      {children}
    </DesignModeContext.Provider>
  );
}

/** Place this component inside BrowserRouter to auto-switch mode based on route */
export function RouteDesignModeSync() {
  const location = useLocation();
  const { setMode } = useDesignMode();

  useEffect(() => {
    const isInstitutionalRoute = INSTITUTIONAL_ROUTES.some(
      (route) => location.pathname === route || location.pathname.startsWith(route + '/')
    );
    setMode(isInstitutionalRoute ? 'institutional' : 'terrain');
  }, [location.pathname, setMode]);

  return null;
}

export function useDesignMode() {
  const context = useContext(DesignModeContext);
  if (!context) {
    throw new Error('useDesignMode must be used within a DesignModeProvider');
  }
  return context;
}
