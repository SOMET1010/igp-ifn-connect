import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { LANGUAGES } from "@/lib/translations";
import { AudioButton } from "@/components/shared/AudioButton";
import { CardLarge, ButtonSecondary, BottomNavIFN } from "@/components/ifn";

interface ProfileData {
  full_name: string;
  activity_type: string;
}

export default function MerchantProfile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data: merchantData } = await supabase
        .from("merchants")
        .select("full_name, activity_type")
        .eq("user_id", user.id)
        .single();

      if (merchantData) {
        setProfile(merchantData);
      }

      setIsLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/marchand/login");
  };

  const pageAudioText = `${t("my_profile")}. ${profile?.full_name || ""}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Floating Audio Button */}
      {audioEnabled && (
        <AudioButton 
          textToRead={pageAudioText}
          className="fixed bottom-28 right-4 z-50"
          size="lg"
        />
      )}

      {/* Header */}
      <header className="bg-gradient-forest text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/marchand")}
            className="text-primary-foreground hover:bg-primary-foreground/10 h-12 w-12"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">{t("my_profile")}</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Avatar et nom */}
        <div className="text-center py-8">
          <div className="w-28 h-28 mx-auto rounded-full bg-secondary/10 flex items-center justify-center text-6xl mb-4">
            👤
          </div>
          <h2 className="text-3xl font-black text-foreground">
            {profile?.full_name || t("merchant")}
          </h2>
          <p className="text-lg text-muted-foreground mt-1">
            {profile?.activity_type}
          </p>
        </div>

        {/* Sélecteur de langue */}
        <CardLarge>
          <h3 className="text-lg font-bold text-foreground mb-4">
            {t("choose_language")}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`p-4 rounded-xl text-left transition-all touch-manipulation ${
                  language === lang.code
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <span className="text-2xl mr-2">{lang.symbol}</span>
                <span className="font-bold">{lang.nativeName}</span>
              </button>
            ))}
          </div>
        </CardLarge>

        {/* Toggle Audio */}
        <CardLarge className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              {audioEnabled ? (
                <Volume2 className="w-6 h-6 text-secondary" />
              ) : (
                <VolumeX className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                Son et audio
              </p>
              <p className="text-muted-foreground">
                {audioEnabled ? "Activé" : "Désactivé"}
              </p>
            </div>
          </div>
          <Switch
            checked={audioEnabled}
            onCheckedChange={setAudioEnabled}
            className="scale-125"
          />
        </CardLarge>

        {/* Bouton Déconnexion */}
        <ButtonSecondary
          onClick={handleSignOut}
          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
        >
          <LogOut className="w-6 h-6 mr-2" />
          Se déconnecter
        </ButtonSecondary>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground pt-4">
          🇨🇮 Plateforme IFN • ANSUT × DGE
        </p>
      </main>

      <BottomNavIFN />
    </div>
  );
}
