import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Block, Img } from "../../content/cases";
import { UI } from "../../content/cases";
import { useLang } from "../../lib/i18n";

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

function Picture({ img, alt, eager }: { img: Img; alt: string; eager?: boolean }) {
  return (
    <img
      src={img.src}
      width={img.w}
      height={img.h}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

/* Comparador antes/después: se arrastra con el mouse o el dedo, y con las flechas del teclado
   (es un input range de verdad debajo). */
function Compare({ before, after, caption }: { before: Img; after: Img; caption: string }) {
  const lang = useLang();
  const [pos, setPos] = useState(50);
  const id = useId();
  return (
    <motion.figure className="cs-compare" {...reveal}>
      <div className="cs-compare__stage" style={{ "--pos": `${pos}%` } as React.CSSProperties}>
        <Picture img={after} alt={`${UI.after[lang]}: ${caption}`} />
        <div className="cs-compare__before" aria-hidden="true">
          <Picture img={before} alt="" />
        </div>
        <span className="cs-compare__tag cs-compare__tag--before" aria-hidden="true">
          {UI.before[lang]}
        </span>
        <span className="cs-compare__tag cs-compare__tag--after" aria-hidden="true">
          {UI.after[lang]}
        </span>
        <span className="cs-compare__handle" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20">
            <path d="M7 5 2 10l5 5M13 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </span>
        <input
          id={id}
          className="cs-compare__range"
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={UI.compareLabel[lang]}
        />
      </div>
      <figcaption>
        <span className="cs-hint">{UI.compareHint[lang]}.</span> {caption}
      </figcaption>
    </motion.figure>
  );
}

/* La pieza real en un iframe: se carga solo cuando la persona la pide. */
function Demo({ before, after, poster, caption }: { before: string; after: string; poster: Img; caption: string }) {
  const lang = useLang();
  const [which, setWhich] = useState<"before" | "after" | null>(null);
  // La pieza está hecha a 1440 × 810: se dibuja a ese tamaño y se escala al contenedor.
  const stage = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / 1440));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <motion.figure className="cs-demo" {...reveal}>
      <div ref={stage} className="cs-demo__stage" style={{ "--demo-scale": scale } as React.CSSProperties}>
        {which ? (
          <iframe
            key={which}
            src={which === "after" ? after : before}
            title={which === "after" ? UI.demoAfter[lang] : UI.demoBefore[lang]}
            loading="lazy"
          />
        ) : (
          <button type="button" className="cs-demo__poster" onClick={() => setWhich("after")}>
            <Picture img={poster} alt="" />
            <span className="btn">{UI.playDemo[lang]}</span>
          </button>
        )}
      </div>
      {which && (
        <div className="cs-demo__tabs" role="group" aria-label={UI.compareLabel[lang]}>
          {(["before", "after"] as const).map((k) => (
            <button key={k} type="button" aria-pressed={which === k} onClick={() => setWhich(k)}>
              {k === "before" ? UI.before[lang] : UI.after[lang]}
            </button>
          ))}
        </div>
      )}
      <figcaption>{caption}</figcaption>
    </motion.figure>
  );
}

/* Video del movimiento real: arranca solo (sin sonido) cuando entra en pantalla, se puede pausar
   (WCAG 2.2.2) y con «reducir movimiento» espera a que la persona le dé play. */
function Video({ mp4, webm, poster, caption }: { mp4: string; webm: string; poster: Img; caption: string }) {
  const lang = useLang();
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !reduced && !userPaused) v.play().catch(() => {});
        else if (!e.isIntersecting) v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [userPaused]);
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      setUserPaused(false);
      v.play().catch(() => {});
    } else {
      setUserPaused(true);
      v.pause();
    }
  };
  return (
    <motion.figure className="cs-video" {...reveal}>
      <div className="cs-video__stage">
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster.src}
          width={poster.w}
          height={poster.h}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-label={caption}
        >
          <source src={webm} type="video/webm" />
          <source src={mp4} type="video/mp4" />
        </video>
        <button type="button" className="cs-video__toggle" onClick={toggle} aria-label={playing ? UI.pause[lang] : UI.play[lang]}>
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
              <rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
      <figcaption>{caption}</figcaption>
    </motion.figure>
  );
}

export function BlockView({ block }: { block: Block }) {
  const lang = useLang();
  switch (block.kind) {
    case "text":
      return (
        <motion.div className="cs-text" {...reveal}>
          {block.body.map((p, i) => (
            <p key={i}>{p[lang]}</p>
          ))}
        </motion.div>
      );
    case "list":
      return (
        <motion.ul className="cs-list" {...reveal}>
          {block.items.map((it, i) => (
            <li key={i}>{it[lang]}</li>
          ))}
        </motion.ul>
      );
    case "quote":
      return (
        <motion.blockquote className="cs-quote" {...reveal}>
          <p>{block.body[lang]}</p>
        </motion.blockquote>
      );
    case "decision":
      return (
        <motion.div className="cs-decision" {...reveal}>
          <h4>{block.title[lang]}</h4>
          <p>{block.body[lang]}</p>
        </motion.div>
      );
    case "compare":
      return <Compare before={block.before} after={block.after} caption={block.caption[lang]} />;
    case "image":
      return (
        <motion.figure className={`cs-figure${block.wide ? " cs-figure--wide" : ""}${block.crop ? " cs-figure--crop" : ""}`} {...reveal}>
          <Picture img={block.img} alt={block.caption[lang]} />
          <figcaption>{block.caption[lang]}</figcaption>
        </motion.figure>
      );
    case "pair":
      return (
        <motion.figure className={`cs-pair${block.phone ? " cs-pair--phone" : ""}`} {...reveal}>
          <div className="cs-pair__grid">
            <Picture img={block.a} alt="" />
            <Picture img={block.b} alt="" />
          </div>
          <figcaption>{block.caption[lang]}</figcaption>
        </motion.figure>
      );
    case "video":
      return <Video mp4={block.mp4} webm={block.webm} poster={block.poster} caption={block.caption[lang]} />;
    case "demo":
      return <Demo before={block.before} after={block.after} poster={block.poster} caption={block.caption[lang]} />;
    case "table":
      return (
        <motion.div className="cs-table" {...reveal}>
          <table>
            <thead>
              <tr>
                {block.head.map((h, i) => (
                  <th key={i} scope="col">
                    {h[lang]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i}>
                  <th scope="row">{r[0][lang]}</th>
                  <td>{r[1][lang]}</td>
                  <td>{r[2][lang]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      );
  }
}
