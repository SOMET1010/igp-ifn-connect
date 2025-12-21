import { Link } from "react-router-dom";
import { Globe, ArrowRight } from "lucide-react";
import { HeroOverlay } from "@/components/shared/HeroOverlay";
import { BadgeChip } from "@/components/shared/BadgeChip";
import { GlassPillButton } from "@/components/shared/GlassPillButton";
import { Button } from "@/components/ui/button";

const BACKGROUND_IMAGE =
  "https://images.pexels.com/photos/3213283/pexels-photo-3213283.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop";

const Landing = () => {
  const currentDate = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <HeroOverlay backgroundImage={BACKGROUND_IMAGE}>
      <div className="min-h-screen flex flex-col px-4 py-6 sm:px-6 lg:px-8">
        {/* Badges flottants */}
        <div className="relative flex-1">
          {/* Badge haut gauche */}
          <div className="absolute top-0 left-0">
            <BadgeChip>🛡️ Protection sociale</BadgeChip>
          </div>

          {/* Date haut droite */}
          <div className="absolute top-0 right-0 text-right">
            <p className="text-white/80 text-sm font-medium">
              Côte d'Ivoire,
            </p>
            <p className="text-white text-sm font-semibold capitalize">
              {currentDate}
            </p>
          </div>

          {/* Badge milieu gauche */}
          <div className="absolute top-24 left-0">
            <BadgeChip className="bg-secondary">💰 Inclusion financière</BadgeChip>
          </div>

          {/* Badge milieu droite */}
          <div className="absolute top-20 right-0">
            <BadgeChip className="bg-accent text-accent-foreground">
              🛒 Commerce digital
            </BadgeChip>
          </div>

          {/* Contenu central */}
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center pt-32 sm:pt-24">
            {/* Icône globe */}
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6 border border-white/20">
              <Globe className="w-8 h-8 text-white" />
            </div>

            {/* Titre principal */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl mb-4">
              Plateforme d'Inclusion Numérique
            </h1>
            <h2 className="text-xl sm:text-2xl font-semibold text-white/90 mb-6">
              Pour le Secteur Informel en Côte d'Ivoire
            </h2>

            {/* Sous-titre descriptif */}
            <p className="text-white/75 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
              Transformation digitale du secteur vivrier marchand&nbsp;:
              <br />
              modernisation, protection sociale et inclusion financière
            </p>

            {/* Mention accessibilité */}
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 border border-white/20 mb-8">
              <p className="text-white text-sm font-medium">
                ♿ ACCESSIBLE À TOUS — Voix • Pictogrammes • Multilingue
              </p>
            </div>

            {/* CTA principal */}
            <Link to="/accueil">
              <Button
                size="lg"
                className="btn-xxl bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2 pulse-glow"
              >
                Accéder à la plateforme
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Badge mobile bas droite */}
          <div className="absolute bottom-4 right-0">
            <BadgeChip className="bg-white/20 text-white border border-white/30">
              📱 Mobile first
            </BadgeChip>
          </div>
        </div>

        {/* Section partenaires */}
        <div className="flex flex-wrap items-center justify-center gap-4 py-6">
          <GlassPillButton label="Piloté par DGE" />
          <GlassPillButton label="Partenaires ANSUT" />
        </div>

        {/* Footer institutionnel */}
        <footer className="text-center py-4 border-t border-white/10">
          <p className="text-white/60 text-xs">
            © 2024-2025 • République de Côte d'Ivoire
          </p>
        </footer>
      </div>
    </HeroOverlay>
  );
};

export default Landing;
