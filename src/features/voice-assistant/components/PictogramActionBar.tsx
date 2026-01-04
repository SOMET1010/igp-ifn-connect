/**
 * PictogramActionBar - Barre d'actions pictogrammes
 * Pour utilisateurs peu alphabétisés
 */

import { Check, X, RotateCcw, HelpCircle, Undo2, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PictogramActionBarProps {
  onConfirm: () => void;
  onCancel: () => void;
  onRepeat: () => void;
  onHelp: () => void;
  onUndo?: () => void;
  onMic?: () => void;
  showMic?: boolean;
  disabled?: boolean;
  className?: string;
}

interface ActionButton {
  icon: typeof Check;
  label: string;
  color: string;
  bgColor: string;
  action: () => void;
}

export function PictogramActionBar({
  onConfirm,
  onCancel,
  onRepeat,
  onHelp,
  onUndo,
  onMic,
  showMic = false,
  disabled = false,
  className
}: PictogramActionBarProps) {
  const actions: ActionButton[] = [
    { 
      icon: Check, 
      label: 'Oui', 
      color: 'text-green-600', 
      bgColor: 'bg-green-100 hover:bg-green-200 active:bg-green-300', 
      action: onConfirm 
    },
    { 
      icon: X, 
      label: 'Non', 
      color: 'text-red-600', 
      bgColor: 'bg-red-100 hover:bg-red-200 active:bg-red-300', 
      action: onCancel 
    },
    { 
      icon: RotateCcw, 
      label: 'Répéter', 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100 hover:bg-blue-200 active:bg-blue-300', 
      action: onRepeat 
    },
    { 
      icon: HelpCircle, 
      label: 'Aide', 
      color: 'text-amber-600', 
      bgColor: 'bg-amber-100 hover:bg-amber-200 active:bg-amber-300', 
      action: onHelp 
    }
  ];
  
  if (onUndo) {
    actions.push({
      icon: Undo2,
      label: 'Retour',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300',
      action: onUndo
    });
  }
  
  if (showMic && onMic) {
    actions.unshift({
      icon: Mic,
      label: 'Parler',
      color: 'text-primary',
      bgColor: 'bg-primary/10 hover:bg-primary/20 active:bg-primary/30',
      action: onMic
    });
  }
  
  return (
    <div className={cn(
      "flex items-center justify-center gap-3 p-3",
      className
    )}>
      {actions.map(({ icon: Icon, label, color, bgColor, action }) => (
        <button
          key={label}
          onClick={action}
          disabled={disabled}
          className={cn(
            "flex flex-col items-center justify-center p-3 rounded-xl",
            "transition-all duration-150",
            "min-w-[60px]",
            bgColor,
            color,
            disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-label={label}
        >
          <Icon size={28} strokeWidth={2.5} />
          <span className="text-xs mt-1 font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
