/**
 * JulabaBottomNav - Navigation inférieure style Jùlaba
 * 
 * Design: Max 5 items, pictogrammes XXL, labels simples
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface JulabaNavItem {
  /** Emoji ou icône Lucide */
  emoji?: string;
  icon?: LucideIcon;
  /** Label court */
  label: string;
  /** Route */
  path: string;
}

export interface JulabaBottomNavProps {
  items: JulabaNavItem[];
  className?: string;
}

export function JulabaBottomNav({ items, className }: JulabaBottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Limiter à 5 items max
  const displayItems = items.slice(0, 5);
  
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-white border-t border-[hsl(30_20%_92%)]",
        "px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        "max-w-[428px] mx-auto",
        className
      )}
    >
      <div className="flex justify-around items-end">
        {displayItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-0.5",
                "min-w-[60px] py-2 px-3 rounded-2xl",
                "transition-all duration-150",
                "touch-manipulation",
                isActive 
                  ? "bg-[hsl(30_100%_95%)] scale-105" 
                  : "hover:bg-[hsl(30_50%_97%)]",
                "active:scale-95"
              )}
            >
              {/* Icône ou Emoji */}
              <div className={cn(
                "text-2xl transition-transform",
                isActive && "scale-110"
              )}>
                {item.emoji ? (
                  <span>{item.emoji}</span>
                ) : item.icon ? (
                  <item.icon className={cn(
                    "w-6 h-6",
                    isActive 
                      ? "text-[hsl(27_100%_45%)]" 
                      : "text-[hsl(20_10%_50%)]"
                  )} />
                ) : null}
              </div>
              
              {/* Label */}
              <span className={cn(
                "text-xs font-semibold truncate max-w-[64px]",
                isActive 
                  ? "text-[hsl(27_100%_45%)]" 
                  : "text-[hsl(20_10%_50%)]"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
