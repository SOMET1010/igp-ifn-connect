/**
 * VoiceModeTabs - Onglets Caisse/Articles/Stock
 */

import { ShoppingCart, Package, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VoiceMode } from '../types/voice.types';

interface VoiceModeTabsProps {
  mode: VoiceMode;
  onModeChange: (mode: VoiceMode) => void;
  disabled?: boolean;
}

const MODES: { value: VoiceMode; label: string; icon: typeof ShoppingCart }[] = [
  { value: 'cashier', label: 'Caisse', icon: ShoppingCart },
  { value: 'article', label: 'Articles', icon: Package },
  { value: 'stock', label: 'Stock', icon: Layers }
];

export function VoiceModeTabs({ mode, onModeChange, disabled = false }: VoiceModeTabsProps) {
  return (
    <div className="flex bg-muted rounded-lg p-1 gap-1">
      {MODES.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => !disabled && onModeChange(value)}
          disabled={disabled}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md",
            "transition-all duration-200",
            "text-sm font-medium",
            mode === value 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Icon size={18} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
