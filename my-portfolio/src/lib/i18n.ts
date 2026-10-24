import { useSyncExternalStore } from "react";

export type Lang = "en" | "es";

/* Inglés por defecto. El español se elige con el botón del HUD y se recuerda en este navegador. */
const KEY = "esquina:lang";

function initial(): Lang {
  try {
    return localStorage.getItem(KEY) === "es" ? "es" : "en";
  } catch {
    return "en";
  }
}

let lang: Lang = typeof window === "undefined" ? "en" : initial();
const listeners = new Set<() => void>();

export function setLang(next: Lang) {
  if (next === lang) return;
  lang = next;
  document.documentElement.lang = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* sin almacenamiento: solo dura esta visita */
  }
  listeners.forEach((l) => l());
}

export function getLang() {
  return lang;
}

export function useLang() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getLang,
    getLang,
  );
}

export function useT() {
  return COPY[useLang()];
}

type Case = {
  street: string;
  title: string;
  claim: string;
  facts: string[];
  role: string;
  alt?: string;
};

type Copy = {
  meta: { title: string; description: string };
  skip: string;
  boot: string[];
  bootSkip: string;
  nav: { work: string; about: string; contact: string; label: string; signsLabel: string };
  langSwitch: { label: string; aria: string };
  light: { siga: string; precaucion: string; alto: string };
  hero: { line1: string; line2: string; lead: string; cta: string; hint: string };
  signs: {
    avenue: string;
    avenueSub: string;
    street: string;
    streetSub: string;
    work: string;
    workSub: string;
    about: string;
    aboutSub: string;
    stop: string;
    contact: string;
    neon: string;
  };
  work: { title: string; pending: string; cases: Case[] };
  about: {
    title: string;
    photoAlt: string;
    lead: string;
    body: string;
    facts: [string, string][];
  };
  contact: { title1: string; title2: string; email: string; legal: string };
};

