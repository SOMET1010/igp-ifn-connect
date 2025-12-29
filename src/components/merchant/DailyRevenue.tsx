import { useState, useEffect } from "react";
import { TrendingUp, Banknote, Smartphone, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { merchantLogger } from "@/infra/logger";

interface DailyStats {
  total: number;
  cash: number;
  mobileMoney: number;
  transactionCount: number;
}

interface DailyRevenueProps {
  refreshTrigger?: number;
  dailyGoal?: number;
}

export function DailyRevenue({ refreshTrigger, dailyGoal = 100000 }: DailyRevenueProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<DailyStats>({ total: 0, cash: 0, mobileMoney: 0, transactionCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDailyStats = async () => {
      try {
        // Get merchant ID
        const { data: merchant } = await supabase
          .from("merchants")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!merchant) return;

        // Get today's date range
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

        // Fetch today's transactions
        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount, transaction_type")
          .eq("merchant_id", merchant.id)
          .gte("created_at", startOfDay)
          .lt("created_at", endOfDay);

        if (transactions) {
          const totals = transactions.reduce(
            (acc, tx) => {
              acc.total += Number(tx.amount);
              if (tx.transaction_type === "cash") {
                acc.cash += Number(tx.amount);
              } else if (tx.transaction_type === "mobile_money") {
                acc.mobileMoney += Number(tx.amount);
              }
              acc.transactionCount++;
              return acc;
            },
            { total: 0, cash: 0, mobileMoney: 0, transactionCount: 0 }
          );
          setStats(totals);
        }
      } catch (error) {
        merchantLogger.error("Error fetching daily stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyStats();
  }, [user, refreshTrigger]);

  const progressPercent = Math.min((stats.total / dailyGoal) * 100, 100);
  const isGoalReached = stats.total >= dailyGoal;

  return (
    <Card className={`border-2 transition-all duration-500 ${isGoalReached ? "border-secondary bg-secondary/5" : "border-border"}`}>
      <CardContent className="p-4 space-y-4">
        {/* Main CA display */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <TrendingUp className="w-4 h-4" />
            CA du jour
          </p>
          <p className={`text-4xl sm:text-5xl font-bold mt-1 transition-all duration-300 ${
            isLoading ? "animate-pulse text-muted-foreground" : "text-foreground"
          }`}>
            {isLoading ? "..." : stats.total.toLocaleString()}
            <span className="text-lg sm:text-xl text-muted-foreground ml-2">FCFA</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.transactionCount} transaction{stats.transactionCount > 1 ? "s" : ""}
          </p>
        </div>

        {/* Progress towards goal */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Target className="w-4 h-4" />
              Objectif
            </span>
            <span className={`font-medium ${isGoalReached ? "text-secondary" : "text-foreground"}`}>
              {dailyGoal.toLocaleString()} FCFA
            </span>
          </div>
          <Progress 
            value={progressPercent} 
            className={`h-3 ${isGoalReached ? "[&>div]:bg-secondary" : ""}`}
          />
          {isGoalReached && (
            <p className="text-center text-sm text-secondary font-medium animate-fade-in">
              🎉 Objectif atteint !
            </p>
          )}
        </div>

        {/* Breakdown by payment method */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Espèces</p>
              <p className="font-bold text-foreground">{stats.cash.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mobile Money</p>
              <p className="font-bold text-foreground">{stats.mobileMoney.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
