import { motion, type Variants } from "framer-motion";
import kanban from "../assets/casos/proyectos-kanban.webp";
import login from "../assets/casos/login.webp";
import celebraciones from "../assets/casos/celebraciones.webp";
import pos from "../assets/casos/codelum/nueva-orden-modificadores-producto-seleccionado-desktop.webp";
import me from "../assets/me.png";
import { Link } from "react-router";
import { useLang, useT } from "../lib/i18n";
import { UI } from "../content/cases";
import "./Sections.css";

const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

const inView = { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.25 } } as const;

// Página de cada caso.
const SLUGS: (string | null)[] = ["projects-tasks", "sign-in", "celebrations", "point-of-sale"];

const IMAGES: ({ src: string; w: number; h: number } | undefined)[] = [
  { src: kanban, w: 1440, h: 900 },
  { src: login, w: 1440, h: 900 },
  { src: celebraciones, w: 2880, h: 1620 },
  { src: pos, w: 2880, h: 2048 },
];

export function Casos() {
  const t = useT();
  const lang = useLang();
  return (
    <section id="work" className="casos" aria-labelledby="work-title">
      <motion.h2 id="work-title" className="section-title" variants={rise} {...inView}>
        {t.work.title}
      </motion.h2>
      <ol className="casos__list">
        {t.work.cases.map((c, idx) => (
          <li key={idx} className={`caso${idx % 2 ? " caso--flip" : ""}${SLUGS[idx] ? " caso--link" : ""}`}>
            {/* Marco del mismo tono de la noche; de la esquina solo queda la placa con la calle. */}
            <motion.figure className="cartel caso__media" variants={rise} {...inView} custom={0}>
              <div className="cartel__frame">
                {IMAGES[idx] ? (
                  <img src={IMAGES[idx]!.src} alt={c.alt ?? ""} width={IMAGES[idx]!.w} height={IMAGES[idx]!.h} loading="lazy" decoding="async" />
                ) : (
                  <div className="caso__pending">
                    <span className="caso__pending-sign">{t.work.pending}</span>
                  </div>
                )}
                <figcaption className="caso__street">{c.street}</figcaption>
              </div>
            </motion.figure>
            <div className="caso__text">
              <motion.h3 className="caso__title" variants={rise} {...inView} custom={2}>
                {SLUGS[idx] ? (
                  // El enlace cubre toda la tarjeta (ver .caso--link en CSS).
                  <Link className="caso__link" to={`/work/${SLUGS[idx]}`}>
                    {c.title}
                  </Link>
                ) : (
                  c.title
                )}
              </motion.h3>
              <motion.p className="caso__claim" variants={rise} {...inView} custom={3}>
                {c.claim}
              </motion.p>
              <motion.ul className="caso__facts" variants={rise} {...inView} custom={4}>
                {c.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </motion.ul>
              <motion.p className="caso__role" variants={rise} {...inView} custom={5}>
                {c.role}
              </motion.p>
              {SLUGS[idx] && (
                <motion.span className="caso__cta" aria-hidden="true" variants={rise} {...inView} custom={6}>
                  {UI.read[lang]}
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path d="M2 9h12M9 3.5 14.5 9 9 14.5" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </motion.span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function SobreMi() {
  const t = useT();
  return (
    <section id="about" className="sobre" aria-labelledby="about-title">
      <motion.h2 id="about-title" className="section-title" variants={rise} {...inView}>
        {t.about.title}
      </motion.h2>
      <div className="sobre__grid">
        {/* Un filete de neón rosa: el único eco de la esquina en esta sección. */}
        <motion.figure className="aparador" variants={rise} {...inView}>
          <span className="aparador__neon" aria-hidden="true" />
          <div className="aparador__glass">
            <img className="sobre__photo" src={me} alt={t.about.photoAlt} width={900} height={1100} loading="lazy" />
          </div>
          <figcaption className="aparador__plate">
            <span>Melissa Salazar</span>
            <span>Monterrey, N.L.</span>
          </figcaption>
        </motion.figure>
        <div className="sobre__text">
          <motion.p className="sobre__lead" variants={rise} {...inView} custom={1}>
            {t.about.lead}
          </motion.p>
          <motion.p variants={rise} {...inView} custom={2}>
            {t.about.body}
          </motion.p>
          <motion.dl className="sobre__facts" variants={rise} {...inView} custom={3}>
            {t.about.facts.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  );
}

const CONTACT = [
  { label: "email", value: "melissaesalazarc@gmail.com", href: "mailto:melissaesalazarc@gmail.com?subject=Hola%20Melissa" },
  { label: "LinkedIn", value: "in/melissaesalazarc", href: "https://www.linkedin.com/in/melissaesalazarc/" },
  { label: "GitHub", value: "melissaesalazarc", href: "https://github.com/melissaesalazarc" },
];

export function Contacto() {
  const t = useT();
  return (
    <section id="contact" className="contacto" aria-labelledby="contact-title">
      <motion.h2 id="contact-title" className="contacto__title" variants={rise} {...inView}>
        {t.contact.title1}
        <br />
        {t.contact.title2}
      </motion.h2>
      <ul className="contacto__list">
        {CONTACT.map((c, i) => (
          <motion.li key={c.label} variants={rise} {...inView} custom={i + 1}>
            <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
              <span className="contacto__label">{c.label === "email" ? t.contact.email : c.label}</span>
              <span className="contacto__value">{c.value}</span>
            </a>
          </motion.li>
        ))}
      </ul>
      <footer className="pie">
        <p className="pie__name" aria-hidden="true">
          Melissa Salazar
        </p>
        <p className="pie__legal">
          © {new Date().getFullYear()} · {t.contact.legal}
        </p>
      </footer>
    </section>
  );
}
