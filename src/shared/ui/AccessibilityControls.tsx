import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Type, Volume2, Moon, Sun, ZoomIn, ZoomOut, Contrast } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useTheme } from 'next-themes';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  audioMode: boolean;
  reduceMotion: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 100,
  highContrast: false,
  audioMode: true,
  reduceMotion: false
};

const STORAGE_KEY = 'julaba-accessibility';

interface AccessibilityControlsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  isOpen,
  onClose
}) => {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Apply settings to DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    root.style.fontSize = `${settings.fontSize}%`;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduce motion
    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

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
          className="bg-card rounded-t-3xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-secondary to-vert-manioc p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-lg">Accessibilité</span>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Settings List */}
          <div className="p-6 space-y-6">
            {/* Font Size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Type className="w-5 h-5 text-primary" />
                  <span className="font-medium">Taille du texte</span>
                </div>
                <span className="text-sm text-muted-foreground">{settings.fontSize}%</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateSetting('fontSize', Math.max(80, settings.fontSize - 10))}
                  className="p-2 rounded-full bg-muted hover:bg-muted/80"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([val]) => updateSetting('fontSize', val)}
                  min={80}
                  max={150}
                  step={10}
                  className="flex-1"
                />
                <button
                  onClick={() => updateSetting('fontSize', Math.min(150, settings.fontSize + 10))}
                  className="p-2 rounded-full bg-muted hover:bg-muted/80"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>
              {/* Preview */}
              <p 
                className="text-muted-foreground p-3 bg-muted/30 rounded-lg"
                style={{ fontSize: `${settings.fontSize * 0.14}px` }}
              >
                Aperçu : Votre texte apparaîtra comme ceci.
              </p>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Contrast className="w-5 h-5 text-primary" />
                <div>
                  <span className="font-medium block">Contraste élevé</span>
                  <span className="text-sm text-muted-foreground">Meilleure lisibilité</span>
                </div>
              </div>
              <Switch
                checked={settings.highContrast}
                onCheckedChange={(checked) => updateSetting('highContrast', checked)}
              />
            </div>

            {/* Audio Mode */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-secondary" />
                <div>
                  <span className="font-medium block">Mode audio</span>
                  <span className="text-sm text-muted-foreground">Lire les instructions à voix haute</span>
                </div>
              </div>
              <Switch
                checked={settings.audioMode}
                onCheckedChange={(checked) => updateSetting('audioMode', checked)}
              />
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-accent" />
                ) : (
                  <Sun className="w-5 h-5 text-accent" />
                )}
                <div>
                  <span className="font-medium block">Mode sombre</span>
                  <span className="text-sm text-muted-foreground">Reposer vos yeux</span>
                </div>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>

            {/* Reduce Motion */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: settings.reduceMotion ? 0 : 360 }}
                  transition={{ duration: 2, repeat: settings.reduceMotion ? 0 : Infinity, ease: 'linear' }}
                >
                  ⚙️
                </motion.div>
                <div>
                  <span className="font-medium block">Réduire les animations</span>
                  <span className="text-sm text-muted-foreground">Interface plus calme</span>
                </div>
              </div>
              <Switch
                checked={settings.reduceMotion}
                onCheckedChange={(checked) => updateSetting('reduceMotion', checked)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-muted/30 flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 h-12"
            >
              Réinitialiser
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 h-12 btn-kpata-primary"
            >
              Appliquer
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// CSS to be added to index.css
export const accessibilityCSS = `
/* High contrast mode */
.high-contrast {
  --foreground: 0 0% 0%;
  --background: 0 0% 100%;
  --primary: 28 100% 45%;
  --muted-foreground: 0 0% 20%;
}

.dark.high-contrast {
  --foreground: 0 0% 100%;
  --background: 0 0% 0%;
  --primary: 28 100% 60%;
  --muted-foreground: 0 0% 80%;
}

/* Reduce motion */
.reduce-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}
`;
