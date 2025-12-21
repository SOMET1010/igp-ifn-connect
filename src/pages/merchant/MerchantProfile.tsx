import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Phone, MapPin, Store, CreditCard, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/shared/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Home, Wallet, Heart, User } from "lucide-react";

const navItems = [
  { icon: Home, label: "Accueil", href: "/marchand" },
  { icon: Wallet, label: "Encaisser", href: "/marchand/encaisser" },
  { icon: Heart, label: "CMU", href: "/marchand/cmu" },
  { icon: User, label: "Profil", href: "/marchand/profil" },
];

interface ProfileData {
  full_name: string;
  phone: string;
  cmu_number: string;
  activity_type: string;
  rsti_balance: number;
  market_name?: string;
}

export default function MerchantProfile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data: merchantData } = await supabase
        .from("merchants")
        .select(`
          full_name,
          phone,
          cmu_number,
          activity_type,
          rsti_balance,
          market_id
        `)
        .eq("user_id", user.id)
        .single();

      if (merchantData) {
        let marketName = "";
        if (merchantData.market_id) {
          const { data: market } = await supabase
            .from("markets")
            .select("name")
            .eq("id", merchantData.market_id)
            .single();
          marketName = market?.name || "";
        }

        setProfile({
          ...merchantData,
          market_name: marketName,
        });
      }

      setIsLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/marchand/login");
  };

  const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
    <div className="flex items-center gap-4 py-4 border-b border-border last:border-0">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value || "—"}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-forest text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/marchand")}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Mon Profil</h1>
        </div>
      </header>

      <main className="p-4 space-y-5">
        {/* Avatar et nom */}
        <div className="text-center py-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-secondary/10 flex items-center justify-center text-5xl mb-4">
            💵
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {profile?.full_name || "Marchand"}
          </h2>
          <p className="text-muted-foreground">{profile?.activity_type || "Commerce"}</p>
        </div>

        {/* Infos principales */}
        <Card>
          <CardContent className="p-4">
            <InfoRow 
              icon={Phone} 
              label="Téléphone" 
              value={profile?.phone ? `+225 ${profile.phone}` : ""} 
            />
            <InfoRow 
              icon={CreditCard} 
              label="Numéro CMU" 
              value={profile?.cmu_number || ""} 
            />
            <InfoRow 
              icon={Store} 
              label="Type d'activité" 
              value={profile?.activity_type || ""} 
            />
            <InfoRow 
              icon={MapPin} 
              label="Marché" 
              value={profile?.market_name || ""} 
            />
          </CardContent>
        </Card>

        {/* Solde RSTI */}
        <Card className="bg-secondary/5 border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Solde RSTI</p>
                <p className="text-3xl font-bold text-secondary">
                  {(profile?.rsti_balance || 0).toLocaleString()} <span className="text-lg">FCFA</span>
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center">
                <Wallet className="w-7 h-7 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-2">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate("/marchand/cmu")}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
                <span className="font-medium text-foreground">Ma protection CMU</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* Déconnexion */}
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="w-full h-14 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/5"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Se déconnecter
        </Button>

        {/* Footer info */}
        <p className="text-center text-xs text-muted-foreground">
          🇨🇮 Plateforme IGP & IFN
        </p>
      </main>

      <BottomNav items={navItems} />
    </div>
  );
}
