import { Calendar, TrendingUp, Users, CheckCircle, Clock, Percent } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatCard } from "@/components/shared/StatCard";
import type { AgentDashboardStats } from "../../types/agent.types";
import { cn } from "@/lib/utils";

interface AgentStatsProps {
  stats: AgentDashboardStats;
  isLoading: boolean;
  className?: string;
}

export function AgentStats({ stats, isLoading, className }: AgentStatsProps) {
  const { t } = useLanguage();

  const getValidationRateVariant = (rate: number) => {
    if (rate >= 80) return "success";
    if (rate >= 50) return "warning";
    return "default";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Première ligne - Aujourd'hui et Cette semaine */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title={t("today")}
          value={isLoading ? "-" : stats.today.toString()}
          icon={Calendar}
          variant="primary"
        />
        <StatCard
          title={t("this_week")}
          value={isLoading ? "-" : stats.week.toString()}
          icon={TrendingUp}
        />
      </div>

      {/* Deuxième ligne - Validés et En attente */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title={t("validated")}
          value={isLoading ? "-" : stats.validated.toString()}
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title={t("pending")}
          value={isLoading ? "-" : stats.pending.toString()}
          icon={Clock}
          variant={stats.pending > 0 ? "warning" : "default"}
        />
      </div>

      {/* Troisième ligne - Taux et Total */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title={t("validation_rate")}
          value={isLoading ? "-" : `${stats.validationRate}%`}
          icon={Percent}
          variant={getValidationRateVariant(stats.validationRate)}
        />
        <StatCard
          title={t("total")}
          value={isLoading ? "-" : stats.total.toString()}
          icon={Users}
        />
      </div>
    </div>
  );
}