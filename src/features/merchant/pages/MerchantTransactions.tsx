import { useNavigate } from "react-router-dom";
import { Loader2, Banknote, Smartphone, ChevronDown, FileDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/shared/contexts";
import { useOnlineStatus } from "@/shared/hooks";
import { format } from "date-fns";
import { AudioButton, EnhancedHeader, UnifiedBottomNav } from "@/shared/ui";
import { CardLarge, ButtonSecondary, StatusBanner } from "@/shared/ui/ifn";
import { merchantNavItems } from "@/config/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactions, type ExportPeriod } from "@/features/merchant/hooks/useTransactions";

// ============================================
// Composant MerchantTransactions (UI pure)
// ============================================
export default function MerchantTransactions() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isOnline } = useOnlineStatus();

  const {
    groupedTransactions,
    isLoading,
    isExporting,
    hasMore,
    totalCount,
    exportPeriod,
    setExportPeriod,
    loadMore,
    exportToPDF,
  } = useTransactions();

  const pageAudioText = `${t("your_sales")}. ${totalCount} ventes.`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <AudioButton 
        textToRead={pageAudioText}
        className="fixed bottom-28 right-4 z-50"
        size="lg"
      />

      <EnhancedHeader
        title={t("your_sales")}
        subtitle={`${totalCount} vente${totalCount !== 1 ? "s" : ""}`}
        showBack
        backTo="/marchand"
        showNotifications={false}
      />

      <main className="p-4 space-y-6">
        {/* Export PDF Section */}
        {totalCount > 0 && (
          <CardLarge className="space-y-4">
            <div className="flex items-center gap-2">
              <FileDown className="w-5 h-5 text-primary" />
              <span className="font-bold text-foreground">Exporter rapport PDF</span>
            </div>
            <div className="flex gap-3">
              <Select 
                value={exportPeriod} 
                onValueChange={(v) => setExportPeriod(v as ExportPeriod)}
              >
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
                onClick={exportToPDF}
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

        {/* Empty State */}
        {totalCount === 0 ? (
          <CardLarge className="text-center py-12">
            <div className="text-6xl mb-4">📜</div>
            <p className="text-xl text-muted-foreground">Pas encore de ventes</p>
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
            {/* Grouped Transactions */}
            {groupedTransactions.map((group) => (
              <div key={group.label}>
                <h2 className="text-lg font-bold text-foreground mb-3 capitalize">
                  {group.label}
                </h2>
                <div className="space-y-3">
                  {group.transactions.map((tx) => (
                    <CardLarge key={tx.id} className="flex items-center gap-4 py-4">
                      <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center">
                        {tx.transaction_type === "cash" ? (
                          <Banknote className="w-7 h-7 text-[hsl(142,76%,36%)]" />
                        ) : (
                          <Smartphone className="w-7 h-7 text-secondary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-2xl font-black text-foreground">
                          {Number(tx.amount).toLocaleString()}{" "}
                          <span className="text-base font-bold">FCFA</span>
                        </p>
                        <p className="text-muted-foreground">
                          {tx.transaction_type === "cash" ? "💵 Espèces" : "📱 Mobile Money"}
                        </p>
                      </div>
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

            {/* Load More */}
            {hasMore && (
              <ButtonSecondary onClick={loadMore} className="mt-4">
                <ChevronDown className="w-5 h-5 mr-2" />
                {t("view_more")}
              </ButtonSecondary>
            )}
          </>
        )}

        <StatusBanner isOnline={isOnline} />
      </main>

      <UnifiedBottomNav items={merchantNavItems} />
    </div>
  );
}
