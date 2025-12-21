import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { HeroOverlay } from "@/components/shared/HeroOverlay";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { AudioButton } from "@/components/shared/AudioButton";
import { Pictogram, PictogramType } from "@/components/shared/Pictogram";
import { useLanguage } from "@/contexts/LanguageContext";
import marcheIvoirien from "@/assets/marche-ivoirien.jpg";
import fcfaBills from "@/assets/fcfa-bills.png";
import agentTerrain from "@/assets/agent-terrain.png";
import cooperativeStock from "@/assets/cooperative-stock.png";
import adminDashboard from "@/assets/admin-dashboard.png";

interface RoleCard {
  image: string;
  title: string;
  titleKey: string;
  description: string;
  descKey: string;
  href: string;
  variant: "primary" | "secondary" | "tertiary" | "muted";
  badge?: string;
  badgeKey?: string;
  pictogram: PictogramType;
}

const rolesData: RoleCard[] = [
  {
    image: fcfaBills,
    title: "Je suis Marchand",
    titleKey: "merchant",
    description: "Encaisser et vendre sans souci",
    descKey: "merchant_desc",
    href: "/marchand",
    variant: "primary",
    badge: "⭐ Accès principal",
    badgeKey: "main_access",
    pictogram: "merchant",
  },
  {
    image: agentTerrain,
    title: "Agent terrain",
    titleKey: "agent",
    description: "Aider les marchands",
    descKey: "agent_desc",
    href: "/agent",
    variant: "secondary",
    pictogram: "agent",
  },
  {
    image: cooperativeStock,
    title: "Coopérative",
    titleKey: "cooperative",
    description: "Gérer stock et livraisons",
    descKey: "cooperative_desc",
    href: "/cooperative",
    variant: "tertiary",
    pictogram: "cooperative",
  },
  {
    image: adminDashboard,
    title: "Admin",
    titleKey: "admin",
    description: "Statistiques",
    descKey: "admin_desc",
    href: "/admin",
    variant: "muted",
    pictogram: "admin",
  },
];

const variantStyles = {
  primary: {
    card: "bg-gradient-to-br from-secondary to-secondary/80 border-secondary hover:shadow-glow-green",
    icon: "bg-secondary-foreground/20",
    text: "text-secondary-foreground",
    desc: "text-secondary-foreground/80",
    badge: "bg-secondary-foreground/20 text-secondary-foreground",
  },
  secondary: {
    card: "bg-gradient-to-br from-primary/90 to-primary/70 border-primary hover:shadow-glow-orange",
    icon: "bg-primary-foreground/20",
    text: "text-primary-foreground",
    desc: "text-primary-foreground/80",
    badge: "bg-primary-foreground/20 text-primary-foreground",
  },
  tertiary: {
    card: "bg-gradient-to-br from-accent/80 to-accent/60 border-accent hover:shadow-glow-gold",
    icon: "bg-accent-foreground/10",
    text: "text-accent-foreground",
    desc: "text-accent-foreground/70",
    badge: "bg-accent-foreground/10 text-accent-foreground",
  },
  muted: {
    card: "bg-card border-border hover:border-muted-foreground/30 hover:shadow-glow-muted",
    icon: "bg-muted",
    text: "text-foreground",
    desc: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
  },
};

const handleCardClick = () => {
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
};

interface RoleCardProps {
  role: RoleCard;
  index: number;
  size: "large" | "normal" | "small";
  className?: string;
}

