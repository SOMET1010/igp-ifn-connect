import { createRoot } from "react-dom/client";
import { bootstrapEnvironment } from "./app/bootstrap/validateEnv";
import "./index.css";

bootstrapEnvironment();

function BootScreen({
  title,
  message,
  details,
}: {
  title: string;
  message: string;
  details?: string;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{message}</p>
        {details ? (
          <pre className="text-xs bg-muted/50 border border-border rounded-md p-3 overflow-auto max-h-48 whitespace-pre-wrap">
            {details}
          </pre>
        ) : null}
      </div>
    </div>
  );
}

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Élément #root introuvable dans index.html");
}

const root = createRoot(rootEl);
root.render(
  <BootScreen
    title="Chargement…"
    message="Initialisation de l'application…"
  />
);

// Import dynamique pour éviter qu'une erreur d'import bloque tout l'affichage
import("./App.tsx")
  .then(({ default: App }) => {
    root.render(<App />);
  })
  .catch((error) => {
    console.error("❌ Erreur au démarrage (import App):", error);
    root.render(
      <BootScreen
        title="Erreur de démarrage"
        message="L'application n'a pas pu se charger. Voir détails ci-dessous."
        details={String(error?.stack || error?.message || error)}
      />
    );
  });

