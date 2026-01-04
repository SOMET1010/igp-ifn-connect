import React from "react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { useSensoryFeedback } from "@/hooks/useSensoryFeedback";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  emoji?: string;
}

interface PnavimPictogramNavProps {
  /** Items de navigation */
  items: NavItem[];
  /** Classes additionnelles */
  className?: string;
}

/**
 * Navigation par pictogrammes XXL PNAVIM
 * 4-5 icônes max, texte secondaire
 */
export const PnavimPictogramNav: React.FC<PnavimPictogramNavProps> = ({
  items,
  className,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { triggerTap } = useSensoryFeedback();
  const prefersReducedMotion = useReducedMotion();

  const handleNavigate = (path: string) => {
    triggerTap();
    navigate(path);
  };

  return (
    <nav className={cn(
      // Fixed bottom
      "fixed bottom-0 left-0 right-0 z-40",
      // Background
      "bg-white/95 backdrop-blur-lg border-t border-charbon/10",
      // Padding safe area
      "pb-safe px-2 pt-2",
      className
    )}>
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path || 
                          location.pathname.startsWith(item.path + '/');
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={cn(
                // Base
                "flex flex-col items-center justify-center",
                "min-w-[56px] py-2 px-1 rounded-xl",
                // Transitions
                !prefersReducedMotion && "transition-all duration-150",
                // Active state
                isActive 
                  ? "bg-orange-sanguine/15 text-orange-sanguine" 
                  : "text-charbon/60 hover:text-charbon hover:bg-charbon/5",
                // Active scale
                !prefersReducedMotion && "active:scale-90"
              )}
              aria-label={item.label}
            >
              {/* Emoji ou Icône */}
              {item.emoji ? (
                <span className="text-2xl">{item.emoji}</span>
              ) : (
                <Icon className={cn(
                  "w-7 h-7",
                  isActive ? "text-orange-sanguine" : "text-current"
                )} />
              )}
              
              {/* Label (petit, secondaire) */}
              <span className={cn(
                "text-2xs font-medium mt-0.5 truncate max-w-full",
                isActive ? "text-orange-sanguine" : "text-charbon/50"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default PnavimPictogramNav;
