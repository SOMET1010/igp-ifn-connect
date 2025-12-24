import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Volume2, VolumeX, Loader2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES } from "@/lib/translations";
import { AudioButton } from "@/components/shared/AudioButton";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { UnifiedHeader } from "@/components/shared/UnifiedHeader";
import { UnifiedBottomNav } from "@/components/shared/UnifiedBottomNav";
import { merchantNavItems } from "@/config/navigation";
import { useMerchantProfile } from "@/features/merchant/hooks/useMerchantProfile";
import { ProfileHeader, ProfileEditForm } from "@/features/merchant/components/profile";

export default function MerchantProfile() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const { isSupported, isSubscribed, isLoading: notifLoading, subscribe, unsubscribe } = usePushNotifications();
  
  const {
    profile,
    isLoading,
    isEditing,
    isSaving,
    toggleEditing,
    saveProfile,
  } = useMerchantProfile();

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
      {audioEnabled && (
        <AudioButton 
          textToRead={pageAudioText}
          className="fixed bottom-28 right-4 z-50"
          size="lg"
        />
      )}

      <UnifiedHeader
        title={t("my_profile")}
        showBack
        backTo="/marchand"
      />

      <main className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Section Profil - Mode lecture ou édition */}
        <Card className="card-institutional">
          <CardContent className="p-4">
            {isEditing ? (
              <ProfileEditForm
                profile={profile}
                onSave={saveProfile}
                onCancel={toggleEditing}
                isSaving={isSaving}
              />
            ) : (
              <ProfileHeader
                profile={profile}
                onEditClick={toggleEditing}
              />
            )}
          </CardContent>
        </Card>

        {/* Sélecteur de langue */}
        <Card className="card-institutional">
          <CardContent className="p-4">
            <h3 className="font-medium text-foreground mb-4">
              {t("choose_language")}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`p-3 rounded-lg text-left transition-all touch-manipulation border ${
                    language === lang.code
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted hover:bg-muted/80 border-transparent"
                  }`}
                >
                  <span className="text-xl mr-2">{lang.symbol}</span>
                  <span className="font-medium text-sm">{lang.nativeName}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Toggle Audio */}
        <Card className="card-institutional">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {audioEnabled ? (
                <Volume2 className="w-5 h-5 text-muted-foreground" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-foreground">Son et audio</p>
                <p className="text-sm text-muted-foreground">
                  {audioEnabled ? "Activé" : "Désactivé"}
                </p>
              </div>
            </div>
            <Switch
              checked={audioEnabled}
              onCheckedChange={setAudioEnabled}
            />
          </CardContent>
        </Card>

        {/* Toggle Notifications Push */}
        {isSupported && (
          <Card className="card-institutional">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className={`w-5 h-5 ${isSubscribed ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className="font-medium text-foreground">Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    {isSubscribed ? "Activées" : "Désactivées"}
                  </p>
                </div>
              </div>
              <Switch
                checked={isSubscribed}
                onCheckedChange={async (checked) => {
                  if (checked) {
                    await subscribe();
                  } else {
                    await unsubscribe();
                  }
                }}
                disabled={notifLoading}
              />
            </CardContent>
          </Card>
        )}

        {/* Logout Button */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Se déconnecter
        </Button>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          Plateforme IFN • ANSUT × DGE
        </p>
      </main>

      <UnifiedBottomNav items={merchantNavItems} />
    </div>
  );
}
