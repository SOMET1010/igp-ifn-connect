import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomNav } from "@/components/shared/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Home,
  Package,
  Wallet,
  User,
  ArrowLeft,
  Plus,
  Percent,
  Gift,
  Calendar,
  Tag,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Trash2,
  TrendingUp
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const navItems = [
  { icon: Home, label: "Accueil", href: "/marchand" },
  { icon: Package, label: "Stock", href: "/marchand/stock" },
  { icon: Wallet, label: "Encaisser", href: "/marchand/encaisser" },
  { icon: User, label: "Profil", href: "/marchand/profil" },
];

interface Promotion {
  id: string;
  name: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_purchase: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
}

export default function MerchantPromotions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");

  const [newPromo, setNewPromo] = useState({
    name: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_purchase: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: ""
  });

  useEffect(() => {
    fetchPromotions();
  }, [user]);

  const fetchPromotions = async () => {
    if (!user) return;

    const { data: merchant } = await supabase
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (merchant) {
      setMerchantId(merchant.id);

      const { data: promosData } = await supabase
        .from("promotions")
        .select("*")
        .eq("merchant_id", merchant.id)
        .order("created_at", { ascending: false });

      if (promosData) {
        setPromotions(promosData);
      }
    }
    setIsLoading(false);
  };

  const handleAddPromo = async () => {
    if (!merchantId || !newPromo.name || !newPromo.discount_value || !newPromo.end_date) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase.from("promotions").insert({
      merchant_id: merchantId,
      name: newPromo.name,
      description: newPromo.description || null,
      discount_type: newPromo.discount_type,
      discount_value: parseFloat(newPromo.discount_value),
      min_purchase: newPromo.min_purchase ? parseFloat(newPromo.min_purchase) : null,
      start_date: newPromo.start_date,
      end_date: newPromo.end_date,
      is_active: true
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la promotion",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Succès",
        description: "Promotion créée avec succès"
      });
      setNewPromo({
        name: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        min_purchase: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: ""
      });
      setIsAddDialogOpen(false);
      fetchPromotions();
    }
  };

  const togglePromo = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("promotions")
      .update({ is_active: !currentState })
      .eq("id", id);

    if (!error) {
      fetchPromotions();
      toast({
        title: currentState ? "Promotion désactivée" : "Promotion activée"
      });
    }
  };

  const deletePromo = async (id: string) => {
    const { error } = await supabase
      .from("promotions")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchPromotions();
      toast({
        title: "Promotion supprimée"
      });
    }
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();
  const isUpcoming = (startDate: string) => new Date(startDate) > new Date();

  const filteredPromos = promotions.filter(promo => {
    switch (filter) {
      case "active": return promo.is_active && !isExpired(promo.end_date);
      case "expired": return isExpired(promo.end_date);
      default: return true;
    }
  });

  const activeCount = promotions.filter(p => p.is_active && !isExpired(p.end_date)).length;
  const totalUsage = promotions.reduce((sum, p) => sum + p.usage_count, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-gradient-africa text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => navigate("/marchand")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Promotions</h1>
            <p className="text-sm text-primary-foreground/80">Gérez vos offres</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-secondary/10 border-secondary/20">
            <CardContent className="p-4 text-center">
              <Gift className="w-6 h-6 mx-auto text-secondary mb-1" />
              <p className="text-2xl font-bold text-secondary">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Actives</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold text-primary">{totalUsage}</p>
              <p className="text-xs text-muted-foreground">Utilisations</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-14 text-lg font-semibold rounded-xl shadow-africa">
              <Plus className="w-5 h-5 mr-2" /> Nouvelle promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une promotion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-sm font-medium">Nom de la promotion *</Label>
                <Input
                  placeholder="Ex: Soldes de fin d'année"
                  value={newPromo.name}
                  onChange={(e) => setNewPromo({...newPromo, name: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  placeholder="Décrivez votre offre..."
                  value={newPromo.description}
                  onChange={(e) => setNewPromo({...newPromo, description: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Type de réduction</Label>
                <Select
                  value={newPromo.discount_type}
                  onValueChange={(v) => setNewPromo({...newPromo, discount_type: v})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                    <SelectItem value="fixed">Montant fixe (FCFA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">
                  Valeur de la réduction *
                  {newPromo.discount_type === "percentage" ? " (%)" : " (FCFA)"}
                </Label>
                <Input
                  type="number"
                  placeholder={newPromo.discount_type === "percentage" ? "10" : "500"}
                  value={newPromo.discount_value}
                  onChange={(e) => setNewPromo({...newPromo, discount_value: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Achat minimum (FCFA)</Label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={newPromo.min_purchase}
                  onChange={(e) => setNewPromo({...newPromo, min_purchase: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Date début</Label>
                  <Input
                    type="date"
                    value={newPromo.start_date}
                    onChange={(e) => setNewPromo({...newPromo, start_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Date fin *</Label>
                  <Input
                    type="date"
                    value={newPromo.end_date}
                    onChange={(e) => setNewPromo({...newPromo, end_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button onClick={handleAddPromo} className="w-full h-12 text-lg">
                Créer la promotion
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: "all", label: "Toutes" },
            { key: "active", label: "Actives" },
            { key: "expired", label: "Expirées" }
          ].map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              className="rounded-full whitespace-nowrap"
              onClick={() => setFilter(f.key as typeof filter)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Promotions List */}
        <div className="space-y-3">
          {filteredPromos.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="p-8 text-center">
                <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Aucune promotion</p>
              </CardContent>
            </Card>
          ) : (
            filteredPromos.map((promo) => (
              <Card 
                key={promo.id} 
                className={`hover:shadow-lg transition-all ${!promo.is_active || isExpired(promo.end_date) ? 'opacity-60' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        promo.discount_type === 'percentage' ? 'bg-accent/20' : 'bg-primary/20'
                      }`}>
                        {promo.discount_type === 'percentage' ? (
                          <Percent className="w-6 h-6 text-accent-foreground" />
                        ) : (
                          <Tag className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{promo.name}</h3>
                        <p className="text-lg font-bold text-primary">
                          {promo.discount_type === 'percentage' ? (
                            `-${promo.discount_value}%`
                          ) : (
                            `-${promo.discount_value.toLocaleString()} FCFA`
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {isExpired(promo.end_date) ? (
                        <Badge variant="destructive">Expirée</Badge>
                      ) : isUpcoming(promo.start_date) ? (
                        <Badge variant="outline">À venir</Badge>
                      ) : promo.is_active ? (
                        <Badge className="bg-secondary text-secondary-foreground">Active</Badge>
                      ) : (
                        <Badge variant="outline">Désactivée</Badge>
                      )}
                    </div>
                  </div>

                  {promo.description && (
                    <p className="text-sm text-muted-foreground mb-3">{promo.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(promo.start_date).toLocaleDateString('fr-FR')} - {new Date(promo.end_date).toLocaleDateString('fr-FR')}
                    </span>
                    {promo.min_purchase && (
                      <span>Min: {promo.min_purchase.toLocaleString()} FCFA</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                      {promo.usage_count} utilisation{promo.usage_count !== 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-2">
                      {!isExpired(promo.end_date) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePromo(promo.id, promo.is_active)}
                        >
                          {promo.is_active ? (
                            <ToggleRight className="w-5 h-5 text-secondary" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deletePromo(promo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <BottomNav items={navItems} />
    </div>
  );
}
