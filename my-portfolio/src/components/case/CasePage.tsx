import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router";
import { motion } from "framer-motion";
import { CASES, PHASES, UI, findCase, type Phase } from "../../content/cases";
import { useLang } from "../../lib/i18n";
import { setLight } from "../../lib/street";
import { BlockView } from "./Blocks";
import "./CasePage.css";

const ORDER: Phase["id"][] = ["discover", "define", "develop", "deliver"];

// Cada fase es media figura del Double Diamond: abrir (divergir) y cerrar (converger).
const SHAPES: Record<Phase["id"], string> = {
  discover: "8,32 54,6 54,58",
  define: "54,6 100,32 54,58",
  develop: "100,32 146,6 146,58",
  deliver: "146,6 192,32 146,58",
};

/* Mapa del proceso: se queda fijo al costado y marca en qué fase vas. */
function DiamondMap({ active }: { active: Phase["id"] | null }) {
  const lang = useLang();
  const idx = active ? ORDER.indexOf(active) : -1;
  return (
    <nav className="cs-map" aria-label="Double Diamond">
      <svg viewBox="0 0 200 64" aria-hidden="true">
        {ORDER.map((id, i) => (
          <polygon
            key={id}
            points={SHAPES[id]}
            className={i === idx ? "is-active" : i < idx ? "is-done" : ""}
          />
        ))}
      </svg>
      <ol>
        {ORDER.map((id, i) => (
          <li key={id}>
            <a href={`#${id}`} aria-current={i === idx ? "step" : undefined}>
              {PHASES[id][lang]}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function useActivePhase(slug: string) {
  const [active, setActive] = useState<Phase["id"] | null>(null);
  useEffect(() => {
    const els = ORDER.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id as Phase["id"]);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [slug]);
  return active;
}

export default function CasePage() {
  const { slug } = useParams();
  const lang = useLang();
  const c = findCase(slug);
  const active = useActivePhase(slug ?? "");

  useEffect(() => {
    setLight("precaucion");
    if (c) document.title = `${c.title[lang]} · Melissa Salazar`;
  }, [c, lang]);

  if (!c) return <Navigate to="/" replace />;

  const i = CASES.indexOf(c);
  const next = CASES[(i + 1) % CASES.length];

  return (
    <article className="cs" aria-labelledby="cs-title">
      <header className="cs-head">
        <Link className="cs-back" to="/#work">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M14 8H3M7.5 3 2.5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          {UI.back[lang]}
        </Link>
        <motion.h1
          id="cs-title"
          className="cs-title"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {c.title[lang]}
        </motion.h1>
        <motion.p
          className="cs-summary"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          {c.summary[lang]}
        </motion.p>
        <motion.dl
          className="cs-meta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.16 }}
        >
          {c.meta.map((m) => (
            <div key={m.label.en}>
              <dt>{m.label[lang]}</dt>
              <dd>{m.value[lang]}</dd>
            </div>
          ))}
        </motion.dl>
      </header>

      <motion.figure
        className="cs-cover"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src={c.cover.src} width={c.cover.w} height={c.cover.h} alt="" />
      </motion.figure>

      <section className="cs-glance" aria-labelledby="glance-title">
        <h2 id="glance-title" className="visually-hidden">
          {UI.atAGlance[lang]}
        </h2>
        <ul>
          {c.impact.map((m) => (
            <li key={m.value}>
              <span className="cs-glance__value">{m.value}</span>
              <span className="cs-glance__label">{m.label[lang]}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="cs-section cs-context" aria-labelledby="context-title">
        <h2 id="context-title">{UI.context[lang]}</h2>
        <div className="cs-text">
          {c.context.map((p, k) => (
            <p key={k}>{p[lang]}</p>
          ))}
          <p className="cs-process-note">{UI.process[lang]}</p>
        </div>
      </section>

      <div className="cs-body">
        <aside className="cs-aside">
          <DiamondMap active={active} />
        </aside>
        <div className="cs-phases">
          {c.phases.map((ph) => (
            <section key={ph.id} id={ph.id} className="cs-phase" aria-labelledby={`${ph.id}-title`}>
              <p className="cs-phase__name">{PHASES[ph.id][lang]}</p>
              <h2 id={`${ph.id}-title`}>{ph.title[lang]}</h2>
              <p className="cs-lead">{ph.lead[lang]}</p>
              {ph.blocks.map((b, k) => (
                <BlockView key={k} block={b} />
              ))}
            </section>
          ))}
        </div>
      </div>

      <section className="cs-section" aria-labelledby="outcome-title">
        <h2 id="outcome-title">{UI.outcome[lang]}</h2>
        {c.outcome.map((b, k) => (
          <BlockView key={k} block={b} />
        ))}
      </section>

      <section className="cs-section" aria-labelledby="learned-title">
        <h2 id="learned-title">{UI.learned[lang]}</h2>
        <div className="cs-learned">
          {c.learned.map((l) => (
            <div key={l.title.en}>
              <h3>{l.title[lang]}</h3>
              <p>{l.body[lang]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cs-section" aria-labelledby="nextsteps-title">
        <h2 id="nextsteps-title">{UI.next[lang]}</h2>
        <ul className="cs-list">
          {c.next.map((n, k) => (
            <li key={k}>{n[lang]}</li>
          ))}
        </ul>
      </section>

      <Link className="cs-next" to={`/work/${next.slug}`}>
        <span className="cs-next__label">{UI.nextCase[lang]}</span>
        <span className="cs-next__title">{next.title[lang]}</span>
        <span className="cs-next__summary">{next.summary[lang]}</span>
      </Link>
    </article>
  );
}
