/**
 * Contenu de la section Aide (intégré dans MerchantProfile)
 * Extrait de MerchantHelp.tsx
 */

import { useState } from "react";
import { Play, Volume2, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AudioButton } from "@/shared/ui";
import { CardLarge } from "@/shared/ui/ifn";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function HelpSectionContent() {
  const { t } = useLanguage();
  const [understandOpen, setUnderstandOpen] = useState(false);

  const handleCallAgent = () => {
    window.location.href = "tel:+2250700000000";
  };

  return (
    <div className="space-y-4">
      {/* Vidéo Comment encaisser */}
      <CardLarge 
        onClick={() => toast.info("Vidéo tutoriel bientôt disponible")}
        className="flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
          <Play className="w-7 h-7 text-secondary" fill="currentColor" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">
            {t("how_to_collect")}
          </h2>
          <p className="text-muted-foreground text-sm">
            Regarde la vidéo
          </p>
        </div>
      </CardLarge>

      {/* Écouter en Dioula */}
      <CardLarge className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <Volume2 className="w-7 h-7 text-amber-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">
            {t("listen_dioula")}
          </h2>
          <p className="text-muted-foreground text-sm">
            On t'explique tout
          </p>
        </div>
        <AudioButton 
          textToRead="Bienvenue sur l'application. Pour encaisser, appuie sur le gros bouton vert."
          size="lg"
          className="h-12 w-12"
        />
      </CardLarge>

      {/* Comprendre CMU et RSTI */}
      <Collapsible open={understandOpen} onOpenChange={setUnderstandOpen}>
        <CollapsibleTrigger asChild>
          <CardLarge className="flex items-center gap-4 cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">💡</span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">
                {t("understand_cmu_rsti")}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t("understand_simple")}
              </p>
            </div>
            {understandOpen ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </CardLarge>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-3 mt-3">
          {/* CMU Section */}
          <CardLarge className="border-2 border-destructive/30 bg-destructive/5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🏥</span>
              <h3 className="font-bold text-destructive">{t("cmu_simple_title")}</h3>
            </div>
            <p className="text-foreground text-sm mb-2">"{t("cmu_analogy")}"</p>
            <div className="space-y-1 text-xs">
              <p>💰 {t("cmu_percent")}</p>
              <p>🏥 {t("cmu_benefit_1")}</p>
              <p>💊 {t("cmu_benefit_2")}</p>
            </div>
          </CardLarge>

          {/* RSTI Section */}
          <CardLarge className="border-2 border-julaba-secondary/30 bg-julaba-secondary/5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🏦</span>
              <h3 className="font-bold text-julaba-secondary">{t("rsti_simple_title")}</h3>
            </div>
            <p className="text-foreground text-sm mb-2">"{t("rsti_analogy")}"</p>
            <div className="space-y-1 text-xs">
              <p>💵 {t("rsti_percent")}</p>
              <p>🏦 {t("rsti_benefit_1")}</p>
              <p>👴 {t("rsti_benefit_2")}</p>
            </div>
          </CardLarge>
        </CollapsibleContent>
      </Collapsible>

      {/* Appeler mon agent */}
      <CardLarge 
        onClick={handleCallAgent}
        className="flex items-center gap-4 bg-julaba-secondary/5 border-julaba-secondary/30"
      >
        <div className="w-14 h-14 rounded-2xl bg-julaba-secondary/10 flex items-center justify-center">
          <Phone className="w-7 h-7 text-julaba-secondary" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">
            {t("call_agent")}
          </h2>
          <p className="text-muted-foreground text-sm">
            On est là pour toi
          </p>
        </div>
      </CardLarge>
    </div>
  );
}
