/**
 * Page Historique Transactions - /marchand/transactions
 * Refactorisée avec Design System Jùlaba
 */

import { useNavigate } from "react-router-dom";
import { Loader2, FileDown, Calendar } from "lucide-react";
import { useLanguage } from "@/shared/contexts";
import { useOnlineStatus } from "@/shared/hooks";
import { format } from "date-fns";
import { AudioButton } from "@/shared/ui";
import { 
  JulabaPageLayout,
  JulabaHeader,
  JulabaCard,
  JulabaButton,
  JulabaListItem,
  JulabaEmptyState,
  JulabaBottomNav,
} from "@/shared/ui/julaba";
import { MERCHANT_NAV_ITEMS } from "@/config/navigation-julaba";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactions, type ExportPeriod } from "@/features/merchant/hooks/useTransactions";

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
      <JulabaPageLayout background="warm" className="flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </JulabaPageLayout>
    );
  }

  return (
    <JulabaPageLayout background="warm" className="pb-24">
      <AudioButton 
        textToRead={pageAudioText}
        className="fixed bottom-28 right-4 z-50"
        size="lg"
      />

      <JulabaHeader
        title="📊 Mes Ventes"
        backPath="/marchand"
      />

      <main className="p-4 space-y-5 max-w-lg mx-auto">
        {/* Online status */}
        {!isOnline && (
          <JulabaCard accent="orange" className="text-center py-3">
            <span className="text-sm">📴 Mode hors ligne - Données en cache</span>
          </JulabaCard>
        )}

        {/* Export PDF Section */}
        {totalCount > 0 && (
          <JulabaCard>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📥</span>
              <span className="font-bold text-foreground">Exporter rapport PDF</span>
            </div>
            <div className="flex gap-3">
              <Select 
                value={exportPeriod} 
                onValueChange={(v) => setExportPeriod(v as ExportPeriod)}
              >
                <SelectTrigger className="flex-1 h-12 rounded-xl">
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
              <JulabaButton 
                variant="primary"
                emoji="📥"
                onClick={exportToPDF}
                isLoading={isExporting}
              />
            </div>
          </JulabaCard>
        )}

        {/* Empty State */}
        {totalCount === 0 ? (
          <JulabaEmptyState
            emoji="📜"
            title="Pas encore de ventes"
            description="Tes ventes apparaîtront ici"
            action={{
              label: "Encaisser maintenant",
              onClick: () => navigate("/marchand/encaisser"),
            }}
          />
        ) : (
          <>
            {/* Grouped Transactions */}
            {groupedTransactions.map((group) => (
              <div key={group.label}>
                <h2 className="text-lg font-bold text-foreground mb-3 capitalize flex items-center gap-2">
                  <span>📅</span> {group.label}
                </h2>
                <div className="space-y-2">
                  {group.transactions.map((tx) => (
                    <JulabaListItem
                      key={tx.id}
                      emoji={tx.transaction_type === "cash" ? "💵" : "📱"}
                      title={`${Number(tx.amount).toLocaleString()} FCFA`}
                      subtitle={tx.transaction_type === "cash" ? "Espèces" : "Mobile Money"}
                      value={format(new Date(tx.created_at), "HH:mm")}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <JulabaButton 
                variant="secondary" 
                emoji="⬇️"
                onClick={loadMore} 
                className="w-full"
              >
                Voir plus
              </JulabaButton>
            )}
          </>
        )}
      </main>

      <JulabaBottomNav items={MERCHANT_NAV_ITEMS} />
    </JulabaPageLayout>
  );
}
