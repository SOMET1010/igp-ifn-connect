import { createRoot } from "react-dom/client";
import { bootstrapEnvironment } from "./app/bootstrap/validateEnv";
import App from "./App.tsx";
import "./index.css";

bootstrapEnvironment();

createRoot(document.getElementById("root")!).render(<App />);
