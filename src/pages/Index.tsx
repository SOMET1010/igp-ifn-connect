import { Link } from "react-router-dom";
import { Users, ShoppingBag, Building2, Map, ArrowRight } from "lucide-react";

const apps = [
  {
    icon: Users,
    title: "App Agent",
    description: "Enrôlement terrain des marchands",
    href: "/agent",
    color: "bg-primary",
  },
  {
    icon: ShoppingBag,
    title: "App Marchand",
    description: "Caisse, Marché Virtuel, Protection Sociale",
    href: "/marchand",
    color: "bg-secondary",
  },
  {
    icon: Building2,
    title: "Portail Coopérative",
    description: "Gestion stocks et commandes IGP",
    href: "/cooperative",
    color: "bg-accent",
  },
  {
    icon: Map,
    title: "Portail Admin",
    description: "Cartographie SIG et statistiques",
    href: "/admin",
    color: "bg-earth",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-africa text-primary-foreground py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">🌍 Plateforme IGP & IFN</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Formalisation du commerce vivrier ivoirien
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-xl font-bold text-foreground mb-6">Choisir une interface</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <Link
                key={app.href}
                to={app.href}
                className="group rounded-2xl border-2 border-border bg-card p-6 hover:shadow-africa hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className={`${app.color} p-4 rounded-xl text-primary-foreground`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {app.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">{app.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-border py-6 px-6 text-center text-muted-foreground text-sm">
        <p>🇨🇮 République de Côte d'Ivoire - DGE / ANSUT / DGI</p>
      </footer>
    </div>
  );
};

export default Index;
