/**
 * JulabaHeader - En-tête simplifié style Jùlaba
 * 
 * Design: Titre centré, actions simples, fond chaleureux
 */
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowLeft, LogOut, Bell, Volume2 } from 'lucide-react';

export interface JulabaHeaderProps {
  /** Titre principal */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Afficher bouton retour */
  showBack?: boolean;
  /** Route de retour */
  backTo?: string;
  /** Afficher bouton audio */
  showAudio?: boolean;
  /** Afficher bouton déconnexion */
  showLogout?: boolean;
  /** Handler déconnexion */
  onLogout?: () => void;
  /** Afficher notifications */
  showNotifications?: boolean;
  /** Nombre de notifications */
  notificationCount?: number;
  /** Handler notifications */
  onNotifications?: () => void;
  className?: string;
}

export function JulabaHeader({
  title,
  subtitle,
  showBack = false,
  backTo,
  showAudio = false,
  showLogout = false,
  onLogout,
  showNotifications = false,
  notificationCount = 0,
  onNotifications,
  className,
}: JulabaHeaderProps) {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };
  
  return (
    <header
      className={cn(
        "sticky top-0 z-40",
        "bg-[hsl(30_100%_98%)]/95 backdrop-blur-sm",
        "border-b border-[hsl(30_20%_92%)]",
        "px-4 py-3",
        className
      )}
    >
      <div className="flex items-center justify-between max-w-[428px] mx-auto">
        {/* Gauche: Retour ou espace */}
        <div className="w-12">
          {showBack && (
            <button
              onClick={handleBack}
              className={cn(
                "w-10 h-10 rounded-full",
                "flex items-center justify-center",
                "bg-white border border-[hsl(30_20%_90%)]",
                "active:scale-95 transition-transform",
                "shadow-sm"
              )}
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          )}
        </div>
        
        {/* Centre: Titre */}
        <div className="flex-1 text-center px-2">
          <h1 className="text-lg font-bold text-foreground truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Droite: Actions */}
        <div className="w-12 flex justify-end gap-1">
          {showAudio && (
            <button
              className={cn(
                "w-10 h-10 rounded-full",
                "flex items-center justify-center",
                "bg-[hsl(30_100%_95%)]",
                "active:scale-95 transition-transform"
              )}
              aria-label="Écouter"
            >
              <Volume2 className="w-5 h-5 text-[hsl(27_100%_45%)]" />
            </button>
          )}
          
          {showNotifications && (
            <button
              onClick={onNotifications}
              className={cn(
                "w-10 h-10 rounded-full relative",
                "flex items-center justify-center",
                "bg-white border border-[hsl(30_20%_90%)]",
                "active:scale-95 transition-transform"
              )}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-foreground" />
              {notificationCount > 0 && (
                <span className={cn(
                  "absolute -top-1 -right-1",
                  "min-w-[18px] h-[18px] px-1",
                  "bg-red-500 text-white text-xs font-bold",
                  "rounded-full flex items-center justify-center"
                )}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          )}
          
          {showLogout && (
            <button
              onClick={onLogout}
              className={cn(
                "w-10 h-10 rounded-full",
                "flex items-center justify-center",
                "hover:bg-red-50",
                "active:scale-95 transition-transform"
              )}
              aria-label="Déconnexion"
            >
              <LogOut className="w-5 h-5 text-muted-foreground hover:text-red-500" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
