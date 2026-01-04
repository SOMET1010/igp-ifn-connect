import { createRoot } from "react-dom/client";
import { bootstrapEnvironment } from "./app/bootstrap/validateEnv";
import App from "./App.tsx";
import "./index.css";

// Validation des variables d'environnement au boot
bootstrapEnvironment();

createRoot(document.getElementById("root")!).render(<App />);
