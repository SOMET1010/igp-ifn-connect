/**
 * Page Admin Diagnostics P.NA.VIM
 * Vue détaillée pour les administrateurs
 */

import { useState, useEffect } from 'react';
import { RefreshCw, Database, HardDrive, Activity, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EnhancedHeader } from '@/shared/ui/EnhancedHeader';
import { supabase } from '@/integrations/supabase/client';
import { logger, type LogEntry } from '@/shared/services/logger';
import { getOfflineQueue } from '@/lib/offlineDB';
import { getEnvStatus } from '@/app/bootstrap/validateEnv';
import { SITEMAP, getAllRoutes } from '@/app/router/sitemap';

interface TableStats {
  name: string;
  count: number;
}

export default function AdminDiagnostics() {
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [queueItems, setQueueItems] = useState<unknown[]>([]);
  const [tableStats, setTableStats] = useState<TableStats[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadDiagnostics = async () => {
    setIsLoading(true);
    
    // Charger les logs récents
    setLogs(logger.getRecentLogs());
    
    // Charger la queue offline
    try {
      const queue = await getOfflineQueue();
      setQueueItems(queue);
    } catch {
      setQueueItems([]);
    }
    
    // Charger les stats des tables principales
    const tables = ['merchants', 'transactions', 'agents', 'cooperatives', 'markets', 'vivriers_members'] as const;
    const stats: TableStats[] = [];
    
    for (const table of tables) {
      try {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        stats.push({ name: table, count: count || 0 });
      } catch {
        stats.push({ name: table, count: -1 });
      }
    }
    
    setTableStats(stats);
    setLastRefresh(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const envStatus = getEnvStatus();
  const allRoutes = getAllRoutes();

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-500';
      case 'warn': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <EnhancedHeader title="Diagnostics Système" showBack backTo="/admin" />
      
      <div className="p-4 space-y-6 pb-24">
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Dernière actualisation: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button 
            variant="outline" 
            onClick={loadDiagnostics}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue générale</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="queue">Queue Offline</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4">
            {/* Stats Tables */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Tables de données
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {tableStats.map((stat) => (
                    <div 
                      key={stat.name}
                      className="p-3 bg-muted/50 rounded-lg"
                    >
                      <p className="text-sm text-muted-foreground capitalize">
                        {stat.name.replace('_', ' ')}
                      </p>
                      <p className="text-2xl font-bold">
                        {stat.count >= 0 ? stat.count.toLocaleString() : '⚠️'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Env Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Environnement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(envStatus).map(([key, { set }]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="font-mono text-sm">{key}</span>
                      {set ? (
                        <Badge className="bg-green-100 text-green-800">Défini</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Manquant</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Queue Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Queue Offline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold">{queueItems.length}</div>
                  <div className="text-muted-foreground">
                    {queueItems.length === 0 
                      ? 'Aucune action en attente de synchronisation'
                      : `action(s) en attente de sync`
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Logs récents ({logs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Aucun log récent
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {logs.slice().reverse().map((log, index) => (
                        <div 
                          key={index}
                          className="p-2 bg-muted/30 rounded border-l-4"
                          style={{
                            borderLeftColor: log.level === 'error' ? 'rgb(239, 68, 68)' :
                              log.level === 'warn' ? 'rgb(245, 158, 11)' :
                              log.level === 'info' ? 'rgb(59, 130, 246)' : 'rgb(156, 163, 175)'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-mono text-sm ${getLogLevelColor(log.level)}`}>
                              [{log.level.toUpperCase()}]
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="font-medium">{log.action}</p>
                          {log.traceId && (
                            <p className="text-xs text-muted-foreground font-mono">
                              TraceID: {log.traceId}
                            </p>
                          )}
                          {log.data && (
                            <pre className="text-xs bg-muted/50 p-2 rounded mt-1 overflow-x-auto">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Queue */}
          <TabsContent value="queue">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Queue Offline ({queueItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {queueItems.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-2" />
                      <p className="text-muted-foreground">
                        Toutes les actions sont synchronisées
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {queueItems.map((item, index) => (
                        <div 
                          key={index}
                          className="p-3 bg-muted/50 rounded-lg"
                        >
                          <pre className="text-xs overflow-x-auto">
                            {JSON.stringify(item, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Routes */}
          <TabsContent value="routes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Sitemap ({allRoutes.length} routes)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {Object.entries(SITEMAP).map(([category, routes]) => (
                      <div key={category}>
                        <h3 className="font-semibold capitalize mb-2 flex items-center gap-2">
                          {category}
                          <Badge variant="outline">{routes.length}</Badge>
                        </h3>
                        <div className="space-y-1 ml-4">
                          {routes.map((route) => (
                            <div 
                              key={route.path}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="font-mono text-muted-foreground">
                                {route.path}
                              </span>
                              <span>{route.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Warning */}
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium">Mode Diagnostic</p>
                <p className="text-sm text-muted-foreground">
                  Ces informations sont destinées aux administrateurs pour le debug. 
                  Ne partagez pas ces données sans précaution.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
