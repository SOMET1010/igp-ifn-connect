import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Package, ClipboardList, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const CooperativeBottomNav: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t("home"), path: '/cooperative' },
    { icon: Package, label: t("stock"), path: '/cooperative/stock' },
    { icon: ClipboardList, label: t("orders"), path: '/cooperative/commandes' },
    { icon: User, label: t("profile"), path: '/cooperative/profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
