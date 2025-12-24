import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { ChartDataPoint } from '../../types/dashboard.types';

interface EnrollmentChartProps {
  chartData: ChartDataPoint[];
}

export const EnrollmentChart: React.FC<EnrollmentChartProps> = ({ chartData }) => {
  const totalEnrollments = chartData.reduce((sum, d) => sum + d.enrollments, 0);
  const isEmpty = totalEnrollments === 0;

  return (
    <Card className="card-institutional">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Enrôlements (7 derniers jours)
          </h3>
        </div>

        {isEmpty ? (
          <div className="h-40 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
              <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Aucun enrôlement sur les 7 derniers jours
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Les nouveaux marchands apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis hide />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="enrollments"
                  stroke="hsl(var(--primary))"
                  fill="url(#enrollmentGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
