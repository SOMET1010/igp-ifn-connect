import { cn } from '@/lib/utils';

export type PictogramType = 
  | 'money' | 'cart' | 'check' | 'error' | 'warning'
  | 'user' | 'location' | 'phone' | 'camera' | 'mic'
  | 'home' | 'stock' | 'payment' | 'health' | 'sync'
  | 'merchant' | 'agent' | 'cooperative' | 'admin'
  | 'cash' | 'mobile' | 'transfer' | 'credit'
  | 'scan' | 'promo' | 'supplier' | 'history'
  | 'play' | 'language' | 'help' | 'settings';

interface PictogramConfig {
  emoji: string;
  color: string;
  bgColor: string;
}

const PICTOGRAMS: Record<PictogramType, PictogramConfig> = {
  // États et actions
  money: { emoji: '💵', color: 'text-green-600', bgColor: 'bg-green-100' },
  cart: { emoji: '🛒', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  check: { emoji: '✅', color: 'text-secondary', bgColor: 'bg-secondary/10' },
  error: { emoji: '❌', color: 'text-destructive', bgColor: 'bg-destructive/10' },
  warning: { emoji: '⚠️', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  
  // Personnes
  user: { emoji: '👤', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  merchant: { emoji: '💵', color: 'text-secondary', bgColor: 'bg-secondary/10' },
  agent: { emoji: '👥', color: 'text-primary', bgColor: 'bg-primary/10' },
  cooperative: { emoji: '🏪', color: 'text-accent', bgColor: 'bg-accent/10' },
  admin: { emoji: '⚙️', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  
  // Navigation
  home: { emoji: '🏠', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  location: { emoji: '📍', color: 'text-red-600', bgColor: 'bg-red-100' },
  settings: { emoji: '⚙️', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  help: { emoji: '❓', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  
  // Commerce
  stock: { emoji: '📦', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  payment: { emoji: '💰', color: 'text-green-600', bgColor: 'bg-green-100' },
  cash: { emoji: '💵', color: 'text-green-600', bgColor: 'bg-green-100' },
  mobile: { emoji: '📱', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  transfer: { emoji: '🏦', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  credit: { emoji: '📝', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  scan: { emoji: '📷', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  promo: { emoji: '🎁', color: 'text-pink-600', bgColor: 'bg-pink-100' },
  supplier: { emoji: '🌿', color: 'text-green-600', bgColor: 'bg-green-100' },
  history: { emoji: '📋', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  
  // Santé
  health: { emoji: '🏥', color: 'text-red-500', bgColor: 'bg-red-100' },
  
  // Technologie
  phone: { emoji: '📞', color: 'text-green-600', bgColor: 'bg-green-100' },
  camera: { emoji: '📷', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  mic: { emoji: '🎤', color: 'text-red-600', bgColor: 'bg-red-100' },
  sync: { emoji: '🔄', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  
  // Media
  play: { emoji: '🔊', color: 'text-primary', bgColor: 'bg-primary/10' },
  language: { emoji: '🌍', color: 'text-blue-600', bgColor: 'bg-blue-100' },
};

interface PictogramProps {
  type: PictogramType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBackground?: boolean;
  className?: string;
}

export function Pictogram({ 
  type, 
  size = 'lg', 
  showBackground = true,
  className 
}: PictogramProps) {
  const config = PICTOGRAMS[type];
  
  const sizeStyles = {
    sm: { container: 'w-8 h-8', emoji: 'text-lg' },
    md: { container: 'w-12 h-12', emoji: 'text-2xl' },
    lg: { container: 'w-16 h-16', emoji: 'text-4xl' },
    xl: { container: 'w-20 h-20', emoji: 'text-5xl' },
  };

  const { container, emoji } = sizeStyles[size];

  if (!config) {
    console.warn(`Pictogram type "${type}" not found`);
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl transition-transform hover:scale-105",
        container,
        showBackground && config.bgColor,
        className
      )}
      role="img"
      aria-label={type}
    >
      <span className={cn(emoji, "select-none")}>
        {config.emoji}
      </span>
    </div>
  );
}

// Composant pour afficher un pictogramme avec label
interface LabeledPictogramProps extends PictogramProps {
  label?: string;
  sublabel?: string;
}

export function LabeledPictogram({ 
  label, 
  sublabel, 
  ...pictogramProps 
}: LabeledPictogramProps) {
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <Pictogram {...pictogramProps} />
      {label && (
        <span className="font-semibold text-foreground text-sm">
          {label}
        </span>
      )}
      {sublabel && (
        <span className="text-xs text-muted-foreground">
          {sublabel}
        </span>
      )}
    </div>
  );
}