const RoleCardVertical = ({ role, index, size, className }: RoleCardProps) => {
  const styles = variantStyles[role.variant];
  const isPrimary = role.variant === "primary";

  const sizeStyles = {
    large: "min-h-[160px] p-6 shadow-lg",
    normal: "min-h-[130px] p-4",
    small: "min-h-[100px] p-3",
  };

  const iconSizes = {
    large: "w-16 h-16 text-5xl",
    normal: "w-12 h-12 text-3xl",
    small: "w-10 h-10 text-2xl",
  };

  const titleSizes = {
    large: "text-lg",
    normal: "text-base",
    small: "text-sm",
  };

  const descSizes = {
    large: "text-sm",
    normal: "text-xs",
    small: "text-xs",
  };

  return (
    <Link
      to={role.href}
      onClick={handleCardClick}
      className={cn(
        "group relative flex flex-col items-center text-center w-full rounded-2xl border-2 transition-all duration-300",
        "hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "opacity-0 animate-slide-up-bounce",
        isPrimary && "animate-pulse-slow",
        styles.card,
        sizeStyles[size],
        className
      )}
      style={{ animationDelay: `${150 + index * 150}ms` }}
    >
      {/* Image du rôle */}
      <div
        className={cn(
          "flex-shrink-0 rounded-2xl flex items-center justify-center mb-2 overflow-hidden",
          styles.icon,
          iconSizes[size]
        )}
      >
        <img 
          src={role.image} 
          alt={role.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Titre */}
      <h3 className={cn("font-bold", styles.text, titleSizes[size])}>
        {role.title}
      </h3>

      {/* Description */}
      <p className={cn("mt-1 leading-snug", styles.desc, descSizes[size])}>
        {role.description}
      </p>

      {/* Badge (si présent) */}
      {role.badge && (
        <span
          className={cn(
            "mt-2 px-3 py-1 rounded-full text-xs font-medium",
            styles.badge
          )}
        >
          {role.badge}
        </span>
      )}
    </Link>
  );
};

const Index = () => {
  const { t } = useLanguage();
  
  // Texte audio pour la page
  const audioText = `${t('welcome')}. ${t('platform_title')}. ${t('who_are_you')}`;

  return (
    <HeroOverlay backgroundImage={marcheIvoirien}>
      <div className="min-h-screen flex flex-col relative">
        {/* Sélecteur de langue */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSelector variant="icon" />
        </div>

        {/* Header simplifié */}
        <header className="py-8 px-6">
          <div className="max-w-lg mx-auto text-center">
            <div className="text-4xl mb-3">🌍</div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{t('platform_title')}</h1>
            <p className="text-sm text-white/80 mt-2">
              {t('platform_subtitle')}
            </p>
          </div>
        </header>

        {/* Question principale */}
        <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
          <div 
            className="text-center mb-6 opacity-0 animate-fade-in" 
            style={{ animationDelay: "50ms", animationFillMode: "forwards" }}
          >
            <h2 className="text-xl font-bold text-white mb-1">
              {t('who_are_you')}
            </h2>
            <p className="text-white/70 text-sm">
              {t('choose_access')}
            </p>
          </div>

          {/* Cartes de rôles - Layout hybride */}
          <div className="space-y-3">
            {/* Marchand - Featured full-width */}
            <RoleCardVertical role={rolesData[0]} index={0} size="large" />

            {/* Agent + Coopérative - Grille 2 colonnes */}
            <div className="grid grid-cols-2 gap-3">
              <RoleCardVertical role={rolesData[1]} index={1} size="normal" />
              <RoleCardVertical role={rolesData[2]} index={2} size="normal" />
            </div>

            {/* Admin - Centré et compact */}
            <div className="flex justify-center">
              <RoleCardVertical 
                role={rolesData[3]} 
                index={3} 
                size="small" 
                className="max-w-[180px]" 
              />
            </div>
          </div>

          {/* Lien vers démo */}
          <div className="text-center mt-6">
            <Link 
              to="/demo" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/90 text-sm transition-all"
            >
              🧪 Mode démonstration
            </Link>
          </div>

          {/* Aide rassurante */}
          <div className="text-center text-sm text-white/60 mt-4 px-4">
            <p className="flex items-center justify-center gap-2">
              <span>❓</span>
              <span>{t('help_text')}</span>
            </p>
          </div>
        </main>

        {/* Footer discret */}
        <footer className="py-6 px-4 text-center">
          <p className="text-xs text-white/70">
            🇨🇮 {t('country')}
          </p>
          <p className="text-xs text-white/50 mt-1">
            DGE • ANSUT • DGI
          </p>
        </footer>

        {/* Bouton audio flottant */}
        <AudioButton 
          textToRead={audioText}
          variant="floating"
          size="lg"
          className="bottom-24 right-4"
        />
      </div>
    </HeroOverlay>
  );
};

export default Index;
