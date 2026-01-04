import { Link } from "react-router-dom";
import { Volume2, HelpCircle, User, Menu, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroOverlay } from "@/components/shared/HeroOverlay";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { Pictogram, PictogramType } from "@/components/shared/Pictogram";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import marcheIvoirien from "@/assets/marche-ivoirien.jpg";

// TTS (voix PNAVIM uniquement)
import { playPnavimTts } from "@/shared/services/tts/pnavimTtsPlayer";
import { PNAVIM_VOICES } from "@/shared/config/voiceConfig";

interface RoleCard {
  title: string;
  titleKey: string;
  description: string;
  descKey: string;
  href: string;
  color: string;
  textColor: string;
  badgeColor: string;
  badge?: string;
  badgeKey?: string;
  pictogram: PictogramType;
  audioText: string;
}

const rolesData: RoleCard[] = [
  {
    title: "Je suis Marchand",
    titleKey: "merchant",
    description: "Encaisser et vendre",
    descKey: "merchant_desc",
    href: "/marchand/login",
    color: "bg-[#F97316]", // Orange vif
    textColor: "text-white",
    badgeColor: "bg-white/20 text-white",
    badge: "Accès principal",
    badgeKey: "main_access",
    pictogram: "merchant",
    audioText: "Je suis Marchand. Appuie ici pour encaisser et vendre.",
  },
  {
    title: "Agent terrain",
    titleKey: "agent",
    description: "Aider les marchands",
    descKey: "agent_desc",
    href: "/agent/login",
    color: "bg-[#22C55E]", // Vert vif
    textColor: "text-white",
    badgeColor: "bg-white/20 text-white",
    pictogram: "agent",
    audioText: "Agent terrain. Appuie ici pour aider les marchands.",
  },
  {
    title: "Coopérative",
    titleKey: "cooperative",
    description: "Gérer stock et livraisons",
    descKey: "cooperative_desc",
    href: "/cooperative/login",
    color: "bg-[#3B82F6]", // Bleu
    textColor: "text-white",
    badgeColor: "bg-white/20 text-white",
    pictogram: "cooperative",
    audioText: "Coopérative. Appuie ici pour gérer stock et livraisons.",
  },
  {
    title: "Admin",
    titleKey: "admin",
    description: "Statistiques",
    descKey: "admin_desc",
    href: "/admin/login",
    color: "bg-muted",
    textColor: "text-foreground",
    badgeColor: "bg-muted-foreground/20 text-muted-foreground",
    pictogram: "admin",
    audioText: "Administrateur. Accès aux statistiques.",
  },
];

// Haptic feedback
const triggerHaptic = () => {
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
};

// Text-to-Speech (ElevenLabs PNAVIM)
const speakText = (text: string) => {
  void playPnavimTts(text, { voiceId: PNAVIM_VOICES.DEFAULT });
};

interface InclusiveRoleCardProps {
  role: RoleCard;
  index: number;
  isFeatured?: boolean;
}

const InclusiveRoleCard = ({ role, index, isFeatured }: InclusiveRoleCardProps) => {
  const { t } = useLanguage();

  const handleAudioClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerHaptic();
    speakText(role.audioText);
  };

  return (
    <Link
      to={role.href}
      onClick={triggerHaptic}
      className={cn(
        "group relative flex flex-col items-center text-center w-full rounded-3xl transition-all duration-300",
        "hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50",
        "opacity-0 animate-slide-up-bounce shadow-xl",
        role.color,
        isFeatured ? "min-h-[220px] py-8 px-6" : "min-h-[180px] py-6 px-4"
      )}
      style={{ animationDelay: `${200 + index * 150}ms` }}
    >
      {/* Badge - Positionné en haut à droite */}
      {role.badge && (
        <span
          className={cn(
            "absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold",
            role.badgeColor
          )}
        >
          ⭐ {t(role.badgeKey || "") || role.badge}
        </span>
      )}

      {/* Pictogramme géant centré dans un cercle */}
      <div
        className={cn(
          "flex items-center justify-center rounded-full mb-4",
          "bg-white/20 backdrop-blur-sm",
          isFeatured ? "w-24 h-24" : "w-20 h-20"
        )}
      >
        <Pictogram
          type={role.pictogram}
          size={isFeatured ? "xl" : "lg"}
          showBackground={false}
          className={role.textColor}
        />
      </div>

      {/* Titre XXL */}
      <h3
        className={cn(
          "font-black leading-tight",
          role.textColor,
          isFeatured ? "text-2xl" : "text-xl"
        )}
      >
        {t(role.titleKey) || role.title}
      </h3>

      {/* Description */}
      <p
        className={cn(
          "mt-1 opacity-90",
          role.textColor,
          isFeatured ? "text-base" : "text-sm"
        )}
      >
        {t(role.descKey) || role.description}
      </p>

      {/* Bouton Audio intégré */}
      <button
        type="button"
        onClick={handleAudioClick}
        className={cn(
          "mt-4 flex items-center gap-2 px-4 py-2 rounded-full transition-all",
          "bg-white/10 hover:bg-white/20 active:scale-95",
          role.textColor
        )}
        aria-label={t("audio_play") || "Écouter"}
      >
        <Volume2 className="w-4 h-4" />
        <span className="text-sm">{t("audio_play") || "🔊 Écouter"}</span>
      </button>
    </Link>
  );
};

