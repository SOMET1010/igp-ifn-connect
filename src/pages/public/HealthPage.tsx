/**
 * Page /health - Statut système P.NA.VIM
 * Accessible publiquement pour diagnostic rapide
 */

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Wifi, Database, HardDrive, Bell, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { validateEnvironment, getEnvStatus } from '@/app/bootstrap/validateEnv';

interface HealthCheck {
  name: string;
  status: 'ok' | 'warning' | 'error' | 'checking';
  message: string;
  icon: React.ReactNode;
}

export default function HealthPage() {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const runHealthChecks = async () => {
    setIsRefreshing(true);
    const results: HealthCheck[] = [];

    // 1. Vérifier les variables d'environnement
    const envResult = validateEnvironment();
    results.push({
      name: 'Variables d\'environnement',
      status: envResult.valid ? 'ok' : 'error',
      message: envResult.valid 
        ? 'Toutes les variables requises sont définies' 
        : `${envResult.errors.length} erreur(s): ${envResult.errors.join(', ')}`,
      icon: <Info className="w-5 h-5" />,
    });

    // 2. Vérifier la connexion API (Supabase)
    try {
      const start = Date.now();
      const { error } = await supabase.from('markets').select('id').limit(1);
      const latency = Date.now() - start;
      
      if (error) throw error;
      
      results.push({
        name: 'API Backend',
        status: latency > 2000 ? 'warning' : 'ok',
        message: `Connecté (${latency}ms)`,
        icon: <Wifi className="w-5 h-5" />,
      });
    } catch (error) {
      results.push({
        name: 'API Backend',
        status: 'error',
        message: `Non accessible: ${(error as Error).message}`,
        icon: <Wifi className="w-5 h-5" />,
      });
    }

    // 3. Vérifier le stockage offline (IndexedDB)
    try {
      const dbRequest = indexedDB.open('pnavim_test', 1);
      await new Promise<void>((resolve, reject) => {
        dbRequest.onerror = () => reject(new Error('IndexedDB non disponible'));
        dbRequest.onsuccess = () => {
          dbRequest.result.close();
          indexedDB.deleteDatabase('pnavim_test');
          resolve();
        };
      });
      
      results.push({
        name: 'Stockage Offline',
        status: 'ok',
        message: 'IndexedDB disponible',
        icon: <HardDrive className="w-5 h-5" />,
      });
    } catch {
      results.push({
        name: 'Stockage Offline',
        status: 'error',
        message: 'IndexedDB non disponible',
        icon: <HardDrive className="w-5 h-5" />,
      });
    }

    // 4. Vérifier les permissions de notification
    let pushStatus: 'ok' | 'warning' | 'error' = 'warning';
    let pushMessage = 'Non demandé';
    
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        pushStatus = 'ok';
        pushMessage = 'Autorisées';
      } else if (Notification.permission === 'denied') {
        pushStatus = 'error';
        pushMessage = 'Refusées par l\'utilisateur';
      } else {
        pushMessage = 'En attente de permission';
      }
    } else {
      pushStatus = 'error';
      pushMessage = 'Non supportées par ce navigateur';
    }
    
    results.push({
      name: 'Notifications Push',
      status: pushStatus,
      message: pushMessage,
      icon: <Bell className="w-5 h-5" />,
    });

    // 5. Version build
    const version = import.meta.env.VITE_APP_VERSION || 'dev';
    results.push({
      name: 'Version',
      status: 'ok',
      message: `P.NA.VIM ${version}`,
      icon: <Database className="w-5 h-5" />,
    });

    // 6. Statut réseau
    results.push({
      name: 'Réseau',
      status: navigator.onLine ? 'ok' : 'warning',
      message: navigator.onLine ? 'En ligne' : 'Hors ligne',
      icon: <Wifi className="w-5 h-5" />,
    });

    setChecks(results);
    setLastCheck(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'ok':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
        return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
    }
  };

  const getStatusBadge = (status: HealthCheck['status']) => {
    switch (status) {
      case 'ok':
        return <Badge className="bg-green-100 text-green-800">OK</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Attention</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Erreur</Badge>;
      case 'checking':
        return <Badge className="bg-blue-100 text-blue-800">Vérification...</Badge>;
    }
  };

  const overallStatus = checks.some(c => c.status === 'error') 
    ? 'error' 
    : checks.some(c => c.status === 'warning') 
      ? 'warning' 
      : 'ok';

  const envStatus = getEnvStatus();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">P.NA.VIM</h1>
          <p className="text-muted-foreground">Statut du système</p>
          <div className="flex justify-center">
            {overallStatus === 'ok' && (
              <Badge className="bg-green-500 text-white text-lg px-4 py-1">
                ✅ Système opérationnel
              </Badge>
            )}
            {overallStatus === 'warning' && (
              <Badge className="bg-yellow-500 text-white text-lg px-4 py-1">
                ⚠️ Attention requise
              </Badge>
            )}
            {overallStatus === 'error' && (
              <Badge className="bg-red-500 text-white text-lg px-4 py-1">
                ❌ Problème détecté
              </Badge>
            )}
          </div>
        </div>

        {/* Checks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Vérifications</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runHealthChecks}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {checks.map((check, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <p className="font-medium">{check.name}</p>
                    <p className="text-sm text-muted-foreground">{check.message}</p>
                  </div>
                </div>
                {getStatusBadge(check.status)}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Env Details (dev only) */}
        {import.meta.env.DEV && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Variables d'environnement (dev)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                {Object.entries(envStatus).map(([key, { set, value }]) => (
                  <div key={key} className="flex items-center gap-2">
                    {set ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={set ? '' : 'text-muted-foreground'}>
                      {key}: {set ? value : 'non défini'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          {lastCheck && (
            <p>Dernière vérification: {lastCheck.toLocaleTimeString()}</p>
          )}
          <p className="mt-2">
            <a href="/" className="text-primary hover:underline">← Retour à l'accueil</a>
          </p>
        </div>
      </div>
    </div>
  );
}
