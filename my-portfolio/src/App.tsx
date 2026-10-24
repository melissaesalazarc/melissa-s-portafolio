import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router";
import Lenis from "lenis";
import BootConsole from "./components/BootConsole";
import Hero from "./components/Hero";
import Hud from "./components/Hud";
import { Casos, Contacto, SobreMi } from "./components/Sections";
import { useLang, useT } from "./lib/i18n";
import { goTo } from "./lib/street";

// Cada caso se carga cuando se visita.
const CasePage = lazy(() => import("./components/case/CasePage"));

function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);
}

/* Al cambiar de página se empieza arriba, salvo que la URL apunte a una sección. */
function useRouteScroll() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // Espera a que la sección exista (el inicio se monta en este mismo cuadro).
      const id = hash.slice(1);
      const t = window.setTimeout(() => goTo(id), 60);
      return () => clearTimeout(t);
    }
    const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
}

/* Título, descripción e idioma del documento siguen al idioma elegido. */
function useDocumentLang() {
  const lang = useLang();
  const t = useT();
  const { pathname } = useLocation();
  useEffect(() => {
    document.documentElement.lang = lang;
    if (pathname === "/") document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.meta.description);
  }, [lang, t, pathname]);
}

function Home({ onSceneReady }: { onSceneReady: () => void }) {
  return (
    <>
      <Hero onSceneReady={onSceneReady} />
      <Casos />
      <SobreMi />
      <Contacto />
    </>
  );
}

export default function App() {
  const t = useT();
  const { pathname } = useLocation();
  const [sceneReady, setSceneReady] = useState(false);
  // La consola de arranque solo tiene sentido si se entra por la esquina.
  const [booted, setBooted] = useState(pathname !== "/");
  const onSceneReady = useCallback(() => setSceneReady(true), []);
  const onBooted = useCallback(() => setBooted(true), []);

  useSmoothScroll();
  useRouteScroll();
  useDocumentLang();

  return (
    <div className={booted ? "is-booted" : "is-booting"}>
      <a className="skip-link" href="#main">
        {t.skip}
      </a>
      {!booted && <BootConsole sceneReady={sceneReady} onDone={onBooted} />}
      <Hud />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home onSceneReady={onSceneReady} />} />
          <Route
            path="/work/:slug"
            element={
              <Suspense fallback={null}>
                <CasePage />
              </Suspense>
            }
          />
          <Route path="*" element={<Home onSceneReady={onSceneReady} />} />
        </Routes>
      </main>
    </div>
  );
}
