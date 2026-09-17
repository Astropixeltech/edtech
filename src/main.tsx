import "./integrations/supabase/tab-session";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";

// Auto-recover from any dynamic chunk import or preload mismatch errors
if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", (event) => {
    console.warn("Vite dynamic asset preload failed, refreshing page with latest build...", event);
    const key = "vite_preload_reload_ts";
    const last = sessionStorage.getItem(key);
    const now = Date.now();
    if (!last || now - parseInt(last, 10) > 8000) {
      sessionStorage.setItem(key, now.toString());
      window.location.reload();
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
