import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Store, 
  Wheat, 
  Shield,
  ArrowRight,
  Smartphone,
  TestTube
} from 'lucide-react';

interface DemoAccount {
  role: string;
  title: string;
  description: string;
  code: string;
  icon: React.ReactNode;
  color: string;
  loginPath: string;
  dashboardPath: string;
  features: string[];
}

const demoAccounts: DemoAccount[] = [
  {
    role: 'agent',
    title: 'Agent de terrain',
    description: 'Enrôle les marchands sur le terrain avec GPS et photos',
    code: 'AGENT-DEMO',
    icon: <Users className="h-8 w-8" />,
    color: 'bg-blue-500',
    loginPath: '/agent/login',
    dashboardPath: '/agent',
    features: ['Enrôlement avec wizard', 'GPS & Photos', 'Mode hors-ligne', 'Liste des marchands']
  },
  {
    role: 'merchant',
    title: 'Marchand',
    description: 'Gère sa caisse, son stock et ses transactions',
    code: 'MARCHAND-DEMO',
    icon: <Store className="h-8 w-8" />,
    color: 'bg-green-500',
    loginPath: '/marchand/login',
    dashboardPath: '/marchand',
    features: ['Encaissement', 'Gestion stock', 'Crédits clients', 'CMU', 'Promotions']
  },
  {
    role: 'cooperative',
    title: 'Coopérative',
    description: 'Gère les stocks de produits IGP et les commandes',
    code: 'COOP-DEMO',
    icon: <Wheat className="h-8 w-8" />,
    color: 'bg-amber-500',
    loginPath: '/cooperative/login',
    dashboardPath: '/cooperative',
    features: ['Stock produits IGP', 'Commandes marchands', 'Certification IGP']
  },
  {
    role: 'admin',
    title: 'Administrateur',
    description: 'Vue d\'ensemble et pilotage de la plateforme',
    code: 'ADMIN-DEMO',
    icon: <Shield className="h-8 w-8" />,
    color: 'bg-violet-500',
    loginPath: '/admin/login',
    dashboardPath: '/admin',
    features: ['Dashboard global', 'Cartographie', 'Monitoring', 'Studio Audio', 'Analytics']
  }
];

export default function DemoAccess() {
  const navigate = useNavigate();

  const handleAccessDemo = (account: DemoAccount) => {
    // Store demo mode in sessionStorage
    sessionStorage.setItem('demo_mode', 'true');
    sessionStorage.setItem('demo_role', account.role);
    // Navigate directly to dashboard for demo
    navigate(account.dashboardPath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <TestTube className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Mode Démonstration</h1>
              <p className="text-xs text-white/60">Plateforme IFN - Côte d'Ivoire</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Info Banner */}
        <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-xl">
          <div className="flex items-start gap-3">
            <Smartphone className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h2 className="font-semibold text-white mb-1">Accès démo sans inscription</h2>
              <p className="text-sm text-white/70">
                Cliquez sur un profil pour accéder directement au tableau de bord correspondant. 
                Toutes les fonctionnalités sont disponibles pour les tests.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {demoAccounts.map((account) => (
            <Card 
              key={account.role}
              className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
              onClick={() => handleAccessDemo(account)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 ${account.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    {account.icon}
                  </div>
                  <Badge variant="outline" className="text-white/70 border-white/20">
                    {account.code}
                  </Badge>
                </div>
                <CardTitle className="text-white mt-3">{account.title}</CardTitle>
                <CardDescription className="text-white/60">
                  {account.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {account.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full group-hover:bg-primary"
                  variant="secondary"
                >
                  Accéder au dashboard
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <h3 className="font-semibold text-white mb-2">📱 Mobile-first</h3>
              <p className="text-sm text-white/60">
                Interface optimisée pour les smartphones, utilisable aussi sur desktop.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <h3 className="font-semibold text-white mb-2">🌍 Multi-langue</h3>
              <p className="text-sm text-white/60">
                Français et Dioula supportés, avec audio intégré pour l'accessibilité.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <h3 className="font-semibold text-white mb-2">📶 Mode hors-ligne</h3>
              <p className="text-sm text-white/60">
                Les agents peuvent enrôler même sans connexion, sync automatique.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Credentials section */}
        <Card className="mt-8 bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">🔐 Identifiants de test (avec authentification)</CardTitle>
            <CardDescription className="text-white/60">
              Pour tester le flux d'authentification complet, utilisez ces identifiants sur les pages de connexion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-black/20 rounded-lg">
                <p className="text-xs text-white/50 mb-1">Admin</p>
                <p className="text-sm text-white font-mono">admin@ifn-ci.gouv.ci / Admin123!</p>
              </div>
              <div className="p-3 bg-black/20 rounded-lg">
                <p className="text-xs text-white/50 mb-1">Agent</p>
                <p className="text-sm text-white font-mono">agent@ifn-ci.gouv.ci / Agent123!</p>
              </div>
              <div className="p-3 bg-black/20 rounded-lg">
                <p className="text-xs text-white/50 mb-1">Marchand</p>
                <p className="text-sm text-white font-mono">marchand@test.ci / Marchand123!</p>
              </div>
              <div className="p-3 bg-black/20 rounded-lg">
                <p className="text-xs text-white/50 mb-1">Coopérative</p>
                <p className="text-sm text-white font-mono">coop@test.ci / Coop123!</p>
              </div>
            </div>
            <p className="text-xs text-white/40 mt-4">
              Note : Ces comptes doivent être créés manuellement dans Supabase Auth pour fonctionner.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
