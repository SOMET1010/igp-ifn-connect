import { Calendar, TrendingUp, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { UnifiedStatCard } from "@/components/shared/UnifiedStatCard";
import type { AgentDashboardStats } from "../../types/agent.types";

interface AgentStatsProps {
  stats: AgentDashboardStats;
  isLoading: boolean;
}

export function AgentStats({ stats, isLoading }: AgentStatsProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-3 gap-3">
      <UnifiedStatCard
        title={t("today")}
        value={isLoading ? "-" : stats.today.toString()}
        icon={Calendar}
      />
      <UnifiedStatCard
        title={t("this_week")}
        value={isLoading ? "-" : stats.week.toString()}
        icon={TrendingUp}
      />
      <UnifiedStatCard
        title={t("total")}
        value={isLoading ? "-" : stats.total.toString()}
        icon={Users}
      />
    </div>
  );
}
