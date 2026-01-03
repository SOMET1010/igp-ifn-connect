import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { WalletTransaction } from "../types/wallet.types";
import { TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_ICONS } from "../types/wallet.types";
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle } from "lucide-react";

interface TransactionListProps {
  transactions: WalletTransaction[];
  isLoading?: boolean;
}

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
                <div className="h-5 bg-muted rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucune transaction pour le moment</p>
            <p className="text-sm">Vos transferts apparaîtront ici</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case "pending":
        return <Clock className="h-3 w-3 text-amber-500" />;
      case "failed":
      case "cancelled":
        return <XCircle className="h-3 w-3 text-destructive" />;
      default:
        return null;
    }
  };

  const isDebit = (type: string) => 
    type === "transfer_sent" || type === "withdrawal" || type === "payment";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Historique récent</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="divide-y">
            {transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
              >
                {/* Icon */}
                <div className={`p-2 rounded-full ${
                  isDebit(tx.type) 
                    ? "bg-red-100 text-red-600 dark:bg-red-900/30" 
                    : "bg-green-100 text-green-600 dark:bg-green-900/30"
                }`}>
                  {isDebit(tx.type) 
                    ? <ArrowUpRight className="h-4 w-4" /> 
                    : <ArrowDownLeft className="h-4 w-4" />
                  }
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{TRANSACTION_TYPE_ICONS[tx.type]}</span>
                    <p className="font-medium truncate">
                      {tx.counterparty_name || TRANSACTION_TYPE_LABELS[tx.type]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{format(new Date(tx.created_at), "dd MMM, HH:mm", { locale: fr })}</span>
                    {getStatusIcon(tx.status)}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className={`font-semibold ${
                    isDebit(tx.type) ? "text-red-600" : "text-green-600"
                  }`}>
                    {isDebit(tx.type) ? "-" : "+"}{tx.amount.toLocaleString()} F
                  </p>
                  <Badge variant="outline" className="text-xs font-normal">
                    {tx.reference.slice(-8)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
