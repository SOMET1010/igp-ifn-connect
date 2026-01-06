import React from 'react';
import { Mic, Loader2, RefreshCw } from 'lucide-react';
import { PhoneInput } from '@/shared/ui';
import { Button } from '@/components/ui/button';
import { VoiceAuthLang } from '@/shared/config/audio/suta';

interface ClassicModeCardProps {
  lang: VoiceAuthLang;
  phone: string;
  onPhoneChange: (value: string) => void;
  onSubmit: () => void;
  onVoiceModeClick: () => void;
  isLoading: boolean;
  isRetrying?: boolean;
}

/**
 * ClassicModeCard - Formulaire classique SECONDAIRE
 * Pour les utilisateurs préférant la saisie texte
 */
export function ClassicModeCard({
  lang,
  phone,
  onPhoneChange,
  onSubmit,
  onVoiceModeClick,
  isLoading,
  isRetrying = false,
}: ClassicModeCardProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Bouton retour vers mode vocal */}
      <button
        type="button"
        onClick={onVoiceModeClick}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors self-start"
      >
        <Mic className="w-4 h-4" />
        {lang === 'nouchi' 
          ? 'Revenir au mode vocal' 
          : 'Revenir au mode vocal'
        }
      </button>

      {/* Input téléphone */}
      <PhoneInput
        value={phone}
        onChange={onPhoneChange}
        disabled={isLoading}
        label={lang === 'nouchi' ? 'Ton numéro de téléphone' : 'Votre numéro de téléphone'}
        placeholder="07 01 02 03 04"
      />

      {/* Bouton validation */}
      <Button
        onClick={onSubmit}
        disabled={isLoading || phone.length < 8}
        className="btn-institutional w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-base font-semibold"
      >
        {isLoading ? (
          isRetrying ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              {lang === 'nouchi' ? 'On réessaie...' : 'Nouvelle tentative...'}
            </>
          ) : (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {lang === 'nouchi' ? 'Ça charge...' : 'Envoi...'}
            </>
          )
        ) : (
          lang === 'nouchi' ? 'Valider' : 'Continuer'
        )}
      </Button>
    </div>
  );
}

export default ClassicModeCard;
