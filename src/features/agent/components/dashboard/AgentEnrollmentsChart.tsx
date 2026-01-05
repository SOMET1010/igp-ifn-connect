import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DailyEnrollment } from "../../types/agent.types";

interface AgentEnrollmentsChartProps {
  data: DailyEnrollment[];
  isLoading?: boolean;
}

const chartConfig = {
  count: {
    label: "Enrôlements",
    color: "hsl(var(--primary))",
  },
};

export function AgentEnrollmentsChart({ data, isLoading }: AgentEnrollmentsChartProps) {
  const { t } = useLanguage();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    return days[date.getDay()];
  };

  const chartData = data.map((item) => ({
    ...item,
    dayLabel: formatDate(item.date),
  }));

  // Calcul du total de la semaine
  const weekTotal = data.reduce((sum, d) => sum + d.count, 0);

  if (isLoading) {
    return (
      <Card className="card-institutional">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{t("weekly_enrollments")}</h3>
                <p className="text-xs text-muted-foreground">7 derniers jours</p>
              </div>
            </div>
          </div>
          <div className="h-[160px] flex items-center justify-center">
            <div className="animate-pulse bg-muted rounded w-full h-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card className="card-institutional">
      <CardContent className="p-4">
        {/* Header avec icône et stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{t("weekly_enrollments")}</h3>
              <p className="text-xs text-muted-foreground">7 derniers jours</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{weekTotal}</p>
            <p className="text-xs text-muted-foreground">total</p>
          </div>
        </div>

        {/* Graphique */}
        <ChartContainer config={chartConfig} className="h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="dayLabel"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                domain={[0, maxCount + 1]}
                allowDecimals={false}
                width={30}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ fill: "hsl(var(--muted)/0.3)" }}
              />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
                name="Enrôlements"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}