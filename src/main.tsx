import { createRoot } from "react-dom/client";
import { bootstrapEnvironment } from "./app/bootstrap/validateEnv";
import App from "./App.tsx";
import "./index.css";

bootstrapEnvironment();

createRoot(document.getElementById("root")!).render(<App />);

// Hide loader and show skip-link after React mounts
const loader = document.getElementById('app-loader');
const skipLink = document.querySelector('.skip-link') as HTMLElement;

if (loader) {
  loader.classList.add('hidden');
  setTimeout(() => loader.remove(), 300);
}

if (skipLink) {
  skipLink.style.display = '';
}
