/**
 * JulabaDialog - Modale inclusive Jùlaba
 * 
 * Design: Grande, centrée, boutons XXL, fond chaud
 */
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JulabaButton } from './JulabaButton';

export interface JulabaDialogProps {
  /** Ouverte ou fermée */
  open: boolean;
  /** Fermer la modale */
  onClose: () => void;
  /** Emoji titre */
  emoji?: string;
  /** Titre */
  title: string;
  /** Description */
  description?: string;
  /** Contenu custom */
  children?: React.ReactNode;
  /** Action principale */
  primaryAction?: {
    label: string;
    emoji?: string;
    onClick: () => void;
    variant?: 'primary' | 'success' | 'danger';
    loading?: boolean;
  };
  /** Action secondaire */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Taille */
  size?: 'sm' | 'md' | 'lg';
}

export function JulabaDialog({
  open,
  onClose,
  emoji,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  size = 'md',
}: JulabaDialogProps) {
  if (!open) return null;
  
  const sizeStyles = {
    sm: 'max-w-[320px]',
    md: 'max-w-[380px]',
    lg: 'max-w-[420px]',
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div 
        className={cn(
          "relative w-full bg-white rounded-3xl p-6",
          "shadow-2xl",
          "animate-scale-in",
          sizeStyles[size]
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[hsl(30_20%_95%)] flex items-center justify-center hover:bg-[hsl(30_20%_90%)] transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        
        {/* Header */}
        <div className="text-center mb-6 pr-8">
          {emoji && (
            <div className="w-16 h-16 rounded-2xl bg-[hsl(30_100%_95%)] flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">{emoji}</span>
            </div>
          )}
          
          <h2 className="text-xl font-bold text-foreground">
            {title}
          </h2>
          
          {description && (
            <p className="mt-2 text-base text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        
        {/* Content */}
        {children && (
          <div className="mb-6">
            {children}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex flex-col gap-3">
          {primaryAction && (
            <JulabaButton
              variant={primaryAction.variant || 'primary'}
              size="lg"
              onClick={primaryAction.onClick}
              disabled={primaryAction.loading}
              className="w-full"
            >
              {primaryAction.emoji && (
                <span className="text-xl mr-2">{primaryAction.emoji}</span>
              )}
              {primaryAction.loading ? 'Chargement...' : primaryAction.label}
            </JulabaButton>
          )}
          
          {secondaryAction && (
            <JulabaButton
              variant="ghost"
              size="md"
              onClick={secondaryAction.onClick}
              className="w-full"
            >
              {secondaryAction.label}
            </JulabaButton>
          )}
        </div>
      </div>
    </div>
  );
}
