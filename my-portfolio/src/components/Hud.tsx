import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ROUTES, goTo, setLight, useLight } from "../lib/street";
import { setLang, useLang, useT } from "../lib/i18n";
import "./Hud.css";

function useMonterreyTime() {
  const lang = useLang();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);
  return new Intl.DateTimeFormat(lang === "es" ? "es-MX" : "en-US", {
    timeZone: "America/Monterrey",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
}

/* El semáforo sigue a la sección: siga en la esquina, precaución en los casos, alto en contacto. */
function useSection(pathname: string) {
  const [current, setCurrent] = useState("home");
  useEffect(() => {
    if (pathname !== "/") {
      setCurrent("case");
      return;
    }
    const ids = ["home", ...ROUTES.map((r) => r.id)];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setCurrent(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  useEffect(() => {
    if (current === "case") return;
    setLight(current === "contact" ? "alto" : current === "home" ? "siga" : "precaucion");
  }, [current]);
  return current;
}

/* La barra se pinta de rojo ALTO solo cuando contacto ya llegó hasta arriba. */
function useContactUnderBar(pathname: string) {
  const [under, setUnder] = useState(false);
  useEffect(() => {
    const el = document.getElementById("contact");
    if (!el) {
      setUnder(false);
      return;
    }
    const io = new IntersectionObserver(([e]) => setUnder(e.isIntersecting), {
      rootMargin: `0px 0px -${Math.max(0, window.innerHeight - 72)}px 0px`,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [pathname]);
  return under;
}

export default function Hud() {
  const t = useT();
  const lang = useLang();
  const time = useMonterreyTime();
  const light = useLight();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const current = useSection(pathname);
  const contactUnderBar = useContactUnderBar(pathname);

  // En el inicio se baja con scroll suave; desde un caso se regresa al inicio en esa sección.
  const go = (id: string) => {
    if (pathname === "/") goTo(id);
    else navigate(id === "home" ? "/" : `/#${id}`);
  };

  const tone = current === "home" ? "" : contactUnderBar ? " hud--solid hud--alto" : " hud--solid";

  return (
    <>
      <header className={`hud hud--top${tone}`}>
        <a
          className="hud__mark"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            go("home");
          }}
        >
          Melissa Salazar
        </a>
        <div className="hud__right">
          <nav aria-label={t.nav.label}>
            <ul className="hud__links">
              {ROUTES.map((r) => (
                <li key={r.id}>
                  <a
                    href={`/#${r.id}`}
                    aria-current={current === r.id ? "location" : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      go(r.id);
                    }}
                  >
                    {t.nav[r.key]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <button
            type="button"
            className="hud__toggle"
            lang={lang === "en" ? "es" : "en"}
            aria-label={t.langSwitch.aria}
            onClick={() => setLang(lang === "en" ? "es" : "en")}
          >
            {t.langSwitch.label}
          </button>
        </div>
      </header>

      <div className="hud hud--bottom">
        <span className="hud__readout" aria-hidden="true">
          25.6866° N · 100.3161° W
        </span>
        <span className={`hud__light hud__light--${light}`} aria-hidden="true">
          <span className="hud__dot" />
          {t.light[light]}
        </span>
        <span className="hud__readout" aria-hidden="true">
          MTY {time}
        </span>
      </div>
    </>
  );
}
