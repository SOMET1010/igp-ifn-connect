import { Sun, Moon, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "../../utils/cashierCalculations";
import type { DailySession, SessionStatus } from "../../types/dailySession.types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DaySessionBannerProps {
  sessionStatus: SessionStatus;
  session: DailySession | null;
  onOpenDay: () => void;
  onCloseDay: () => void;
  className?: string;
}

export function DaySessionBanner({
  sessionStatus,
  session,
  onOpenDay,
  onCloseDay,
  className,
}: DaySessionBannerProps) {
  // Pas de session aujourd'hui
  if (sessionStatus === "none") {
    return (
      <div className={cn(
        "rounded-2xl p-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800",
        className
      )}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-amber-200 dark:bg-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-700 dark:text-amber-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">
              Journée non ouverte
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Ouvrez votre journée pour commencer à encaisser
            </p>
          </div>
        </div>
        <Button
          onClick={onOpenDay}
          className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Sun className="w-4 h-4 mr-2" />
          Ouvrir ma journée
        </Button>
      </div>
    );
  }

  // Session ouverte
  if (sessionStatus === "open" && session) {
    const openedAt = new Date(session.opened_at);
    const openingCash = Number(session.opening_cash) || 0;

    return (
      <div className={cn(
        "rounded-2xl p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800",
        className
      )}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-green-200 dark:bg-green-800">
            <Sun className="w-5 h-5 text-green-700 dark:text-green-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              Journée ouverte
            </h3>
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300 mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Depuis {format(openedAt, "HH:mm", { locale: fr })}
              </span>
              <span className="text-green-600 dark:text-green-400">•</span>
              <span>Fond: {formatCurrency(openingCash)} FCFA</span>
            </div>
          </div>
        </div>
        <Button
          onClick={onCloseDay}
          variant="outline"
          className="w-full mt-4 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800"
        >
          <Moon className="w-4 h-4 mr-2" />
          Fermer la journée
        </Button>
      </div>
    );
  }

  // Session fermée
  if (sessionStatus === "closed" && session) {
    const closedAt = session.closed_at ? new Date(session.closed_at) : null;
    const totalSales = Number(session.total_sales) || 0;
    const difference = Number(session.cash_difference) || 0;

    return (
      <div className={cn(
        "rounded-2xl p-4 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800",
        className
      )}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-indigo-200 dark:bg-indigo-800">
            <Moon className="w-5 h-5 text-indigo-700 dark:text-indigo-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">
              Journée terminée
            </h3>
            <div className="text-sm text-indigo-700 dark:text-indigo-300 mt-1 space-y-1">
              {closedAt && (
                <p className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Fermée à {format(closedAt, "HH:mm", { locale: fr })}
                </p>
              )}
              <p>
                Ventes: <span className="font-semibold">{formatCurrency(totalSales)} FCFA</span>
                {difference !== 0 && (
                  <span className={cn(
                    "ml-2",
                    difference > 0 ? "text-blue-600" : "text-red-600"
                  )}>
                    ({difference > 0 ? "+" : ""}{formatCurrency(difference)})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-indigo-600 dark:text-indigo-400 mt-3">
          Revenez demain pour ouvrir une nouvelle journée !
        </p>
      </div>
    );
  }

  return null;
}
