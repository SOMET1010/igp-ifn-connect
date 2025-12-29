import { useNavigate } from "react-router-dom";
import { Play, Volume2, Phone, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AudioButton } from "@/components/shared/AudioButton";
import { CardLarge } from "@/components/ifn";
import { toast } from "sonner";
import { EnhancedHeader } from "@/components/shared/EnhancedHeader";
import { UnifiedBottomNav } from "@/components/shared/UnifiedBottomNav";
import { merchantNavItems } from "@/config/navigation";

export default function MerchantHelp() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const pageAudioText = t("my_help");

  const handleCallAgent = () => {
    // Numéro exemple - à remplacer par le vrai numéro
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

        {/* Comprendre CMU et RSTI */}
        <CardLarge 
          onClick={() => navigate("/marchand/comprendre")}
          className="flex items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-9 h-9 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {t("understand_cmu_rsti")}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t("understand_simple")}
            </p>
          </div>
        </CardLarge>

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
