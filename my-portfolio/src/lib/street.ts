import { useEffect, useState, useSyncExternalStore } from "react";

/* Estado de la esquina que la escena 3D lee en cada cuadro sin re-renderizar.
   Lo escriben el scroll y el puntero; useFrame lo lee directo (nunca setState en el loop). */
export const street = {
  /** 0 → 1 a lo largo del hero fijo. */
  heroProgress: 0,
  /** 0 → 1 desde que termina el hero hasta el final de la página. */
  pageProgress: 0,
  /** Puntero normalizado −1 … 1, para el paralaje. */
  pointerX: 0,
  pointerY: 0,
  /** Letrero bajo el puntero, para iluminarlo. */
  hovered: null as string | null,
};

export type Light = "siga" | "precaucion" | "alto";

/* El semáforo dice en qué parte de la esquina vas. */
let light: Light = "siga";
const listeners = new Set<() => void>();

export function setLight(next: Light) {
  if (next === light) return;
  light = next;
  listeners.forEach((l) => l());
}

export function getLight() {
  return light;
}

export function useLight() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getLight,
    getLight,
  );
}

export function useReducedMotion() {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Secciones a las que apuntan los letreros (los textos viven en i18n). */
export const ROUTES = [
  { id: "work", key: "work" },
  { id: "about", key: "about" },
  { id: "contact", key: "contact" },
] as const;

export function goTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element) => void } }).__lenis;
  if (lenis && !reduced) lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  // El foco va al destino para teclado y lectores de pantalla.
  el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}
