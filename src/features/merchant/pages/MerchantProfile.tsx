import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LogOut, Volume2, VolumeX, Loader2, Bell, Mic, DoorOpen, Phone, Shield, HelpCircle, ChevronRight, Package, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES } from "@/lib/translations";
import { AudioButton, EnhancedHeader, UnifiedBottomNav } from "@/shared/ui";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { merchantNavItems } from "@/config/navigation";
import { useMerchantProfile } from "@/features/merchant/hooks/useMerchantProfile";
import { ProfileEditForm } from "@/features/merchant/components/profile";
import { InclusiveProfileHeader } from "@/features/merchant/components/profile/InclusiveProfileHeader";
import { getProfileScript, type ProfileScriptKey } from "@/shared/config/audio/profileScripts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
      // Marquer comme joué pour éviter répétition
      setWelcomePlayed(true);
    }
  }, [profile, welcomePlayed, audioEnabled]);

  const handleAudioPlay = (key: string) => {
    // Placeholder pour lecture audio - sera connecté au TTS
    console.log('Audio:', getProfileScript(key as ProfileScriptKey));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/marchand/login");
  };

  const pageAudioText = getProfileScript('profile_welcome');

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

      <EnhancedHeader
        title={t("my_profile")}
        showBack
        backTo="/marchand"
        showNotifications={false}
      />

      <main className="p-4 space-y-5 max-w-lg mx-auto">
        {/* Section Profil - Mode lecture ou édition */}
        <Card className="card-institutional overflow-hidden">
          <CardContent className="p-4">
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
          </CardContent>
        </Card>

        {/* Sélecteur de langue - Cartes visuelles */}
        <Card className="card-institutional">
          <CardContent className="p-4">
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
                      ? "bg-primary text-primary-foreground border-primary shadow-lg"
                      : "bg-card hover:bg-muted/50 border-border/50"
                  }`}
                >
                  <span className="text-2xl block mb-1">{lang.symbol}</span>
                  <span className="font-medium text-sm">{lang.nativeName}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Toggles Son & Notifications - Pictogrammes XXL */}
        <Card className="card-institutional">
          <CardContent className="p-0">
            {/* Toggle Son */}
            <div className="toggle-row-inclusive border-b border-border/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  {audioEnabled ? (
                    <Volume2 className="w-6 h-6 text-blue-600" />
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
              <div className="toggle-row-inclusive">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isSubscribed ? 'bg-amber-100' : 'bg-muted'
                  }`}>
                    <Bell className={`w-6 h-6 ${isSubscribed ? 'text-amber-600' : 'text-muted-foreground'}`} />
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
          </CardContent>
        </Card>

        {/* Sections intégrées: Aide, CMU, KYC */}
        <Accordion 
          type="single" 
          collapsible 
          value={openSection}
          onValueChange={setOpenSection}
          className="space-y-2"
        >
          {/* Section Aide */}
          <AccordionItem value="aide" className="border rounded-xl bg-white overflow-hidden">
            <AccordionTrigger className="px-4 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-amber-600" />
                </div>
                <span className="font-semibold text-foreground">Aide & Tutoriels</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <HelpSectionContent />
            </AccordionContent>
          </AccordionItem>

          {/* Section CMU */}
          <AccordionItem value="cmu" className="border rounded-xl bg-white overflow-hidden">
            <AccordionTrigger className="px-4 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pnavim-secondary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-pnavim-secondary" />
                </div>
                <span className="font-semibold text-foreground">Ma Protection Santé (CMU)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <CMUSectionContent />
            </AccordionContent>
          </AccordionItem>

          {/* Section KYC */}
          <AccordionItem value="kyc" className="border rounded-xl bg-white overflow-hidden">
            <AccordionTrigger className="px-4 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-semibold text-foreground">Vérification Identité</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <KYCSectionContent />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Liens secondaires: Stock et Crédits */}
        <div className="space-y-2">
          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate("/marchand/stock")}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <span className="font-medium text-foreground">Mon Stock</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate("/marchand/credits")}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <span className="font-medium text-foreground">Mes Crédits Clients</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* Bouton Déconnexion */}
        <Button
          onClick={() => setShowLogoutDialog(true)}
          variant="outline"
          className="btn-logout-inclusive w-full h-14"
        >
          <DoorOpen className="w-5 h-5 mr-3" />
          Quitter
        </Button>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pt-2">
          Plateforme IFN • ANSUT × DGE
        </p>
      </main>

      {/* Dialog de confirmation déconnexion */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <DoorOpen className="w-6 h-6 text-muted-foreground" />
              Te déconnecter ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tu devras te reconnecter avec ton numéro de téléphone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSignOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Oui, quitter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UnifiedBottomNav items={merchantNavItems} />
    </div>
  );
}