const Index = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  return (
    <HeroOverlay backgroundImage={marcheIvoirien}>
      <div className="min-h-screen flex flex-col relative">
        {/* Header minimaliste inspiré de la référence */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-2">
            {/* Logo et titre */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-primary-foreground">
                PNAVIM-CI
              </span>
              <span className="hidden sm:block text-xs text-primary-foreground/70">
                Plateforme Nationale des Acteurs du Vivrier Marchand
              </span>
            </div>

            {/* Actions header */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-white/10 text-primary-foreground"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-white/10 text-primary-foreground flex items-center gap-1"
                aria-label="Zoom"
              >
                <Minus className="w-4 h-4" />
                <span className="text-sm font-bold">A</span>
                <Plus className="w-4 h-4" />
              </button>
              <LanguageSelector variant="icon" />
              <button
                type="button"
                onClick={() => speakText(`${t("welcome")}. ${t("platform_title")}. ${t("who_are_you")}`)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-primary-foreground"
                aria-label={t("listen") || "Écouter"}
              >
                <Volume2 className="w-5 h-5" />
              </button>
              {isAuthenticated && (
                <Link
                  to="/compte"
                  className="p-2 rounded-full hover:bg-white/10 text-primary-foreground"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>

          {/* Sous-titre */}
          <div className="bg-white/10 py-1.5 text-center">
            <span className="text-xs font-semibold text-primary-foreground tracking-wide uppercase">
              Plateforme d'inclusion numérique
            </span>
          </div>
        </header>

        {/* Spacer pour le header fixe */}
        <div className="h-24" />

        {/* Contenu principal */}
        <main className="flex-1 max-w-md mx-auto w-full px-4 py-8">
          {/* Titre de bienvenue */}
          <div
            className="text-center mb-8 opacity-0 animate-fade-in"
            style={{ animationDelay: "50ms", animationFillMode: "forwards" }}
          >
            <h1 className="text-3xl font-black text-foreground mb-2">
              {t("welcome") || "Bienvenue"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("who_are_you") || "Qui êtes-vous ?"}
            </p>
          </div>

          {/* Cartes de rôles - Design inclusif vertical */}
          <div className="space-y-4">
            {/* Marchand - Carte principale featured */}
            <InclusiveRoleCard role={rolesData[0]} index={0} isFeatured />

            {/* Agent - Carte secondaire */}
            <InclusiveRoleCard role={rolesData[1]} index={1} />

            {/* Coopérative et Admin - Plus compacts */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                to={rolesData[2].href}
                onClick={triggerHaptic}
                className={cn(
                  "flex flex-col items-center text-center rounded-2xl py-4 px-3 transition-all",
                  "hover:scale-[1.02] active:scale-[0.97] shadow-lg",
                  "opacity-0 animate-slide-up-bounce",
                  rolesData[2].color,
                  rolesData[2].textColor
                )}
                style={{ animationDelay: "500ms" }}
              >
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <Pictogram
                    type={rolesData[2].pictogram}
                    size="md"
                    showBackground={false}
                    className="text-white"
                  />
                </div>
                <span className="font-bold text-sm">
                  {t(rolesData[2].titleKey) || rolesData[2].title}
                </span>
              </Link>

              <Link
                to={rolesData[3].href}
                onClick={triggerHaptic}
                className={cn(
                  "flex flex-col items-center text-center rounded-2xl py-4 px-3 transition-all",
                  "hover:scale-[1.02] active:scale-[0.97] shadow-lg border border-border",
                  "opacity-0 animate-slide-up-bounce",
                  rolesData[3].color,
                  rolesData[3].textColor
                )}
                style={{ animationDelay: "600ms" }}
              >
                <div className="w-14 h-14 rounded-full bg-muted-foreground/10 flex items-center justify-center mb-2">
                  <Pictogram
                    type={rolesData[3].pictogram}
                    size="md"
                    showBackground={false}
                    className="text-foreground"
                  />
                </div>
                <span className="font-bold text-sm">
                  {t(rolesData[3].titleKey) || rolesData[3].title}
                </span>
              </Link>
            </div>
          </div>

          {/* Section d'aide */}
          <div
            className="mt-8 flex flex-col items-center opacity-0 animate-fade-in"
            style={{ animationDelay: "700ms", animationFillMode: "forwards" }}
          >
            <div className="flex items-center gap-2 px-6 py-3 bg-card border-2 border-warning rounded-2xl shadow-sm">
              <HelpCircle className="w-5 h-5 text-warning" />
              <div className="text-left">
                <p className="font-bold text-foreground text-sm">
                  {t("help_text")?.split("?")[0] || "Besoin d'aide"} ?
                </p>
                <p className="text-muted-foreground text-xs">
                  Demande à ton agent
                </p>
              </div>
            </div>

            {/* Lien démo */}
            <Link
              to="/demo"
              className="mt-4 text-sm text-muted-foreground hover:text-foreground underline transition-colors"
            >
              🧪 Mode démonstration
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 px-4 text-center">
          <p className="text-xs text-muted-foreground">
            🇨🇮 {t("country") || "République de Côte d'Ivoire"}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">DGE • ANSUT • DGI</p>
        </footer>
      </div>
    </HeroOverlay>
  );
};

export default Index;
