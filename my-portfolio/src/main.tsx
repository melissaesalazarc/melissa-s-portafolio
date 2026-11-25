import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.tsx";

/* Si una pestaña quedó abierta durante un deploy, sus chunks viejos ya no existen: se recarga una vez. */
window.addEventListener("vite:preloadError", () => {
  try {
    if (sessionStorage.getItem("esquina:reloaded")) return;
    sessionStorage.setItem("esquina:reloaded", "1");
  } catch {
    /* sin almacenamiento: se recarga igual */
  }
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
