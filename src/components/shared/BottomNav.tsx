import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface BottomNavProps {
  items: NavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className={cn("w-6 h-6 mb-1", isActive && "animate-bounce-gentle")} />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
