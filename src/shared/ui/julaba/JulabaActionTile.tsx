/**
 * JulabaActionTile - Tuile d'action carrée style Jùlaba
 * 
 * Design: Pictogramme central XXL, label simple, aspect ratio 1:1
 */
import { cn } from '@/lib/utils';
import { LucideIcon, ChevronRight } from 'lucide-react';

export interface JulabaActionTileProps {
  /** Emoji principal */
  emoji?: string;
  /** Ou icône Lucide */
  icon?: LucideIcon;
  /** Label court */
  label: string;
  /** Description optionnelle */
  description?: string;
  /** Valeur badge (ex: nombre) */
  badge?: string | number;
  /** Couleur de fond de l'icône */
  iconBg?: 'orange' | 'green' | 'gold' | 'blue' | 'purple' | 'gray';
  /** Afficher chevron */
  showChevron?: boolean;
  /** Au clic */
  onClick: () => void;
  /** Désactivé */
  disabled?: boolean;
  className?: string;
}

const iconBgColors = {
  orange: 'bg-gradient-to-br from-[hsl(30_100%_60%)] to-[hsl(27_100%_50%)]',
  green: 'bg-gradient-to-br from-[hsl(145_74%_42%)] to-[hsl(145_74%_32%)]',
  gold: 'bg-gradient-to-br from-[hsl(45_100%_55%)] to-[hsl(40_100%_45%)]',
  blue: 'bg-gradient-to-br from-[hsl(210_100%_55%)] to-[hsl(210_100%_45%)]',
  purple: 'bg-gradient-to-br from-[hsl(270_70%_60%)] to-[hsl(270_70%_50%)]',
  gray: 'bg-gradient-to-br from-[hsl(20_10%_60%)] to-[hsl(20_10%_50%)]',
};

export function JulabaActionTile({
  emoji,
  icon: Icon,
  label,
  description,
  badge,
  iconBg = 'orange',
  showChevron = false,
  onClick,
  disabled = false,
  className,
}: JulabaActionTileProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base
        "relative w-full p-4 rounded-[20px]",
        "bg-white border border-[hsl(30_20%_90%)]",
        "shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)]",
        "flex flex-col items-center justify-center gap-3",
        "transition-all duration-150",
        "touch-manipulation",
        
        // Hover & Active
        !disabled && "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        
        // Disabled
        disabled && "opacity-50 cursor-not-allowed",
        
        className
      )}
    >
      {/* Badge en haut à droite */}
      {badge !== undefined && (
        <span className={cn(
          "absolute top-3 right-3",
          "min-w-[24px] h-[24px] px-2",
          "bg-[hsl(30_100%_60%)] text-white",
          "text-xs font-bold rounded-full",
          "flex items-center justify-center"
        )}>
          {badge}
        </span>
      )}
      
      {/* Icône centrale */}
      <div className={cn(
        "w-16 h-16 rounded-2xl flex items-center justify-center",
        iconBgColors[iconBg]
      )}>
        {emoji ? (
          <span className="text-3xl">{emoji}</span>
        ) : Icon ? (
          <Icon className="w-8 h-8 text-white" />
        ) : null}
      </div>
      
      {/* Label */}
      <div className="text-center">
        <p className="font-bold text-foreground text-base">
          {label}
        </p>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {description}
          </p>
        )}
      </div>
      
      {/* Chevron optionnel */}
      {showChevron && (
        <ChevronRight className="absolute right-3 bottom-3 w-5 h-5 text-muted-foreground" />
      )}
    </button>
  );
}
