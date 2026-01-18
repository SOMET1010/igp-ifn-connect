/**
 * JulabaListItem - Item de liste inclusif avec pictogramme
 * 
 * Design: Emoji/icône à gauche, contenu centré, action à droite
 */
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface JulabaListItemProps {
  /** Emoji ou caractère */
  emoji?: string;
  /** Titre principal */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Valeur à droite (ex: prix, quantité) */
  value?: string;
  /** Badge de statut */
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger' | 'neutral';
  };
  /** Afficher chevron */
  showChevron?: boolean;
  /** Au clic */
  onClick?: () => void;
  /** Style custom */
  className?: string;
}

const badgeStyles = {
  success: 'bg-[hsl(145_70%_92%)] text-[hsl(145_74%_32%)]',
  warning: 'bg-[hsl(45_100%_90%)] text-[hsl(45_100%_30%)]',
  danger: 'bg-[hsl(0_80%_92%)] text-[hsl(0_80%_40%)]',
  neutral: 'bg-[hsl(30_20%_92%)] text-[hsl(20_10%_45%)]',
};

export function JulabaListItem({
  emoji,
  title,
  subtitle,
  value,
  badge,
  showChevron = true,
  onClick,
  className,
}: JulabaListItemProps) {
  const isInteractive = !!onClick;
  
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-4",
        "bg-white rounded-2xl",
        "border border-[hsl(30_20%_92%)]",
        "transition-all duration-150",
        isInteractive && [
          "cursor-pointer",
          "hover:shadow-md hover:border-[hsl(30_100%_80%)]",
          "active:scale-[0.98]"
        ],
        className
      )}
    >
      {/* Emoji */}
      {emoji && (
        <div className="w-12 h-12 rounded-xl bg-[hsl(30_100%_95%)] flex items-center justify-center shrink-0">
          <span className="text-2xl">{emoji}</span>
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">
          {title}
        </p>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate">
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Value & Badge */}
      <div className="flex items-center gap-2 shrink-0">
        {value && (
          <span className="font-bold text-foreground">
            {value}
          </span>
        )}
        
        {badge && (
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-semibold",
            badgeStyles[badge.variant]
          )}>
            {badge.text}
          </span>
        )}
        
        {showChevron && isInteractive && (
          <ChevronRight className="w-5 h-5 text-[hsl(20_10%_60%)]" />
        )}
      </div>
    </div>
  );
}
