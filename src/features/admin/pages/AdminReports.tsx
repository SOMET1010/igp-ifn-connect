import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  Users,
  Wallet,
  Package,
  Loader2,
  CheckCircle,
  FileSpreadsheet,
  TrendingUp,
  Shield
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function AdminReports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [period, setPeriod] = useState("month");

  const reportTypes: ReportType[] = [
    {
      id: "transactions",
      name: "Rapport des Transactions",
      description: "Historique complet des transactions avec montants et types de paiement",
      icon: <Wallet className="w-6 h-6" />,
      color: "bg-primary/10 text-primary"
    },
    {
      id: "merchants",
      name: "Liste des Marchands",
      description: "Tous les marchands avec leur statut, activité et localisation",
      icon: <Users className="w-6 h-6" />,
      color: "bg-secondary/10 text-secondary"
    },
    {
      id: "cmu",
      name: "Synthèse CMU",
      description: "Cotisations CMU collectées et répartition par marchand",
      icon: <Shield className="w-6 h-6" />,
      color: "bg-destructive/10 text-destructive"
    },
    {
      id: "agents",
      name: "Performance Agents",
      description: "Statistiques d'enrôlement par agent et par zone",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "bg-accent/20 text-accent-foreground"
    },
    {
      id: "stocks",
      name: "État des Stocks",
      description: "Inventaire des stocks marchands avec alertes",
      icon: <Package className="w-6 h-6" />,
      color: "bg-muted text-muted-foreground"
    }
  ];

  const generateCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: "Aucune donnée",
        description: "Pas de données à exporter pour cette période",
        variant: "destructive"
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => 
        headers.map(h => {
          const val = row[h];
          const strVal = String(val ?? "");
          // Escape commas and quotes
          return strVal.includes(",") || strVal.includes('"') 
            ? `"${strVal.replace(/"/g, '""')}"` 
            : strVal;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast({
      title: "Rapport généré",
      description: `${filename}.csv téléchargé avec succès`
    });
  };

  const generateReport = async (reportId: string) => {
    setGeneratingReport(reportId);

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case "week": startDate.setDate(now.getDate() - 7); break;
      case "month": startDate.setMonth(now.getMonth() - 1); break;
      case "quarter": startDate.setMonth(now.getMonth() - 3); break;
      case "year": startDate.setFullYear(now.getFullYear() - 1); break;
    }

    try {
      switch (reportId) {
        case "transactions": {
          const { data } = await supabase
            .from("transactions")
            .select(`
              id,
              amount,
              transaction_type,
              cmu_deduction,
              rsti_deduction,
              created_at,
              reference
            `)
            .gte("created_at", startDate.toISOString())
            .order("created_at", { ascending: false });

          const formattedData = data?.map(t => ({
            Reference: t.reference || t.id.slice(0, 8),
            Montant: t.amount,
            Type: t.transaction_type,
            CMU: t.cmu_deduction || 0,
            RSTI: t.rsti_deduction || 0,
            Date: new Date(t.created_at).toLocaleString('fr-FR')
          })) || [];

          generateCSV(formattedData, "transactions");
          break;
        }

        case "merchants": {
          const { data } = await supabase
            .from("merchants")
            .select("id, full_name, phone, activity_type, status, cmu_number, created_at")
            .order("created_at", { ascending: false });

          const formattedData = data?.map(m => ({
            Nom: m.full_name,
            Telephone: m.phone,
            Activite: m.activity_type,
            Statut: m.status,
            CMU: m.cmu_number,
            Inscription: new Date(m.created_at).toLocaleDateString('fr-FR')
          })) || [];

          generateCSV(formattedData, "marchands");
          break;
        }

        case "cmu": {
          const { data: payments } = await supabase
            .from("cmu_payments")
            .select("amount, period_start, period_end, created_at, merchant_id")
            .gte("created_at", startDate.toISOString());

          const { data: transactions } = await supabase
            .from("transactions")
            .select("cmu_deduction, created_at")
            .gte("created_at", startDate.toISOString())
            .gt("cmu_deduction", 0);

          const totalFromTransactions = transactions?.reduce((s, t) => s + Number(t.cmu_deduction), 0) || 0;
          const totalFromPayments = payments?.reduce((s, p) => s + Number(p.amount), 0) || 0;

          const formattedData = [
            { Type: "Prélèvements sur transactions", Montant: totalFromTransactions, Nombre: transactions?.length || 0 },
            { Type: "Paiements directs", Montant: totalFromPayments, Nombre: payments?.length || 0 },
            { Type: "TOTAL", Montant: totalFromTransactions + totalFromPayments, Nombre: (transactions?.length || 0) + (payments?.length || 0) }
          ];

          generateCSV(formattedData, "synthese_cmu");
          break;
        }

        case "agents": {
          const { data } = await supabase
            .from("agents")
            .select("id, employee_id, organization, zone, total_enrollments, is_active, created_at");

          const formattedData = data?.map(a => ({
            Matricule: a.employee_id,
            Organisation: a.organization,
            Zone: a.zone || "Non définie",
            Enrolements: a.total_enrollments || 0,
            Statut: a.is_active ? "Actif" : "Inactif",
            Inscription: new Date(a.created_at).toLocaleDateString('fr-FR')
          })) || [];

          generateCSV(formattedData, "agents");
          break;
        }

        case "stocks": {
          const { data: stocksData } = await supabase
            .from("merchant_stocks")
            .select("quantity, min_threshold, unit_price, last_restocked_at, product_id");

          const productIds = stocksData?.map(s => s.product_id) || [];
          const { data: products } = await supabase
            .from("products")
            .select("id, name")
            .in("id", productIds);

          const formattedData = stocksData?.map(s => ({
            Produit: products?.find(p => p.id === s.product_id)?.name || "Inconnu",
            Quantite: s.quantity,
            Seuil_Alerte: s.min_threshold || 5,
            Prix_Unitaire: s.unit_price || 0,
            Alerte: Number(s.quantity) <= Number(s.min_threshold || 5) ? "OUI" : "NON",
            Dernier_Restock: s.last_restocked_at ? new Date(s.last_restocked_at).toLocaleDateString('fr-FR') : "N/A"
          })) || [];

          generateCSV(formattedData, "stocks");
          break;
        }
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport",
        variant: "destructive"
      });
    }

    setGeneratingReport(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-sidebar text-sidebar-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Rapports</h1>
            <p className="text-sm text-sidebar-foreground/70">Générez et exportez vos données</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Period Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Période</p>
                  <p className="text-sm text-muted-foreground">Sélectionnez la période pour les rapports</p>
                </div>
              </div>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">7 derniers jours</SelectItem>
                  <SelectItem value="month">30 derniers jours</SelectItem>
                  <SelectItem value="quarter">3 derniers mois</SelectItem>
                  <SelectItem value="year">12 derniers mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Report Types */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Types de rapports
          </h2>

          {reportTypes.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${report.color}`}>
                    {report.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground">{report.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">
                        <FileSpreadsheet className="w-3 h-3 mr-1" /> CSV
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => generateReport(report.id)}
                    disabled={generatingReport === report.id}
                    className="shrink-0"
                  >
                    {generatingReport === report.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Exporter
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-secondary" />
              Conseils d'utilisation
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Les rapports sont générés au format CSV, compatible avec Excel</li>
              <li>• Sélectionnez la période avant de générer un rapport</li>
              <li>• Les données sont exportées en temps réel depuis la base de données</li>
              <li>• Utilisez les rapports pour vos bilans mensuels et rapports à la hiérarchie</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
