import { Link } from "react-router-dom";
import { Banknote, Users, Boxes, Settings, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleCard {
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  variant: "primary" | "secondary" | "tertiary" | "muted";
  size: "large" | "normal" | "small";
}

const roles: RoleCard[] = [
  {
    emoji: "💵",
    title: "Je suis Marchand",
    subtitle: "",
    description: "Encaisser, vendre et accéder à la protection sociale",
    href: "/marchand",
    variant: "primary",
    size: "large",
  },
  {
    emoji: "👥",
    title: "Je suis Agent terrain",
    subtitle: "",
    description: "Enrôler et accompagner les marchands",
    href: "/agent",
    variant: "secondary",
    size: "normal",
  },
  {
    emoji: "📦",
    title: "Coopérative",
    subtitle: "",
    description: "Gérer les stocks et commandes",
    href: "/cooperative",
    variant: "tertiary",
    size: "normal",
  },
  {
    emoji: "⚙️",
    title: "Administration",
    subtitle: "",
    description: "Statistiques et cartographie",
    href: "/admin",
    variant: "muted",
    size: "small",
  },
];

const variantStyles = {
  primary: {
    card: "bg-gradient-to-br from-secondary to-secondary/80 border-secondary hover:shadow-forest",
    icon: "bg-secondary-foreground/20",
    text: "text-secondary-foreground",
    desc: "text-secondary-foreground/80",
    chevron: "text-secondary-foreground/60 group-hover:text-secondary-foreground",
  },
  secondary: {
    card: "bg-gradient-to-br from-primary/90 to-primary/70 border-primary hover:shadow-africa",
    icon: "bg-primary-foreground/20",
    text: "text-primary-foreground",
    desc: "text-primary-foreground/80",
    chevron: "text-primary-foreground/60 group-hover:text-primary-foreground",
  },
  tertiary: {
    card: "bg-gradient-to-br from-accent/80 to-accent/60 border-accent hover:shadow-lg",
    icon: "bg-accent-foreground/10",
    text: "text-accent-foreground",
    desc: "text-accent-foreground/70",
    chevron: "text-accent-foreground/50 group-hover:text-accent-foreground",
  },
  muted: {
    card: "bg-card border-border hover:border-muted-foreground/30 hover:shadow-md",
    icon: "bg-muted",
    text: "text-foreground",
    desc: "text-muted-foreground",
    chevron: "text-muted-foreground group-hover:text-foreground",
  },
};

const sizeStyles = {
  large: "min-h-[120px] p-6",
  normal: "min-h-[100px] p-5",
  small: "min-h-[88px] p-4",
};

const iconSizes = {
  large: "w-14 h-14 text-4xl",
  normal: "w-12 h-12 text-3xl",
  small: "w-10 h-10 text-2xl",
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header simplifié */}
      <header className="bg-gradient-africa text-primary-foreground py-8 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-4xl mb-3">🌍</div>
          <h1 className="text-2xl md:text-3xl font-bold">Plateforme IGP & IFN</h1>
          <p className="text-sm opacity-90 mt-2">
            Commerce vivrier ivoirien
          </p>
        </div>
      </header>

      {/* Question principale */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Qui êtes-vous ?
          </h2>
          <p className="text-muted-foreground">
            Choisissez votre accès pour continuer
          </p>
        </div>

        {/* Cartes de rôles */}
        <div className="space-y-4">
          {roles.map((role) => {
            const styles = variantStyles[role.variant];
            return (
              <Link
                key={role.href}
                to={role.href}
                className={cn(
                  "group flex items-center gap-4 w-full rounded-2xl border-2 transition-all duration-300 active:scale-[0.98]",
                  styles.card,
                  sizeStyles[role.size]
                )}
              >
                {/* Icône emoji */}
                <div
                  className={cn(
                    "flex-shrink-0 rounded-2xl flex items-center justify-center",
                    styles.icon,
                    iconSizes[role.size]
                  )}
                >
                  <span>{role.emoji}</span>
                </div>

                {/* Texte */}
                <div className="flex-1 min-w-0">
                  <h3 className={cn("font-bold text-lg", styles.text)}>
                    {role.title}
                  </h3>
                  <p className={cn("text-sm mt-0.5 leading-snug", styles.desc)}>
                    {role.description}
                  </p>
                </div>

                {/* Chevron */}
                <ChevronRight
                  className={cn(
                    "w-6 h-6 flex-shrink-0 transition-transform group-hover:translate-x-1",
                    styles.chevron
                  )}
                />
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer discret */}
      <footer className="py-6 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          🇨🇮 République de Côte d'Ivoire
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          DGE • ANSUT • DGI
        </p>
      </footer>
    </div>
  );
};

export default Index;
