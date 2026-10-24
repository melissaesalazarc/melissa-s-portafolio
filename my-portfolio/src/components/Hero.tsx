import { Fragment, Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { goTo, street, useReducedMotion, webglAvailable } from "../lib/street";
import { useT } from "../lib/i18n";
import "./Hero.css";

// Three.js se carga aparte para que el texto del hero no espere al 3D.
const Scene = lazy(() => import("../corner/Scene"));

/* Título cinético: cada letra entra por su cuenta, se levanta cerca del cursor
   y se dispersa con el scroll. El lector de pantalla recibe la frase completa. */
function KineticTitle({ lines, reduced }: { lines: string[]; reduced: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);

  const chars = useMemo(() => {
    let i = 0;
    return lines.map((line) =>
      line.split(" ").map((word) =>
        word.split("").map((ch) => ({
          ch,
          i: i++,
          // Giro de salida pseudoaleatorio pero estable por letra.
          r: ((i * 7919) % 23) - 11,
        })),
      ),
    );
  }, [lines]);

  // Las letras cerca del puntero se levantan (solo puntero fino).
  useEffect(() => {
    const h = ref.current;
    if (!h || reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const spans = Array.from(h.querySelectorAll<HTMLElement>(".kin__char"));
    let rects: DOMRect[] = [];
    const measure = () => {
      rects = spans.map((s) => s.getBoundingClientRect());
    };
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!rects.length) measure();
        spans.forEach((s, k) => {
          const r = rects[k];
          const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
          s.style.setProperty("--lift", Math.max(0, 1 - d / 140).toFixed(3));
        });
      });
    };
    const onLeave = () => spans.forEach((s) => s.style.setProperty("--lift", "0"));
    const reset = () => (rects = []);
    h.addEventListener("pointermove", onMove);
    h.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", reset);
    window.addEventListener("scroll", reset, { passive: true });
    return () => {
      h.removeEventListener("pointermove", onMove);
      h.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", reset);
      window.removeEventListener("scroll", reset);
      cancelAnimationFrame(raf);
    };
  }, [reduced, chars]);

  return (
    <h1 ref={ref} id="hero-title" className="hero__title kin" aria-label={lines.join(" ")}>
      {chars.map((words, li) => (
        <span key={li} className="kin__line" aria-hidden="true">
          {words.map((word, wi) => (
            <Fragment key={wi}>
              <span className="kin__word">
                {word.map(({ ch, i, r }) => (
                  <span key={i} className="kin__char" style={{ "--i": i, "--r": r } as React.CSSProperties}>
                    <span className="kin__in">{ch}</span>
                  </span>
                ))}
              </span>
              {wi < words.length - 1 ? " " : null}
            </Fragment>
          ))}
          {li < chars.length - 1 ? " " : null}
        </span>
      ))}
    </h1>
  );
}

export default function Hero({ onSceneReady }: { onSceneReady: () => void }) {
  const t = useT();
  const wrapRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [hasGL] = useState(() => webglAvailable());

  // Progreso del hero fijo (0 → 1). Se escribe en refs y en una variable CSS, no en estado.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = wrap.getBoundingClientRect();
      const run = rect.height - window.innerHeight;
      const p = run > 0 ? Math.min(1, Math.max(0, -rect.top / run)) : 0;
      street.heroProgress = p;
      // Después del hero, el resto de la página sigue moviendo la noche de fondo.
      const heroEnd = window.scrollY + rect.bottom - window.innerHeight;
      const rest = document.documentElement.scrollHeight - window.innerHeight - heroEnd;
      street.pageProgress = rest > 0 ? Math.min(1, Math.max(0, (window.scrollY - heroEnd) / rest)) : 0;
      const copy = copyRef.current;
      if (copy) {
        const out = reduced ? (p > 0.25 ? 1 : 0) : Math.min(1, Math.max(0, (p - 0.05) / 0.28));
        copy.style.setProperty("--exit", out.toFixed(3));
        copy.style.visibility = out >= 1 ? "hidden" : "visible";
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  // Paralaje del puntero (solo puntero fino).
  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      street.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      street.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  useEffect(() => {
    if (!hasGL) onSceneReady();
  }, [hasGL, onSceneReady]);

  return (
    <section ref={wrapRef} id="home" className="hero" aria-labelledby="hero-title">
      <div className="hero__stage">
        {hasGL ? (
          <div className="hero__canvas" aria-hidden="true">
            <Suspense fallback={null}>
              <Scene reduced={reduced} active onReady={onSceneReady} />
            </Suspense>
          </div>
        ) : (
          <div className="hero__fallback" aria-hidden="true">
            <span className="hero__fallback-sign">{t.signs.avenue}</span>
          </div>
        )}

        <div ref={copyRef} className="hero__copy">
          <KineticTitle lines={[t.hero.line1, t.hero.line2]} reduced={reduced} />
          <div className="hero__aside">
            <p className="hero__lead">{t.hero.lead}</p>
            <a
              className="btn"
              href="#work"
              onClick={(e) => {
                e.preventDefault();
                goTo("work");
              }}
            >
              {t.hero.cta}
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M2 9h12M9 3.5 14.5 9 9 14.5" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </a>
          </div>
        </div>

        {hasGL && <p className="hero__hint">{t.hero.hint}</p>}
      </div>

      {/* Navegación equivalente a los letreros 3D, para teclado y lectores de pantalla. */}
      <nav className="visually-hidden" aria-label={t.nav.signsLabel}>
        <a href="#work">{t.nav.work}</a>
        <a href="#about">{t.nav.about}</a>
        <a href="#contact">{t.nav.contact}</a>
      </nav>
    </section>
  );
}
