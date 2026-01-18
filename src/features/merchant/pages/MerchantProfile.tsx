import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Volume2, VolumeX, Loader2, Bell, DoorOpen, Shield, HelpCircle, Package, CreditCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES } from "@/lib/translations";
import { usePushNotifications } from "@/shared/hooks";
import { MERCHANT_NAV_ITEMS } from "@/config/navigation-julaba";
import { useMerchantProfile } from "@/features/merchant/hooks/useMerchantProfile";
import { ProfileEditForm } from "@/features/merchant/components/profile";
import { InclusiveProfileHeader } from "@/features/merchant/components/profile/InclusiveProfileHeader";
import { getProfileScript, type ProfileScriptKey } from "@/shared/config/audio/profileScripts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Jùlaba Design System
import {
  JulabaPageLayout,
  JulabaHeader,
  JulabaBottomNav,
  JulabaCard,
  JulabaButton,
  JulabaListItem,
  JulabaDialog,
} from "@/shared/ui/julaba";

// Sous-composants des sections fusionnées
import { HelpSectionContent } from "./components/HelpSectionContent";
import { CMUSectionContent } from "./components/CMUSectionContent";
import { KYCSectionContent } from "./components/KYCSectionContent";

export default function MerchantProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { isSupported, isSubscribed, isLoading: notifLoading, subscribe, unsubscribe } = usePushNotifications();
  
  // Section ouverte depuis URL
  const initialSection = searchParams.get("section") || "";
  const [openSection, setOpenSection] = useState<string>(initialSection);
  
  const {
    profile,
    isLoading,
    isEditing,
    isSaving,
    toggleEditing,
    saveProfile,
  } = useMerchantProfile();

  // Auto-play audio d'accueil au chargement
  const [welcomePlayed, setWelcomePlayed] = useState(false);
  
  useEffect(() => {
    if (profile && !welcomePlayed && audioEnabled) {
      setWelcomePlayed(true);
    }
  }, [profile, welcomePlayed, audioEnabled]);

  const handleAudioPlay = (key: string) => {
    console.log('Audio:', getProfileScript(key as ProfileScriptKey));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/marchand/login");
  };

  if (isLoading) {
    return (
      <JulabaPageLayout className="flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[hsl(30_100%_60%)]" />
      </JulabaPageLayout>
    );
  }

  return (
    <JulabaPageLayout>
      <JulabaHeader
        title="Mon Profil"
        subtitle="Mes infos & paramètres"
        showBack
        backPath="/marchand"
      />

      <main className="px-4 py-4 space-y-5">
        {/* Section Profil - Mode lecture ou édition */}
        <JulabaCard className="overflow-hidden">
          {isEditing ? (
            <ProfileEditForm
              profile={profile}
              onSave={saveProfile}
              onCancel={toggleEditing}
              isSaving={isSaving}
            />
          ) : (
            <InclusiveProfileHeader
              profile={profile}
              onEditClick={toggleEditing}
              onAudioPlay={handleAudioPlay}
            />
          )}
        </JulabaCard>

        {/* Sélecteur de langue - Cartes visuelles */}
        <JulabaCard>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🌍</span>
            <h3 className="font-semibold text-foreground">
              {t("choose_language")}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  handleAudioPlay('profile_language');
                }}
                className={`p-4 rounded-xl text-center transition-all touch-manipulation border-2 ${
                  language === lang.code
                    ? "bg-[hsl(30_100%_60%)] text-white border-[hsl(30_100%_60%)] shadow-lg"
                    : "bg-white hover:bg-[hsl(30_100%_97%)] border-[hsl(30_20%_90%)]"
                }`}
              >
                <span className="text-2xl block mb-1">{lang.symbol}</span>
                <span className="font-medium text-sm">{lang.nativeName}</span>
              </button>
            ))}
          </div>
        </JulabaCard>

        {/* Toggles Son & Notifications */}
        <JulabaCard padding="none">
          {/* Toggle Son */}
          <div className="flex items-center justify-between p-4 border-b border-[hsl(30_20%_92%)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[hsl(210_100%_92%)] flex items-center justify-center">
                {audioEnabled ? (
                  <Volume2 className="w-6 h-6 text-[hsl(210_100%_45%)]" />
                ) : (
                  <VolumeX className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground">Son</p>
                <p className="text-sm text-muted-foreground">
                  {audioEnabled ? "Activé" : "Désactivé"}
                </p>
              </div>
            </div>
            <Switch
              checked={audioEnabled}
              onCheckedChange={(checked) => {
                setAudioEnabled(checked);
                handleAudioPlay(checked ? 'profile_sound_on' : 'profile_sound_off');
              }}
            />
          </div>

          {/* Toggle Notifications */}
          {isSupported && (
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isSubscribed ? 'bg-[hsl(45_100%_90%)]' : 'bg-[hsl(30_20%_92%)]'
                }`}>
                  <Bell className={`w-6 h-6 ${isSubscribed ? 'text-[hsl(45_100%_40%)]' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Notifications</p>
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
                    handleAudioPlay('profile_notif_on');
                  } else {
                    await unsubscribe();
                    handleAudioPlay('profile_notif_off');
                  }
                }}
                disabled={notifLoading}
              />
            </div>
          )}
        </JulabaCard>

        {/* Sections intégrées: Aide, CMU, KYC */}
        <Accordion 
          type="single" 
          collapsible 
          value={openSection}
          onValueChange={setOpenSection}
          className="space-y-2"
        >
          {/* Section Aide */}
          <AccordionItem value="aide" className="border-0">
            <JulabaCard padding="none" className="overflow-hidden">
              <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-[hsl(30_50%_97%)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[hsl(45_100%_90%)] flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-[hsl(45_100%_40%)]" />
                  </div>
                  <span className="font-semibold text-foreground">Aide & Tutoriels</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <HelpSectionContent />
              </AccordionContent>
            </JulabaCard>
          </AccordionItem>

          {/* Section CMU */}
          <AccordionItem value="cmu" className="border-0">
            <JulabaCard padding="none" className="overflow-hidden">
              <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-[hsl(30_50%_97%)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[hsl(145_70%_92%)] flex items-center justify-center">
                    <Shield className="w-6 h-6 text-[hsl(145_74%_42%)]" />
                  </div>
                  <span className="font-semibold text-foreground">Ma Protection Santé</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <CMUSectionContent />
              </AccordionContent>
            </JulabaCard>
          </AccordionItem>

          {/* Section KYC */}
          <AccordionItem value="kyc" className="border-0">
            <JulabaCard padding="none" className="overflow-hidden">
              <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-[hsl(30_50%_97%)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[hsl(210_100%_92%)] flex items-center justify-center">
                    <Shield className="w-6 h-6 text-[hsl(210_100%_45%)]" />
                  </div>
                  <span className="font-semibold text-foreground">Ma carte</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <KYCSectionContent />
              </AccordionContent>
            </JulabaCard>
          </AccordionItem>
        </Accordion>

        {/* Liens secondaires: Stock et Crédits */}
        <div className="space-y-2">
          <JulabaListItem
            emoji="📦"
            title="Ma marchandise"
            subtitle="Gérer mon stock"
            onClick={() => navigate("/marchand/stock")}
          />
          <JulabaListItem
            emoji="💸"
            title="Qui me doit"
            subtitle="Mes clients à crédit"
            onClick={() => navigate("/marchand/credits")}
          />
        </div>

        {/* Bouton Déconnexion */}
        <JulabaButton
          variant="outline"
          size="lg"
          onClick={() => setShowLogoutDialog(true)}
          className="w-full"
        >
          <DoorOpen className="w-5 h-5 mr-3" />
          Quitter
        </JulabaButton>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pt-2">
          Plateforme IFN • ANSUT × DGE
        </p>
      </main>

      {/* Dialog de confirmation déconnexion */}
      <JulabaDialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        emoji="🚪"
        title="Te déconnecter ?"
        description="Tu devras te reconnecter avec ton numéro de téléphone."
        primaryAction={{
          label: "Oui, quitter",
          emoji: "👋",
          variant: "danger",
          onClick: handleSignOut,
        }}
        secondaryAction={{
          label: "Annuler",
          onClick: () => setShowLogoutDialog(false),
        }}
      />

      <JulabaBottomNav items={MERCHANT_NAV_ITEMS} />
    </JulabaPageLayout>
  );
}
