import { useNavigate } from "react-router-dom";
import { Heart, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { AudioButton } from "@/components/shared/AudioButton";
import { CardLarge } from "@/components/ifn";
import { UnifiedHeader } from "@/components/shared/UnifiedHeader";
import { UnifiedBottomNav } from "@/components/shared/UnifiedBottomNav";
import { merchantNavItems } from "@/config/navigation";

export default function MerchantUnderstand() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const pageAudioText = t("understand_audio");

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Floating Audio Button */}
      <AudioButton 
        textToRead={pageAudioText}
        className="fixed bottom-28 right-4 z-50"
        size="lg"
      />

      <UnifiedHeader
        title={t("understand_title")}
        showBack
      />

      <main className="p-4 space-y-6">
        {/* Introduction */}
        <div className="text-center py-4">
          <div className="text-5xl mb-3">💡</div>
          <p className="text-lg text-muted-foreground">
            {t("understand_intro")}
          </p>
        </div>

        {/* CMU Section - Santé */}
        <CardLarge className="border-2 border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <span className="text-4xl">🏥</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-destructive">
                {t("cmu_simple_title")}
              </h2>
              <p className="text-muted-foreground text-sm">CMU</p>
            </div>
          </div>

          <p className="text-lg font-medium text-foreground mb-4">
            "{t("cmu_analogy")}"
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <p className="text-foreground">{t("cmu_percent")}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏥</span>
              <p className="text-foreground">{t("cmu_benefit_1")}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">💊</span>
              <p className="text-foreground">{t("cmu_benefit_2")}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">👶</span>
              <p className="text-foreground">{t("cmu_benefit_3")}</p>
            </div>
          </div>
        </CardLarge>

        {/* RSTI Section - Épargne */}
        <CardLarge className="border-2 border-[hsl(142,76%,36%)]/30 bg-[hsl(142,76%,36%)]/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(142,76%,36%)]/10 flex items-center justify-center">
              <span className="text-4xl">🏦</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[hsl(142,76%,36%)]">
                {t("rsti_simple_title")}
              </h2>
              <p className="text-muted-foreground text-sm">RSTI</p>
            </div>
          </div>

          <p className="text-lg font-medium text-foreground mb-4">
            "{t("rsti_analogy")}"
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💵</span>
              <p className="text-foreground">{t("rsti_percent")}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏦</span>
              <p className="text-foreground">{t("rsti_benefit_1")}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">👴</span>
              <p className="text-foreground">{t("rsti_benefit_2")}</p>
            </div>
          </div>
        </CardLarge>

        {/* Exemple concret */}
        <CardLarge className="border-2 border-secondary/30 bg-secondary/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
              <span className="text-3xl">📊</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {t("example_title")}
            </h2>
          </div>

          <div className="bg-background rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center text-lg">
              <span>{t("example_sale")}</span>
              <span className="font-bold">10 000 FCFA</span>
            </div>
            
            <div className="border-t border-border my-2" />
            
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="text-xl">🏥</span> CMU
              </span>
              <span className="text-destructive font-medium">-100 FCFA</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="text-xl">🏦</span> RSTI
              </span>
              <span className="text-[hsl(142,76%,36%)] font-medium">+50 FCFA ({t("rsti_yours")})</span>
            </div>
            
            <div className="border-t-2 border-border my-2" />
            
            <div className="flex justify-between items-center text-lg">
              <span className="flex items-center gap-2">
                <span className="text-xl">💵</span> {t("you_keep")}
              </span>
              <span className="font-bold text-[hsl(142,76%,36%)]">9 900 FCFA</span>
            </div>
          </div>
        </CardLarge>

        {/* Navigation vers pages détaillées */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center gap-1"
            onClick={() => navigate("/marchand/cmu")}
          >
            <Heart className="w-6 h-6 text-destructive" />
            <span className="text-sm">CMU</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center gap-1"
            onClick={() => navigate("/marchand/argent")}
          >
            <PiggyBank className="w-6 h-6 text-[hsl(142,76%,36%)]" />
            <span className="text-sm">{t("your_money")}</span>
          </Button>
        </div>

        {/* Message rassurant */}
        <div className="text-center py-6">
          <div className="text-4xl mb-2">✨</div>
          <p className="text-lg font-medium text-foreground">
            {t("understand_reassure")}
          </p>
        </div>
      </main>

      <UnifiedBottomNav items={merchantNavItems} />
    </div>
  );
}
