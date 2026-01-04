import { Calendar, TrendingUp, Users, CheckCircle, Clock, Percent } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatCard } from "@/components/shared/StatCard";
import type { AgentDashboardStats } from "../../types/agent.types";

interface AgentStatsProps {
  stats: AgentDashboardStats;
  isLoading: boolean;
}

export function AgentStats({ stats, isLoading }: AgentStatsProps) {
  const { t } = useLanguage();

  const getValidationRateVariant = (rate: number) => {
    if (rate >= 80) return "success";
    if (rate >= 50) return "warning";
    return "default";
  };

  return (
    <div className="grid grid-cols-2 gap-3">
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
  );
}
