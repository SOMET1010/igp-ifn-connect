import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Activity,
  Server,
  Database,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  Shield,
  Zap,
  HardDrive
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SystemLog {
  id: string;
  event_type: string;
  actor_type: string | null;
  description: string | null;
  severity: string;
  created_at: string;
  metadata: unknown;
}

interface ServiceStatus {
  name: string;
  status: "online" | "degraded" | "offline";
  latency?: number;
  icon: React.ReactNode;
}

export default function AdminMonitoring() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [services] = useState<ServiceStatus[]>([
    { name: "Base de données", status: "online", latency: 12, icon: <Database className="w-5 h-5" /> },
    { name: "Authentification", status: "online", latency: 45, icon: <Shield className="w-5 h-5" /> },
    { name: "Stockage", status: "online", latency: 23, icon: <HardDrive className="w-5 h-5" /> },
    { name: "API", status: "online", latency: 8, icon: <Zap className="w-5 h-5" /> },
  ]);

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    todayTransactions: 0,
    errorRate: 0
  });

  useEffect(() => {
    fetchData();
  }, [user, eventFilter]);

  const fetchData = async () => {
    setIsRefreshing(true);

    // Fetch system logs
    let query = supabase
      .from("system_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (eventFilter !== "all") {
      query = query.eq("event_type", eventFilter);
    }

    const { data: logsData } = await query;
    if (logsData) {
      setLogs(logsData);
    }

    // Fetch stats
    const { count: merchantsCount } = await supabase
      .from("merchants")
      .select("*", { count: "exact", head: true });

    const { count: agentsCount } = await supabase
      .from("agents")
      .select("*", { count: "exact", head: true });

    const today = new Date().toISOString().split("T")[0];
    const { count: txCount } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today);

    setStats({
      totalUsers: (merchantsCount || 0) + (agentsCount || 0),
      activeSessions: Math.floor(Math.random() * 50) + 10, // Simulated
      todayTransactions: txCount || 0,
      errorRate: Math.random() * 2 // Simulated
    });

    setIsLoading(false);
    setIsRefreshing(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error": return "text-destructive bg-destructive/10";
      case "warning": return "text-accent-foreground bg-accent/20";
      case "info": return "text-primary bg-primary/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "login": return <Users className="w-4 h-4" />;
      case "transaction": return <Activity className="w-4 h-4" />;
      case "error": return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "text-secondary";
      case "degraded": return "text-accent-foreground";
      case "offline": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-sidebar text-sidebar-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Surveillance Système</h1>
            <p className="text-sm text-sidebar-foreground/70">Monitoring en temps réel</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="bg-sidebar-accent border-sidebar-border"
            onClick={fetchData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
              <p className="text-xs text-muted-foreground">Utilisateurs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="w-6 h-6 mx-auto text-secondary mb-1" />
              <p className="text-2xl font-bold text-foreground">{stats.activeSessions}</p>
              <p className="text-xs text-muted-foreground">Sessions actives</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 mx-auto text-accent-foreground mb-1" />
              <p className="text-2xl font-bold text-foreground">{stats.todayTransactions}</p>
              <p className="text-xs text-muted-foreground">Transactions/jour</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className={`w-6 h-6 mx-auto mb-1 ${stats.errorRate > 1 ? 'text-destructive' : 'text-secondary'}`} />
              <p className="text-2xl font-bold text-foreground">{stats.errorRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Taux d'erreur</p>
            </CardContent>
          </Card>
        </div>

        {/* Services Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              État des services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {services.map((service) => (
                <div 
                  key={service.name}
                  className="p-3 rounded-xl bg-muted/50 flex items-center gap-3"
                >
                  <div className={getStatusColor(service.status)}>
                    {service.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{service.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(service.status)}`}
                      >
                        {service.status === "online" ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> En ligne</>
                        ) : service.status === "degraded" ? (
                          <><AlertTriangle className="w-3 h-3 mr-1" /> Dégradé</>
                        ) : (
                          <><AlertTriangle className="w-3 h-3 mr-1" /> Hors ligne</>
                        )}
                      </Badge>
                      {service.latency && (
                        <span className="text-xs text-muted-foreground">{service.latency}ms</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Logs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Logs système
              </CardTitle>
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Filtrer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="login">Connexions</SelectItem>
                  <SelectItem value="transaction">Transactions</SelectItem>
                  <SelectItem value="error">Erreurs</SelectItem>
                  <SelectItem value="sync">Synchronisation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun log récent</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <div 
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${getSeverityColor(log.severity)}`}>
                      {getEventIcon(log.event_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {log.event_type}
                        </Badge>
                        {log.actor_type && (
                          <span className="text-xs text-muted-foreground">{log.actor_type}</span>
                        )}
                      </div>
                      <p className="text-sm text-foreground">
                        {log.description || "Événement système"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
