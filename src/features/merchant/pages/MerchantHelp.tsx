/**
 * Page Aide - /marchand/aide
 * Refactorisée avec Design System Jùlaba
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { AudioButton } from "@/shared/ui";
import { 
  JulabaPageLayout,
  JulabaHeader,
  JulabaCard,
  JulabaButton,
  JulabaTantie,
  JulabaBottomNav,
} from "@/shared/ui/julaba";
import { MERCHANT_NAV_ITEMS } from "@/config/navigation-julaba";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function MerchantHelp() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [understandOpen, setUnderstandOpen] = useState(false);

  const pageAudioText = t("my_help");

  const handleCallAgent = () => {
    window.location.href = "tel:+2250700000000";
  };

  return (
    <JulabaPageLayout background="warm" className="pb-24">
      {/* Floating Audio Button */}
      <AudioButton 
        textToRead={pageAudioText}
        className="fixed bottom-28 right-4 z-50"
        size="lg"
      />

      <JulabaHeader
        title="❓ Mon aide"
        backPath="/marchand"
      />

      <main className="p-4 space-y-5 max-w-lg mx-auto">
        {/* Message Tantie rassurant */}
        <JulabaTantie
          message="N'hésite pas à demander de l'aide ! Je suis là pour toi."
          variant="small"
        />

        {/* Vidéo Comment encaisser */}
        <JulabaCard 
          interactive
          onClick={() => toast.info("Vidéo tutoriel bientôt disponible")}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <span className="text-3xl">🎬</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">
                {t("how_to_collect")}
              </h2>
              <p className="text-muted-foreground mt-1">
                Regarde la vidéo
              </p>
            </div>
          </div>
        </JulabaCard>

        {/* Écouter en Dioula */}
        <JulabaCard>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <span className="text-3xl">🔊</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">
                {t("listen_dioula")}
              </h2>
              <p className="text-muted-foreground mt-1">
                On t'explique tout
              </p>
            </div>
            <AudioButton 
              textToRead="Bienvenue sur l'application. Pour encaisser, appuie sur le gros bouton vert. Tape le montant, puis choisis Espèces ou Mobile Money."
              size="lg"
              className="h-14 w-14"
            />
          </div>
        </JulabaCard>

        {/* Comprendre CMU et RSTI - Section dépliable */}
        <Collapsible open={understandOpen} onOpenChange={setUnderstandOpen}>
          <CollapsibleTrigger asChild>
            <JulabaCard interactive className="cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl">💡</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">
                    {t("understand_cmu_rsti")}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {t("understand_simple")}
                  </p>
                </div>
                {understandOpen ? (
                  <ChevronUp className="w-6 h-6 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
            </JulabaCard>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            {/* CMU Section */}
            <JulabaCard accent="orange">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🏥</span>
                <h3 className="text-lg font-bold text-primary">
                  {t("cmu_simple_title")}
                </h3>
              </div>
              <p className="text-foreground mb-3">"{t("cmu_analogy")}"</p>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">💰 {t("cmu_percent")}</p>
                <p className="flex items-center gap-2">🏥 {t("cmu_benefit_1")}</p>
                <p className="flex items-center gap-2">💊 {t("cmu_benefit_2")}</p>
              </div>
            </JulabaCard>

            {/* RSTI Section */}
            <JulabaCard accent="green">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🏦</span>
                <h3 className="text-lg font-bold text-secondary">
                  {t("rsti_simple_title")}
                </h3>
              </div>
              <p className="text-foreground mb-3">"{t("rsti_analogy")}"</p>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">💵 {t("rsti_percent")}</p>
                <p className="flex items-center gap-2">🏦 {t("rsti_benefit_1")}</p>
                <p className="flex items-center gap-2">👴 {t("rsti_benefit_2")}</p>
              </div>
            </JulabaCard>

            {/* Exemple concret */}
            <JulabaCard>
              <p className="font-bold mb-2">📊 {t("example_title")}</p>
              <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span>{t("example_sale")}</span>
                  <span className="font-bold">10 000 FCFA</span>
                </div>
                <div className="flex justify-between text-primary">
                  <span>🏥 CMU</span>
                  <span>-100 FCFA</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>🏦 RSTI</span>
                  <span>+50 FCFA</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>💵 {t("you_keep")}</span>
                  <span className="text-secondary">9 900 FCFA</span>
                </div>
              </div>
            </JulabaCard>
          </CollapsibleContent>
        </Collapsible>

        {/* Appeler mon agent */}
        <JulabaCard 
          accent="green"
          interactive
          onClick={handleCallAgent}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <span className="text-3xl">📞</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">
                {t("call_agent")}
              </h2>
              <p className="text-muted-foreground mt-1">
                On est là pour toi
              </p>
            </div>
          </div>
        </JulabaCard>

        {/* Message rassurant */}
        <div className="text-center py-6">
          <p className="text-4xl mb-2">🤗</p>
          <p className="text-muted-foreground text-lg">
            Tu hésites ? C'est normal.
          </p>
          <p className="text-muted-foreground">
            Appelle ton agent, il t'aide.
          </p>
        </div>
      </main>

      <JulabaBottomNav items={MERCHANT_NAV_ITEMS} />
    </JulabaPageLayout>
  );
}
