import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Banknote, Smartphone, ChevronDown, FileDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isYesterday, startOfWeek, startOfMonth, subDays, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { AudioButton } from "@/components/shared/AudioButton";
import { CardLarge, ButtonSecondary, StatusBanner, BottomNavIFN } from "@/components/ifn";
import { exportSalesReportToPDF } from "@/lib/pdfExport";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Transaction {
  id: string;
  amount: number;
  transaction_type: "cash" | "mobile_money" | "transfer";
  created_at: string;
  reference: string | null;
  cmu_deduction: number | null;
  rsti_deduction: number | null;
}

interface GroupedTransactions {
  label: string;
  transactions: Transaction[];
}

export default function MerchantTransactions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isExporting, setIsExporting] = useState(false);
  const [exportPeriod, setExportPeriod] = useState<string>("week");
  const [merchantName, setMerchantName] = useState<string>("");

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      setIsLoading(true);

      const { data: merchantData } = await supabase
        .from("merchants")
        .select("id, full_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!merchantData) {
        setIsLoading(false);
        return;
      }

      setMerchantName(merchantData.full_name);

      const { data } = await supabase
        .from("transactions")
        .select("id, amount, transaction_type, created_at, reference, cmu_deduction, rsti_deduction")
        .eq("merchant_id", merchantData.id)
        .order("created_at", { ascending: false })
        .limit(100);

      setTransactions((data as Transaction[]) || []);
      setIsLoading(false);
    };

    fetchTransactions();
  }, [user]);

  // Group transactions by day
  const groupedTransactions: GroupedTransactions[] = [];
  const grouped: Record<string, Transaction[]> = {};

  transactions.slice(0, visibleCount).forEach((tx) => {
    const date = new Date(tx.created_at);
    let label = "";
    
    if (isToday(date)) {
      label = "Aujourd'hui";
    } else if (isYesterday(date)) {
      label = "Hier";
    } else {
      label = format(date, "EEEE d MMMM", { locale: fr });
    }

    if (!grouped[label]) {
      grouped[label] = [];
    }
    grouped[label].push(tx);
  });

  Object.entries(grouped).forEach(([label, txs]) => {
    groupedTransactions.push({ label, transactions: txs });
  });

  // Export PDF handler
  const handleExportPDF = async () => {
    if (transactions.length === 0) {
      toast.error("Aucune transaction à exporter");
      return;
    }

    setIsExporting(true);
    try {
      const now = new Date();
      let startDate: Date;
      let endDate = now;

      switch (exportPeriod) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date();
          break;
        case "week":
          startDate = startOfWeek(now, { weekStartsOn: 1 });
          break;
        case "month":
          startDate = startOfMonth(now);
          break;
        case "last30":
          startDate = subDays(now, 30);
          break;
        case "last3months":
          startDate = subMonths(now, 3);
          break;
        default:
          startDate = startOfWeek(now, { weekStartsOn: 1 });
      }

      // Filter transactions by period
      const filteredTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.created_at);
        return txDate >= startDate && txDate <= endDate;
      });

      if (filteredTransactions.length === 0) {
        toast.error("Aucune transaction pour cette période");
        setIsExporting(false);
        return;
      }

      // Calculate summary
      const totalSales = filteredTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
      const totalCmuDeductions = filteredTransactions.reduce((sum, tx) => sum + (Number(tx.cmu_deduction) || 0), 0);
      const totalRstiDeductions = filteredTransactions.reduce((sum, tx) => sum + (Number(tx.rsti_deduction) || 0), 0);

      await exportSalesReportToPDF(
        merchantName,
        { start: startDate, end: endDate },
        filteredTransactions.map(tx => ({
          reference: tx.reference || tx.id,
          date: format(new Date(tx.created_at), "dd/MM/yy HH:mm"),
          amount: Number(tx.amount),
          paymentMethod: tx.transaction_type,
          cmuDeduction: Number(tx.cmu_deduction) || 0,
          rstiDeduction: Number(tx.rsti_deduction) || 0,
        })),
        {
          totalSales,
          totalTransactions: filteredTransactions.length,
          totalCmuDeductions,
          totalRstiDeductions,
          netAmount: totalSales - totalCmuDeductions - totalRstiDeductions,
        }
      );

      toast.success("Rapport PDF téléchargé !");
    } catch (error) {
      console.error("Erreur export PDF:", error);
      toast.error("Impossible de créer le rapport");
    } finally {
      setIsExporting(false);
    }
  };

  const pageAudioText = `${t("your_sales")}. ${transactions.length} ventes.`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Floating Audio Button */}
      <AudioButton 
        textToRead={pageAudioText}
        className="fixed bottom-28 right-4 z-50"
        size="lg"
      />

      {/* Header */}
      <header className="bg-secondary text-secondary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/marchand")}
            className="text-secondary-foreground hover:bg-secondary-foreground/10 h-12 w-12"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{t("your_sales")}</h1>
            <p className="text-sm opacity-80">
              {transactions.length} vente{transactions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Export PDF Section */}
        {transactions.length > 0 && (
          <CardLarge className="space-y-4">
            <div className="flex items-center gap-2">
              <FileDown className="w-5 h-5 text-primary" />
              <span className="font-bold text-foreground">Exporter rapport PDF</span>
            </div>
            <div className="flex gap-3">
              <Select value={exportPeriod} onValueChange={setExportPeriod}>
                <SelectTrigger className="flex-1 h-12">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="last30">30 derniers jours</SelectItem>
                  <SelectItem value="last3months">3 derniers mois</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="h-12 px-6"
              >
                {isExporting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileDown className="w-5 h-5" />
                )}
              </Button>
            </div>
          </CardLarge>
        )}

        {transactions.length === 0 ? (
          <CardLarge className="text-center py-12">
            <div className="text-6xl mb-4">📜</div>
            <p className="text-xl text-muted-foreground">
              Pas encore de ventes
            </p>
            <ButtonSecondary
              onClick={() => navigate("/marchand/encaisser")}
              className="mt-6"
            >
              <Banknote className="w-6 h-6 mr-2" />
              {t("collect_payment")}
            </ButtonSecondary>
          </CardLarge>
        ) : (
          <>
            {groupedTransactions.map((group) => (
              <div key={group.label}>
                <h2 className="text-lg font-bold text-foreground mb-3 capitalize">
                  {group.label}
                </h2>
                <div className="space-y-3">
                  {group.transactions.map((tx) => (
                    <CardLarge 
                      key={tx.id} 
                      className="flex items-center gap-4 py-4"
                    >
                      {/* Icône type */}
                      <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center">
                        {tx.transaction_type === "cash" ? (
                          <Banknote className="w-7 h-7 text-[hsl(142,76%,36%)]" />
                        ) : (
                          <Smartphone className="w-7 h-7 text-secondary" />
                        )}
                      </div>
                      
                      {/* Montant + heure */}
                      <div className="flex-1">
                        <p className="text-2xl font-black text-foreground">
                          {Number(tx.amount).toLocaleString()} <span className="text-base font-bold">FCFA</span>
                        </p>
                        <p className="text-muted-foreground">
                          {tx.transaction_type === "cash" ? "💵 Espèces" : "📱 Mobile Money"}
                        </p>
                      </div>
                      
                      {/* Heure */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-muted-foreground">
                          {format(new Date(tx.created_at), "HH:mm")}
                        </p>
                      </div>
                    </CardLarge>
                  ))}
                </div>
              </div>
            ))}

            {/* Voir plus */}
            {visibleCount < transactions.length && (
              <ButtonSecondary
                onClick={() => setVisibleCount(visibleCount + 10)}
                className="mt-4"
              >
                <ChevronDown className="w-5 h-5 mr-2" />
                {t("view_more")}
              </ButtonSecondary>
            )}
          </>
        )}

        {/* Status Banner */}
        <StatusBanner isOnline={isOnline} />
      </main>

      <BottomNavIFN />
    </div>
  );
}
