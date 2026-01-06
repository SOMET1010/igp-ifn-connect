import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Volume2, Phone, Heart, PiggyBank, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AudioButton } from "@/components/shared/AudioButton";
import { CardLarge } from "@/components/ifn";
import { toast } from "sonner";
import { EnhancedHeader } from "@/components/shared/EnhancedHeader";
import { UnifiedBottomNav } from "@/components/shared/UnifiedBottomNav";
import { merchantNavItems } from "@/config/navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function MerchantHelp() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [understandOpen, setUnderstandOpen] = useState(false);

  const pageAudioText = t("my_help");

  const handleCallAgent = () => {
    window.location.href = "tel:+2250700000000";
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Floating Audio Button */}
      <AudioButton 
        textToRead={pageAudioText}
        className="fixed bottom-28 right-4 z-50"
        size="lg"
      />

      <EnhancedHeader
        title={t("my_help")}
        showBack
        backTo="/marchand"
        showNotifications={false}
      />

      <main className="p-4 space-y-5">
        {/* Vidéo Comment encaisser */}
        <CardLarge 
          onClick={() => {
            // TODO: Implémenter modal vidéo
            toast.info("Vidéo tutoriel bientôt disponible");
          }}
          className="flex items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center">
            <Play className="w-9 h-9 text-secondary" fill="currentColor" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {t("how_to_collect")}
            </h2>
            <p className="text-muted-foreground mt-1">
              Regarde la vidéo
            </p>
          </div>
        </CardLarge>

        {/* Écouter en Dioula */}
        <CardLarge className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Volume2 className="w-9 h-9 text-amber-600" />
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
        </CardLarge>

        {/* Comprendre CMU et RSTI - Section dépliable */}
        <Collapsible open={understandOpen} onOpenChange={setUnderstandOpen}>
          <CollapsibleTrigger asChild>
            <CardLarge className="flex items-center gap-4 cursor-pointer">
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
            </CardLarge>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            {/* CMU Section */}
            <CardLarge className="border-2 border-destructive/30 bg-destructive/5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🏥</span>
                <h3 className="text-lg font-bold text-destructive">
                  {t("cmu_simple_title")}
                </h3>
              </div>
              <p className="text-foreground mb-3">"{t("cmu_analogy")}"</p>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">💰 {t("cmu_percent")}</p>
                <p className="flex items-center gap-2">🏥 {t("cmu_benefit_1")}</p>
                <p className="flex items-center gap-2">💊 {t("cmu_benefit_2")}</p>
              </div>
            </CardLarge>

            {/* RSTI Section */}
            <CardLarge className="border-2 border-[hsl(142,76%,36%)]/30 bg-[hsl(142,76%,36%)]/5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🏦</span>
                <h3 className="text-lg font-bold text-[hsl(142,76%,36%)]">
                  {t("rsti_simple_title")}
                </h3>
              </div>
              <p className="text-foreground mb-3">"{t("rsti_analogy")}"</p>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">💵 {t("rsti_percent")}</p>
                <p className="flex items-center gap-2">🏦 {t("rsti_benefit_1")}</p>
                <p className="flex items-center gap-2">👴 {t("rsti_benefit_2")}</p>
              </div>
            </CardLarge>

            {/* Exemple concret */}
            <CardLarge className="bg-secondary/5">
              <p className="font-bold mb-2">📊 {t("example_title")}</p>
              <div className="bg-background rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span>{t("example_sale")}</span>
                  <span className="font-bold">10 000 FCFA</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>🏥 CMU</span>
                  <span>-100 FCFA</span>
                </div>
                <div className="flex justify-between text-[hsl(142,76%,36%)]">
                  <span>🏦 RSTI</span>
                  <span>+50 FCFA</span>
                </div>
                <div className="border-t pt-1 flex justify-between font-bold">
                  <span>💵 {t("you_keep")}</span>
                  <span className="text-[hsl(142,76%,36%)]">9 900 FCFA</span>
                </div>
              </div>
            </CardLarge>
          </CollapsibleContent>
        </Collapsible>

        {/* Appeler mon agent */}
        <CardLarge 
          onClick={handleCallAgent}
          className="flex items-center gap-4 bg-[hsl(142,76%,36%)]/5 border-[hsl(142,76%,36%)]/30"
        >
          <div className="w-16 h-16 rounded-2xl bg-[hsl(142,76%,36%)]/10 flex items-center justify-center">
            <Phone className="w-9 h-9 text-[hsl(142,76%,36%)]" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {t("call_agent")}
            </h2>
            <p className="text-muted-foreground mt-1">
              On est là pour toi
            </p>
          </div>
        </CardLarge>

        {/* Message rassurant */}
        <div className="text-center py-8">
          <p className="text-2xl">❓</p>
          <p className="text-muted-foreground mt-2 text-lg">
            Tu hésites ? C'est normal.
          </p>
          <p className="text-muted-foreground">
            Appelle ton agent, il t'aide.
          </p>
        </div>
      </main>

      <UnifiedBottomNav items={merchantNavItems} />
    </div>
  );
}
