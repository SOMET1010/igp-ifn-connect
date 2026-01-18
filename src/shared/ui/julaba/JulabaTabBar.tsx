/**
 * JulabaTabBar - Barre d'onglets inclusive avec emojis
 * 
 * Design: Max 4 tabs, emojis XXL, feedback tactile
 */
import { cn } from '@/lib/utils';

export interface JulabaTab {
  id: string;
  emoji: string;
  label: string;
}

export interface JulabaTabBarProps {
  tabs: JulabaTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function JulabaTabBar({ 
  tabs, 
  activeTab, 
  onTabChange,
  className 
}: JulabaTabBarProps) {
  // Limiter à 4 tabs max
  const displayTabs = tabs.slice(0, 4);
  
  return (
    <div 
      className={cn(
        "flex gap-2 p-1.5 bg-white rounded-2xl",
        "border border-[hsl(30_20%_90%)]",
        "shadow-sm",
        className
      )}
    >
      {displayTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1",
              "py-3 px-2 rounded-xl",
              "transition-all duration-150",
              "touch-manipulation",
              "active:scale-95",
              isActive 
                ? "bg-gradient-to-br from-[hsl(30_100%_60%)] to-[hsl(27_100%_50%)] shadow-md" 
                : "hover:bg-[hsl(30_50%_97%)]"
            )}
          >
            {/* Emoji XXL */}
            <span className={cn(
              "text-2xl transition-transform",
              isActive && "scale-110"
            )}>
              {tab.emoji}
            </span>
            
            {/* Label */}
            <span className={cn(
              "text-xs font-semibold truncate max-w-full",
              isActive 
                ? "text-white" 
                : "text-[hsl(20_10%_45%)]"
            )}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