export const COPY: Record<Lang, Copy> = {
  en: {
    meta: {
      title: "Melissa Salazar · Product designer in Monterrey",
      description:
        "Product designer in Monterrey, Mexico. I design systems for complex operational software (ERPs, point of sale, dashboards) and build them in code.",
    },
    skip: "Skip to the work",
    boot: [
      "melissa.os 2026.10 — Monterrey, N.L.",
      "> raising the pole ............ ok",
      "> painting the blue signs ..... ok",
      "> powering the traffic light .. ok",
      "> firing up the grill ......... ok",
      "> welcome to the corner.",
    ],
    bootSkip: "Skip",
    nav: { work: "Work", about: "About", contact: "Contact", label: "Main", signsLabel: "Corner signs" },
    langSwitch: { label: "ES", aria: "Ver en español" },
    light: { siga: "Go", precaucion: "Caution", alto: "Stop" },
    hero: {
      line1: "I design systems",
      line2: "and build them.",
      lead:
        "I'm Melissa Salazar, a product designer in Monterrey, Mexico. I design the tools people work in all day, like ERPs, point-of-sale systems and dashboards, and I build them in code.",
      cta: "See the work",
      hint: "Scroll to turn the corner, or click a sign to jump ahead.",
    },
    signs: {
      avenue: "Melissa Salazar Ave.",
      avenueSub: "Product Design District",
      street: "Systems St.",
      streetSub: "Code District · Monterrey, N.L.",
      work: "Work",
      workSub: "ERP · POS · dashboards",
      about: "About",
      aboutSub: "Design + code",
      stop: "STOP",
      contact: "Contact",
      neon: "OPEN",
    },
    work: {
      title: "Work",
      pending: "Case study in progress",
      cases: [
        {
          street: "PEXSS · Plato Express ERP",
          title: "Projects & tasks",
          claim: "A module built in pieces, turned into one system.",
          facts: ["23 font sizes → 7 roles", "Measured AA contrast", "Light, dark and mobile"],
          role: "UI/UX design and front end · 2026",
          alt: "Redesigned Kanban board of the projects module, with stage columns and cards showing priority, progress and owners.",
        },
        {
          street: "PEXSS · Access",
          title: "Sign in",
          claim: "The front door the whole company walks through, every day.",
          facts: ["3 flows, 1 composition", "A button in 4 states", "0 requests while typing"],
          role: "UI/UX, motion and front end · 2026",
          alt: "Sign-in screen with a photo of a Plato Express dining room and green brand shapes.",
        },
        {
          street: "PEXSS · Announcements",
          title: "Celebrations",
          claim: "An automatic greeting that feels handmade.",
          facts: ["7 editorial pieces", "Fabric that ripples at 120 fps", "Never an “N/A”"],
          role: "Art direction and front end · 2026",
          alt: "Birthday modal with the person's name set large and green and pearl balloons.",
        },
        {
          street: "Codelum · Restaurants",
          title: "Point of sale",
          claim: "A restaurant POS any cashier, from 18 to 70, can use without help.",
          facts: ["Color-coded modifiers", "Split payments, 3 methods", "Register rules built in"],
          role: "Sole UX/UI designer · 2026",
        },
      ],
    },
    about: {
      title: "About",
      photoAlt: "Melissa Salazar sitting at her desk.",
      lead:
        "I studied Computer Science at Tec de Monterrey and ended up designing. Now I do both: I decide how an interface looks and behaves, and I build it.",
      body:
        "I'm drawn to the software people use all day to get work done: point of sale, ERPs, dashboards. There, clarity isn't decoration; it's what gets a tool adopted. I measure before I decide, design every state and write down why.",
      facts: [
        ["Now", "Web designer at Plato Express"],
        ["Before", "UX/UI designer at Codelum"],
        ["Tools", "Figma, React, Laravel, Claude Code"],
        ["Languages", "Spanish, English C1, German (intermediate)"],
      ],
    },
    contact: {
      title1: "This is your stop.",
      title2: "Say hi.",
      email: "Email",
      legal: "Designed and built in Monterrey with React and Three.js.",
    },
  },
  es: {
    meta: {
      title: "Melissa Salazar · Product designer en Monterrey",
      description:
        "Product designer en Monterrey. Diseño sistemas para software operativo complejo (ERP, punto de venta, dashboards) y los construyo en código.",
    },
    skip: "Saltar a los casos",
    boot: [
      "melissa.os 2026.10 — Monterrey, N.L.",
      "> montando el poste ............ ok",
      "> pintando placas azules ....... ok",
      "> encendiendo semáforo ......... ok",
      "> prendiendo el carbón ......... ok",
      "> bienvenida a la esquina.",
    ],
    bootSkip: "Saltar",
    nav: { work: "Casos", about: "Sobre mí", contact: "Contacto", label: "Principal", signsLabel: "Letreros de la esquina" },
    langSwitch: { label: "EN", aria: "View in English" },
    light: { siga: "Siga", precaucion: "Precaución", alto: "Alto" },
    hero: {
      line1: "Diseño sistemas",
      line2: "y los construyo.",
      lead:
        "Soy Melissa Salazar, product designer en Monterrey. Diseño las herramientas en las que la gente trabaja todo el día, como ERPs, puntos de venta y dashboards, y las construyo en código.",
      cta: "Ver casos",
      hint: "Baja con el scroll para doblar la esquina, o toca una placa para ir directo.",
    },
    signs: {
      avenue: "Av. Melissa Salazar",
      avenueSub: "Col. Diseño de producto",
      street: "Calle Sistemas",
      streetSub: "Col. Código · Monterrey, N.L.",
      work: "Casos",
      workSub: "ERP · POS · dashboards",
      about: "Sobre mí",
      aboutSub: "Diseño + código",
      stop: "ALTO",
      contact: "Contacto",
      neon: "ABIERTO",
    },
    work: {
      title: "Casos",
      pending: "Caso en preparación",
      cases: [
        {
          street: "PEXSS · ERP de Plato Express",
          title: "Proyectos y tareas",
          claim: "Un módulo hecho por partes, convertido en un solo sistema.",
          facts: ["23 tamaños de letra → 7 roles", "Contraste AA medido", "Claro, oscuro y celular"],
          role: "Diseño UI/UX y frontend · 2026",
          alt: "Tablero Kanban rediseñado del módulo de proyectos, con columnas por etapa y tarjetas con prioridad, avance y responsables.",
        },
        {
          street: "PEXSS · Acceso",
          title: "Inicio de sesión",
          claim: "La puerta de entrada que ve toda la empresa, todos los días.",
          facts: ["3 flujos, 1 composición", "Botón en 4 tiempos", "0 peticiones al teclear"],
          role: "Diseño UI/UX, movimiento y frontend · 2026",
          alt: "Pantalla de inicio de sesión con fotografía de un comedor de Plato Express y formas de marca en verde.",
        },
        {
          street: "PEXSS · Anuncios",
          title: "Celebraciones",
          claim: "Una felicitación automática que se siente hecha a mano.",
          facts: ["7 piezas editoriales", "Telas que ondulan a 120 fps", "Nunca un «N/A»"],
          role: "Dirección de arte y frontend · 2026",
          alt: "Modal de cumpleaños con el nombre de la persona en grande y globos verdes y nacarados.",
        },
        {
          street: "Codelum · Restaurantes",
          title: "Punto de venta",
          claim: "Un punto de venta que cualquier cajero, de 18 a 70 años, usa sin ayuda.",
          facts: ["Modificadores con reglas de color", "Pagos divididos en 3 métodos", "Reglas de caja integradas"],
          role: "Única diseñadora UX/UI · 2026",
        },
      ],
    },
    about: {
      title: "Sobre mí",
      photoAlt: "Melissa Salazar sentada frente a su escritorio de trabajo.",
      lead:
        "Estudié Ingeniería en Computación en el Tec de Monterrey y terminé diseñando. Hoy hago las dos cosas: decido cómo se ve y se comporta una interfaz, y la construyo.",
      body:
        "Me gusta el software que la gente usa todo el día para trabajar: puntos de venta, ERPs, dashboards. Ahí la claridad no es decoración: es lo que hace que una herramienta se adopte. Mido antes de decidir, diseño cada estado y dejo escrito el porqué.",
      facts: [
        ["Ahora", "Web designer en Plato Express"],
        ["Antes", "UX/UI en Codelum"],
        ["Herramientas", "Figma, React, Laravel, Claude Code"],
        ["Idiomas", "Español, inglés C1, alemán intermedio"],
      ],
    },
    contact: {
      title1: "Aquí te paras.",
      title2: "Escríbeme.",
      email: "Correo",
      legal: "Diseñado y construido en Monterrey con React y Three.js.",
    },
  },
};
