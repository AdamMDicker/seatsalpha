import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const clearServiceWorkersAndCaches = async () => {
  if (typeof window === "undefined") return;

  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    if ("caches" in window) {
      const cacheKeys = await window.caches.keys();
      await Promise.all(cacheKeys.map((cacheKey) => window.caches.delete(cacheKey)));
    }
  } catch (error) {
    console.warn("Failed to clear cached app data", error);
  }
};

void clearServiceWorkersAndCaches();

createRoot(document.getElementById("root")!).render(<App />);
