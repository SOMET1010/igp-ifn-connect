import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Globe } from 'lucide-react';

import { playPnavimTts } from '@/shared/services/tts/pnavimTtsPlayer';
import { PNAVIM_VOICES } from '@/shared/config/voiceConfig';

interface LanguageSelectorProps {
  variant?: 'icon' | 'full';
  className?: string;
}

export function LanguageSelector({ variant = 'icon', className }: LanguageSelectorProps) {
  const { language, setLanguage, languages, currentLanguageInfo, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const handleSelect = (code: string) => {
    setLanguage(code as any);
    setOpen(false);

    // Feedback sonore (voix PNAVIM)
    const lang = languages.find(l => l.code === code);
    if (lang) {
      void playPnavimTts(lang.nativeName, { voiceId: PNAVIM_VOICES.DEFAULT });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size={variant === 'icon' ? 'icon' : 'default'}
          className={cn(
            "relative transition-all hover:scale-105",
            variant === 'icon' 
              ? "w-14 h-14 rounded-full bg-background/80 backdrop-blur border-2 border-border shadow-lg" 
              : "gap-2 px-4",
            className
          )}
        >
          <Globe className="w-6 h-6" />
          {variant === 'full' && (
            <span className="font-medium">{currentLanguageInfo.nativeName}</span>
          )}
          <span className="absolute -top-1 -right-1 text-lg">
            {currentLanguageInfo.symbol}
          </span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-center text-xl flex items-center justify-center gap-3">
            <Globe className="w-6 h-6" />
            {t('choose_language')}
          </SheetTitle>
        </SheetHeader>
        
        <div className="grid grid-cols-2 gap-4 p-4">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={cn(
                "relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300",
                "min-h-[100px] hover:scale-[1.02] active:scale-[0.98]",
                language === lang.code
                  ? "border-primary bg-primary/10 shadow-lg"
                  : "border-border hover:border-primary/50 bg-card"
              )}
            >
              {/* Symbole visuel */}
              <div 
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-2",
                  `bg-gradient-to-br ${lang.colors}`
                )}
              >
                <span className="drop-shadow-lg">{lang.symbol}</span>
              </div>
              
              {/* Nom natif */}
              <span className="font-bold text-foreground text-lg">
                {lang.nativeName}
              </span>
              
              {/* Nom français (si différent) */}
              {lang.code !== 'fr' && (
                <span className="text-sm text-muted-foreground mt-1">
                  {lang.name}
                </span>
              )}
              
              {/* Indicateur de sélection */}
              {language === lang.code && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-sm">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
