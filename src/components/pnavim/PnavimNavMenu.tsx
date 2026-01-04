import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Store, Users, UserCheck, ShoppingBag, Map } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Accueil', href: '/', icon: Home },
  { label: 'Marchands', href: '/marchand', icon: Store },
  { label: 'Coopératives', href: '/cooperative', icon: Users },
  { label: 'Agents', href: '/agent', icon: UserCheck },
  { label: 'Marché', href: '/market', icon: ShoppingBag },
  { label: 'Carte', href: '/carte', icon: Map },
];

interface PnavimNavMenuProps {
  className?: string;
  variant?: 'horizontal' | 'vertical';
}

/**
 * Menu de navigation principal PNAVIM
 * Horizontal sur desktop, vertical sur mobile (drawer)
 */
export const PnavimNavMenu: React.FC<PnavimNavMenuProps> = ({
  className,
  variant = 'horizontal',
}) => {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <nav 
      className={cn(
        variant === 'horizontal' 
          ? "hidden lg:flex items-center gap-1" 
          : "flex flex-col gap-2",
        className
      )}
      aria-label="Navigation principale"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              variant === 'horizontal' ? "flex-row" : "flex-row w-full",
              active 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
            {active && variant === 'horizontal' && (
              <span 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-orange-sanguine rounded-full"
                aria-hidden="true"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default PnavimNavMenu;
