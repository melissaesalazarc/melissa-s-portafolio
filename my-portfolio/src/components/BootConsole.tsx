import { useEffect, useRef, useState } from "react";
import { useT } from "../lib/i18n";
import "./BootConsole.css";

// El Cerro de la Silla en ASCII, como firma del arranque.
const SILLA = String.raw`
             /\
            /  \_            /\
           /     \_         /  \
          /        \_      /    \_
         /           \____/       \__
  ______/                            \________`;

const STEP_MS = 70;
const SEEN_KEY = "esquina:booted";

function alreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

/* Arranque tipo consola. Corto, se puede saltar, y no aparece con
   «reducir movimiento» ni la segunda vez que se carga en la sesión. */
export default function BootConsole({ sceneReady, onDone }: { sceneReady: boolean; onDone: () => void }) {
  const t = useT();
  const lines = t.boot;
  const [skip] = useState(
    () => alreadySeen() || window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [shown, setShown] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* sin almacenamiento: no pasa nada */
    }
    setLeaving(true);
    window.setTimeout(onDone, 250);
  };

  useEffect(() => {
    if (skip) {
      onDone();
      return;
    }
    if (shown < lines.length) {
      const id = window.setTimeout(() => setShown((n) => n + 1), STEP_MS);
      return () => clearTimeout(id);
    }
    // El título tiene que leerse en ~1 s: no se espera a la escena más de lo justo.
    const id = window.setTimeout(finish, sceneReady ? 80 : 160);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, shown, sceneReady]);

  useEffect(() => {
    if (skip) return;
    const onKey = () => finish();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  if (skip) return null;

  return (
    <div className={`boot${leaving ? " boot--leaving" : ""}`} role="status" aria-live="polite" onClick={finish}>
      <pre className="boot__log">
        <code>
          <span className="boot__art" aria-hidden="true">
            {SILLA}
            {"\n\n"}
          </span>
          {lines.slice(0, shown).map((l) => (
            <span key={l} className="boot__line">
              {l}
              {"\n"}
            </span>
          ))}
          <span className="boot__caret" aria-hidden="true" />
        </code>
      </pre>
      <button type="button" className="boot__skip" onClick={finish}>
        {t.bootSkip}
      </button>
    </div>
  );
}
