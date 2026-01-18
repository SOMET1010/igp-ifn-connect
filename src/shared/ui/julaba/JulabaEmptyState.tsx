/**
 * JulabaEmptyState - État vide inclusif avec illustration
 * 
 * Design: Grande illustration, message simple, action optionnelle
 */
import { cn } from '@/lib/utils';
import { JulabaButton } from './JulabaButton';

export interface JulabaEmptyStateProps {
  /** Emoji ou illustration (grand) */
  emoji: string;
  /** Titre court */
  title: string;
  /** Description simple (optionnel) */
  description?: string;
  /** Bouton d'action principal */
  action?: {
    label: string;
    emoji?: string;
    onClick: () => void;
  };
  /** Style custom */
  className?: string;
}

export function JulabaEmptyState({
  emoji,
  title,
  description,
  action,
  className,
}: JulabaEmptyStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center",
        "py-12 px-6 text-center",
        className
      )}
    >
      {/* Illustration emoji géante */}
      <div className="w-24 h-24 rounded-3xl bg-[hsl(30_100%_95%)] flex items-center justify-center mb-6">
        <span className="text-5xl">{emoji}</span>
      </div>
      
      {/* Titre */}
      <h3 className="text-xl font-bold text-foreground mb-2">
        {title}
      </h3>
      
      {/* Description */}
      {description && (
        <p className="text-base text-muted-foreground max-w-[280px] mb-6">
          {description}
        </p>
      )}
      
      {/* Action */}
      {action && (
        <JulabaButton
          variant="primary"
          size="lg"
          onClick={action.onClick}
          className="min-w-[200px]"
        >
          {action.emoji && <span className="text-xl mr-2">{action.emoji}</span>}
          {action.label}
        </JulabaButton>
      )}
    </div>
  );
}
