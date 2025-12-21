import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, FileText, HelpCircle, User, LucideIcon } from "lucide-react";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface BottomNavIFNProps {
  items?: NavItem[];
  className?: string;
}

const defaultItems: NavItem[] = [
  { icon: Home, label: "Accueil", href: "/marchand" },
  { icon: FileText, label: "Ventes", href: "/marchand/historique" },
  { icon: HelpCircle, label: "Aide", href: "/marchand/aide" },
  { icon: User, label: "Profil", href: "/marchand/profil" },
];

const BottomNavIFN = ({ items = defaultItems, className }: BottomNavIFNProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-40",
      "h-20 bg-card border-t-2 border-border",
      "flex items-center justify-around px-2",
      "safe-area-inset-bottom",
      className
    )}>
      {items.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;

        return (
          <button
            key={item.href}
            onClick={() => navigate(item.href)}
            className={cn(
              "flex flex-col items-center justify-center",
              "min-w-[64px] h-full px-2",
              "transition-all duration-200",
              "touch-manipulation",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full mb-1",
              "transition-all duration-200",
              isActive && "bg-primary/10 scale-110"
            )}>
              <Icon 
                className={cn(
                  "transition-all",
                  isActive ? "w-8 h-8" : "w-7 h-7"
                )} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
            </div>
            <span className={cn(
              "text-[10px] font-medium",
              isActive && "font-bold"
            )}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export { BottomNavIFN };
