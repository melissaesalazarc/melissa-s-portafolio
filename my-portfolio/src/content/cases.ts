/* Casos de estudio. Todo sale de los casos reales de PEXSS; las cifras internas de la
   empresa van anonimizadas. Estructura: Double Diamond (Discover, Define, Develop, Deliver). */
import type { Lang } from "../lib/i18n";

import pBeforeDash from "../assets/casos/proyectos/before-dark-desk-dashboard-general.webp";
import pAfterDash from "../assets/casos/proyectos/after-dark-desk-dashboard-general.webp";
import pBeforeTask from "../assets/casos/proyectos/before-light-desk-nueva-tarea.webp";
import pAfterTask from "../assets/casos/proyectos/after-light-desk-nueva-tarea.webp";
import pBeforeIndex from "../assets/casos/proyectos/before-light-desk-indice.webp";
import pAfterIndex from "../assets/casos/proyectos/after-light-desk-indice.webp";
import pMobKanban from "../assets/casos/proyectos/after-light-mob-tablero-kanban.webp";
import pMobDetail from "../assets/casos/proyectos/after-light-mob-detalle-tarea.webp";
import pDarkKanban from "../assets/casos/proyectos/after-dark-desk-tablero-kanban.webp";

import lBefore from "../assets/casos/login/before-desk-login.webp";
import lAfter from "../assets/casos/login/after-desk-login.webp";
import lBeforePass from "../assets/casos/login/before-desk-change-segura.webp";
import lAfterPass from "../assets/casos/login/after-desk-change-segura.webp";
import lBeforeError from "../assets/casos/login/before-desk-login-error.webp";
import lAfterError from "../assets/casos/login/after-desk-login-error.webp";
import lBeforeSent from "../assets/casos/login/before-desk-forgot-enviado.webp";
import lAfterSent from "../assets/casos/login/after-desk-forgot-enviado.webp";
import lMob from "../assets/casos/login/after-mob-login.webp";
import lMobPass from "../assets/casos/login/after-mob-change-segura.webp";

import cBefore from "../assets/casos/celebraciones/poster-antes.webp";
import cAfter from "../assets/casos/celebraciones/poster-despues.webp";
import cGlobos from "../assets/casos/celebraciones/globos.webp";
import cAniversario from "../assets/casos/celebraciones/aniversario-laboral.webp";

import kOrder from "../assets/casos/codelum/nueva-orden-desktop.webp";
import kModProduct from "../assets/casos/codelum/nueva-orden-modificadores-producto-seleccionado-desktop.webp";
import kModCombo from "../assets/casos/codelum/nueva-orden-modificadores-combo-seleccionado-desktop.webp";
import kPay3 from "../assets/casos/codelum/nueva-orden-pagar-3-metodos-desktop.webp";
import kComboPhone from "../assets/casos/codelum/nueva-orden-modificadores-combo-iphone.webp";
import kPayPhone from "../assets/casos/codelum/nueva-orden-pagar-iphone.webp";
import kComboPad from "../assets/casos/codelum/nueva-orden-modificadores-combo-ipad.webp";
import kPayPad from "../assets/casos/codelum/nueva-orden-pagar-ipad-mini-v.webp";
import kClose from "../assets/casos/codelum/caja-registradora-cerrar-inline-con-discrepancia-desktop.webp";
import kSessions from "../assets/casos/codelum/caja-registradora-sesiones-desktop.webp";
import kProductMods from "../assets/casos/codelum/producto-nuevo-producto-modificadores-todo-configurado-desktop.webp";
import kProductPrices from "../assets/casos/codelum/producto-nuevo-producto-precios-con-precios-desktop.webp";
import kTokens from "../assets/casos/codelum/design-tokens.webp";

export type Img = { src: string; w: number; h: number };
type L = Record<Lang, string>;

export type Block =
  | { kind: "text"; body: L[] }
  | { kind: "list"; items: L[] }
  | { kind: "compare"; before: Img; after: Img; caption: L }
  | { kind: "image"; img: Img; caption: L; wide?: boolean; crop?: boolean }
  | { kind: "pair"; a: Img; b: Img; caption: L; phone?: boolean }
  | { kind: "quote"; body: L }
  | { kind: "decision"; title: L; body: L }
  | { kind: "demo"; before: string; after: string; poster: Img; caption: L }
  | { kind: "video"; mp4: string; webm: string; poster: Img; caption: L }
  | { kind: "table"; head: [L, L, L]; rows: [L, L, L][] };

export type Phase = { id: "discover" | "define" | "develop" | "deliver"; title: L; lead: L; blocks: Block[] };

export type Case = {
  slug: string;
  title: L;
  summary: L;
  meta: { label: L; value: L }[];
  cover: Img;
  impact: { value: string; label: L }[];
  context: L[];
  phases: Phase[];
  outcome: Block[];
  learned: { title: L; body: L }[];
  next: L[];
};

const desk = (src: string): Img => ({ src, w: 1440, h: 900 });
const phone = (src: string): Img => ({ src, w: 780, h: 1688 });

export const PHASES: Record<Phase["id"], L> = {
  discover: { en: "Discover", es: "Descubrir" },
  define: { en: "Define", es: "Definir" },
  develop: { en: "Develop", es: "Desarrollar" },
  deliver: { en: "Deliver", es: "Entregar" },
};

export const UI = {
  back: { en: "All work", es: "Todos los casos" },
  read: { en: "Read the case", es: "Ver el caso" },
  atAGlance: { en: "At a glance", es: "En corto" },
  context: { en: "The problem", es: "El problema" },
  outcome: { en: "What changed", es: "Qué cambió" },
  learned: { en: "What I learned", es: "Qué aprendí" },
  next: { en: "What I'd do next", es: "Qué sigue" },
  nextCase: { en: "Next case", es: "Siguiente caso" },
  before: { en: "Before", es: "Antes" },
  after: { en: "After", es: "Después" },
  compareHint: { en: "Drag to compare", es: "Desliza para comparar" },
  compareLabel: { en: "Compare before and after", es: "Comparar antes y después" },
  playDemo: { en: "Play the live piece", es: "Ver la pieza en vivo" },
  pause: { en: "Pause video", es: "Pausar video" },
  play: { en: "Play video", es: "Reproducir video" },
  demoBefore: { en: "Live demo, before", es: "Demo en vivo, antes" },
  demoAfter: { en: "Live demo, after", es: "Demo en vivo, después" },
  process: {
    en: "Each case follows the Double Diamond: find out what's going on, define the problem, develop the solution, deliver it.",
    es: "Cada caso sigue el Double Diamond: descubrir qué pasa de verdad, definir el problema, desarrollar la solución y entregarla.",
  },
};

/* ---------------------------------------------------------------- Proyectos */

const proyectos: Case = {
  slug: "projects-tasks",
  title: { en: "Projects & tasks", es: "Proyectos y tareas" },
  summary: {
    en: "I turned a project-management module built in pieces into one system, while the dev team kept shipping new features on top of it.",
    es: "Convertí un módulo de gestión de proyectos hecho por partes en un solo sistema, mientras el equipo de desarrollo seguía agregándole funciones.",
  },
  meta: [
    { label: { en: "Product", es: "Producto" }, value: { en: "PEXSS, Plato Express's internal ERP", es: "PEXSS, el ERP interno de Plato Express" } },
    { label: { en: "My role", es: "Mi rol" }, value: { en: "Product design and front end", es: "Diseño de producto y frontend" } },
    { label: { en: "Timeline", es: "Periodo" }, value: { en: "July – August 2026", es: "Julio – agosto 2026" } },
    { label: { en: "Stack", es: "Stack" }, value: { en: "Laravel, Livewire, Alpine.js, Tailwind, ApexCharts", es: "Laravel, Livewire, Alpine.js, Tailwind, ApexCharts" } },
  ],
  cover: desk(pDarkKanban),
  impact: [
    { value: "23 → 7", label: { en: "font sizes turned into 7 type roles", es: "tamaños de letra convertidos en 7 roles" } },
    { value: "8 → 4", label: { en: "controls in the board header", es: "controles en el encabezado del tablero" } },
    { value: "2.15 → 5.02", label: { en: "contrast ratio of the amber data color", es: "contraste del ámbar en las gráficas" } },
    { value: "19", label: { en: "screens redesigned in light, dark and mobile", es: "pantallas rediseñadas en claro, oscuro y celular" } },
  ],
  context: [
    {
      en: "Projects & tasks is where every area of the company plans its work: new dining-room openings, renovations, audits, internal builds. It grew fast and in parts: an index, a board with five views, a task modal, public forms, a shared board and three dashboards.",
      es: "Proyectos y tareas es donde todas las áreas de la empresa planean su trabajo: aperturas de comedores, renovaciones, auditorías, desarrollos internos. Creció rápido y por partes: un índice, un tablero con cinco vistas, el modal de tarea, formularios públicos, un tablero compartido y tres dashboards.",
    },
    {
      en: "Each piece had its own style, its own words and its own colors. People could use it, but it didn't feel like one product, and the charts didn't help anyone decide anything.",
      es: "Cada pieza tenía su propio estilo, sus propias palabras y sus propios colores. Se podía usar, pero no se sentía como un solo producto, y las gráficas no ayudaban a decidir nada.",
    },
  ],
  phases: [
    {
      id: "discover",
      title: { en: "Auditing the whole module", es: "Auditar el módulo completo" },
      lead: {
        en: "Before touching a pixel I went through every screen, measured what was there and wrote down what was getting in people's way.",
        es: "Antes de mover un pixel recorrí cada pantalla, medí lo que había y anoté qué le estorbaba a la gente.",
      },
      blocks: [
        {
          kind: "list",
          items: [
            { en: "No system. Buttons, menus, modals and tables were solved differently on every screen, with loose hex values and third-party components that brought their own look.", es: "Sin sistema. Botones, menús, modales y tablas se resolvían distinto en cada pantalla, con hex sueltos y componentes de terceros con su propio estilo." },
            { en: "Flat hierarchy. The board header had eight buttons of the same weight that did three different jobs: navigate, change status and act.", es: "Jerarquía plana. El encabezado del tablero tenía ocho botones del mismo peso que en realidad eran tres cosas: navegar, cambiar el estado y actuar." },
            { en: "Confusing words. The task's “Status” field didn't store a status: it stored the board column. And it clashed with the project's own “Status” (Draft, Active, Paused).", es: "Palabras confusas. El campo «Estatus» de la tarea no guardaba un estado: guardaba la columna del tablero. Y chocaba con el «Estado» del proyecto (Borrador, Activo, En pausa)." },
            { en: "Color without meaning. Charts assigned colors by position, so “Blocked” was violet in one chart and red on the board, and a project at 100 % showed up in red.", es: "Color sin significado. Las gráficas asignaban colores por posición: «Bloqueado» salía violeta en una gráfica y rojo en el tablero, y un proyecto al 100 % aparecía en rojo." },
            { en: "23 different font sizes, and weights up to 900. Data colors below AA (amber at 2.15:1) and a half-finished dark mode with borders at 1.12:1.", es: "23 tamaños de letra distintos y pesos hasta 900. Colores de datos por debajo de AA (ámbar a 2.15:1) y un modo oscuro a medias con bordes a 1.12:1." },
          ],
        },
        {
          kind: "compare",
          before: desk(pBeforeIndex),
          after: desk(pAfterIndex),
          caption: {
            en: "Project index, before and after. Same data, same features: KPIs now carry context (“57 % of the portfolio”) and each row shows owner, priority, due date and progress.",
            es: "Índice de proyectos, antes y después. Mismos datos, mismas funciones: los KPIs ahora tienen contexto («57 % del portafolio») y cada fila muestra responsable, prioridad, fecha compromiso y avance.",
          },
        },
      ],
    },
    {
      id: "define",
      title: { en: "One question to design against", es: "Una pregunta para diseñar" },
      lead: {
        en: "The audit pointed to one problem, not nineteen. So I wrote it as a single question and set goals I could check.",
        es: "La auditoría apuntaba a un problema, no a diecinueve. Lo escribí como una sola pregunta y puse objetivos que se pudieran comprobar.",
      },
      blocks: [
        {
          kind: "quote",
          body: {
            en: "How do we make a module built in pieces feel like one product, where every screen answers “what's going on and what do I do next”, without slowing down the team that keeps building it?",
            es: "¿Cómo hacemos que un módulo construido por partes se sienta como un solo producto, donde cada pantalla responda rápido «qué está pasando y qué tengo que hacer», sin frenar al equipo que lo sigue construyendo?",
          },
        },
        {
          kind: "list",
          items: [
            { en: "A system, not screens: tokens, a type scale and a component canon any new screen inherits.", es: "Un sistema, no pantallas sueltas: tokens, escala tipográfica y un canon de componentes que cualquier pantalla nueva herede." },
            { en: "One primary action per screen, information in the order people decide.", es: "Una acción principal por pantalla y la información en el orden en que se decide." },
            { en: "Every label says what the field stores.", es: "Que cada etiqueta diga lo que el campo guarda." },
            { en: "Charts that read themselves: the shape of the data, colors with meaning, a sentence with the finding.", es: "Gráficas que se leen solas: la forma del dato, colores con significado y una frase con el hallazgo." },
            { en: "Measured AA contrast in light, dark and on a 390 px phone.", es: "Contraste AA medido en claro, oscuro y en un celular de 390 px." },
          ],
        },
      ],
    },
    {
      id: "develop",
      title: { en: "Building the system", es: "Construir el sistema" },
      lead: {
        en: "I designed the visual system first and then rebuilt every screen on top of it. These are the decisions that mattered most.",
        es: "Primero diseñé el sistema visual y después reconstruí cada pantalla encima. Estas son las decisiones que más pesaron.",
      },
      blocks: [
        {
          kind: "decision",
          title: { en: "Fewer controls instead of quieter ones", es: "Quitar controles en vez de apagarlos" },
          body: {
            en: "The board header went from eight equal buttons to four controls with three weights and a single primary action. Removing the borders from two buttons only created two styles on one screen; removing the buttons fixed it.",
            es: "El encabezado del tablero pasó de ocho botones iguales a cuatro controles con tres pesos y una sola acción principal. Quitarle el borde a dos botones solo creaba dos estilos en la misma pantalla; quitar botones lo resolvió.",
          },
        },
        {
          kind: "decision",
          title: { en: "“Status” became “Column”", es: "«Estatus» se volvió «Columna»" },
          body: {
            en: "Kanban columns are stages of a flow, not abstract states. Renaming the field to what people actually see on the board cleared up more confusion than any visual change.",
            es: "Las columnas del Kanban son etapas de un flujo, no estados abstractos. Llamar al campo como lo que la gente ve en el tablero resolvió más confusión que cualquier ajuste visual.",
          },
        },
        {
          kind: "compare",
          before: desk(pBeforeTask),
          after: desk(pAfterTask),
          caption: {
            en: "New task. The footer now says exactly what's missing (“Missing title, owner, priority…”) instead of a disabled button with no explanation.",
            es: "Nueva tarea. El pie ahora dice exactamente qué falta («Faltan título, responsable, prioridad…») en lugar de un botón deshabilitado sin explicación.",
          },
        },
        {
          kind: "decision",
          title: { en: "The shape follows the data", es: "La forma sigue al dato" },
          body: {
            en: "I stopped picking charts for variety. Squares when you count units, stages for a flow, a gauge for closing speed, thin bars to compare people. Each color is fixed to an entity (a priority, a column), never to a position. And every chart opens with the finding: “Medium priority dominates”.",
            es: "Dejé de elegir gráficas para variar. Cuadros cuando se cuentan unidades, etapas para un flujo, un medidor para la velocidad de cierre, barras finas para comparar personas. Cada color está fijo a una entidad (una prioridad, una columna), nunca a una posición. Y cada gráfica abre con el hallazgo: «Predomina prioridad media».",
          },
        },
        {
          kind: "compare",
          before: desk(pBeforeDash),
          after: desk(pAfterDash),
          caption: {
            en: "The general dashboard now starts with the question people come with: “What's due this week?”",
            es: "El dashboard general ahora arranca con la pregunta con la que llega la gente: «¿Qué se vence esta semana?»",
          },
        },
        {
          kind: "decision",
          title: { en: "Color has to be earned", es: "El color se gana" },
          body: {
            en: "What's on track stays neutral; color only shows up where there's a problem. Seven type roles (9 to 24 px) and two weights replaced 23 sizes, set in px on purpose because the ERP scales its root to 76 %.",
            es: "Lo que está en orden queda neutro; el color solo aparece donde hay un problema. Siete roles tipográficos (de 9 a 24 px) y dos pesos reemplazaron 23 tamaños, en px a propósito porque el ERP escala su raíz al 76 %.",
          },
        },
        {
          kind: "pair",
          a: phone(pMobKanban),
          b: phone(pMobDetail),
          phone: true,
          caption: {
            en: "On a phone: the board and the task detail with one column and a single scroll.",
            es: "En celular: el tablero y el detalle de tarea con una columna y un solo scroll.",
          },
        },
      ],
    },
    {
      id: "deliver",
      title: { en: "Shipping inside a live team", es: "Entregar dentro de un equipo vivo" },
      lead: {
        en: "The module changed every week while I redesigned it. Midway, merging with the team's parallel work wiped out most of my first pass: about 17,500 lines across 43 files.",
        es: "El módulo cambiaba cada semana mientras lo rediseñaba. A la mitad, al integrarse con el trabajo paralelo del equipo, se perdió casi todo mi primer rediseño: unas 17,500 líneas en 43 archivos.",
      },
      blocks: [
        {
          kind: "text",
          body: [
            {
              en: "I rebuilt it from eight specs I had kept outside the repo, and that's where an integration protocol came from. The team's logic wins: whatever they add or remove functionally stays. The design wins: anything that arrives with loose colors gets re-dressed in the canon, keeping its behavior. New things get marked: new features were tinted violet so everyone could spot them until their final design landed.",
              es: "Lo reconstruí desde ocho especificaciones que había guardado fuera del repositorio, y de ahí salió un protocolo de integración. La lógica del equipo gana: lo que agregan o quitan funcionalmente se respeta. El diseño gana: lo que llega con colores sueltos se re-viste al canon, conservando su función. Lo nuevo se marca: las funciones nuevas se pintaban de violeta para identificarlas hasta tener su diseño final.",
            },
            {
              en: "I designed and implemented the front end myself in Laravel, Livewire, Alpine.js and CSS, with an AI-assisted workflow in Claude Code. I made the design decisions, directed every change and reviewed every screen in light, dark and at 390 px. Every decision went into a log with its context and its reason.",
              es: "Diseñé e implementé yo misma el frontend en Laravel, Livewire, Alpine.js y CSS, con un flujo asistido por IA en Claude Code. Las decisiones de diseño fueron mías, dirigí cada cambio y revisé cada pantalla en claro, oscuro y a 390 px. Cada decisión quedó en una bitácora con su contexto y su porqué.",
            },
          ],
        },
        {
          kind: "video",
          mp4: "/media/casos/proyectos-tablero.mp4",
          webm: "/media/casos/proyectos-tablero.webm",
          poster: { src: "/media/casos/proyectos-tablero-poster.webp", w: 2560, h: 1600 },
          caption: {
            en: "The real board in dark mode: switching views, charts drawing in with their data, and the task detail. Everything switches off with “reduce motion”.",
            es: "El tablero real en modo oscuro: cambio de vistas, gráficas que se dibujan con su dato y el detalle de tarea. Todo se apaga con «reducir movimiento».",
          },
        },
        {
          kind: "list",
          items: [
            { en: "Measure before moving: computed styles, real sizes and contrast instead of eyeballing.", es: "Medir antes de mover: estilos calculados, tamaños reales y contraste en lugar de ajustar a ojo." },
            { en: "A tool-assisted sweep of 27 desktop and 14 mobile surfaces checked every text against the scale.", es: "Un barrido con herramienta de 27 superficies de escritorio y 14 responsivas revisó cada texto contra la escala." },
            { en: "Permission-only screens checked by impersonation. That's how “My team” showed up, a view nobody had redesigned.", es: "Pantallas que solo ven ciertos permisos, revisadas con impersonación. Así apareció «Mi equipo», una vista que nadie había rediseñado." },
          ],
        },
      ],
    },
  ],
  outcome: [
    {
      kind: "table",
      head: [{ en: "", es: "" }, { en: "Before", es: "Antes" }, { en: "After", es: "Después" }],
      rows: [
        [{ en: "Type", es: "Tipografía" }, { en: "23 sizes, weights up to 900", es: "23 tamaños, pesos hasta 900" }, { en: "7 roles, 2 weights", es: "7 roles, 2 pesos" }],
        [{ en: "Board header", es: "Encabezado del tablero" }, { en: "8 equal buttons", es: "8 botones iguales" }, { en: "4 controls, 1 primary action", es: "4 controles, 1 acción principal" }],
        [{ en: "Vocabulary", es: "Vocabulario" }, { en: "Task “Status” vs project “Status”", es: "«Estatus» de tarea vs «Estado» de proyecto" }, { en: "“Column” for tasks everywhere", es: "«Columna» para la tarea en todo el módulo" }],
        [{ en: "Chart color", es: "Color en gráficas" }, { en: "By position", es: "Por posición" }, { en: "Fixed per priority and column", es: "Fijo por prioridad y columna" }],
        [{ en: "Contrast", es: "Contraste" }, { en: "Red 3.75:1, amber 2.15:1", es: "Rojo 3.75:1, ámbar 2.15:1" }, { en: "4.71:1 and 5.02:1, no new colors", es: "4.71:1 y 5.02:1, sin colores nuevos" }],
        [{ en: "Modals", es: "Modales" }, { en: "Each with its own design", es: "Cada uno con su diseño" }, { en: "One canon, 31 Cancel buttons aligned", es: "Un canon; 31 botones «Cancelar» alineados" }],
      ],
    },
    {
      kind: "image",
      img: desk(pDarkKanban),
      wide: true,
      caption: { en: "Dark mode, measured: every token has its dark pair.", es: "Modo oscuro medido: cada token tiene su par oscuro." },
    },
  ],
  learned: [
    {
      title: { en: "Measure before you argue", es: "Medir antes de opinar" },
      body: {
        en: "When something “felt off” and I couldn't name it, measuring found it: the only block of color on the card, a button shape nobody could justify.",
        es: "Cuando algo «no me convencía» y no sabía nombrarlo, medir lo encontró: el único bloque de color de la ficha, una forma de botón que nadie podía justificar.",
      },
    },
    {
      title: { en: "Words are interface", es: "Las palabras también son interfaz" },
      body: {
        en: "Changing “Status” to “Column” fixed more than any visual tweak.",
        es: "Cambiar «Estatus» por «Columna» resolvió más que cualquier ajuste visual.",
      },
    },
    {
      title: { en: "Designing inside a live team needs a protocol", es: "Diseñar dentro de un equipo vivo pide protocolo" },
      body: {
        en: "“Their logic wins, the design wins, new things get marked” let me integrate without fighting. And the day the redesign got wiped, the specs I'd kept outside the repo saved it.",
        es: "«La lógica del equipo gana, el diseño gana, lo nuevo se marca» me dejó integrar sin pelear. Y el día que el rediseño se borró, las especificaciones fuera del repositorio lo salvaron.",
      },
    },
    {
      title: { en: "A visible path isn't a perceived one", es: "Una ruta visible no es una ruta percibida" },
      body: {
        en: "I removed the back button because the breadcrumb was there. The team couldn't find their way out, so it came back.",
        es: "Quité el botón de volver porque el breadcrumb ya estaba ahí. El equipo no encontraba cómo salir, así que regresó.",
      },
    },
  ],
  next: [
    { en: "Usability tests on real tasks, before and after: “find what's due this week”, “create a task with two owners”.", es: "Pruebas con usuarios en tareas reales, antes y después: «encuentra lo que se vence esta semana», «crea una tarea con dos responsables»." },
    { en: "Dark mode for the public shared board.", es: "Modo oscuro para el tablero compartido público." },
    { en: "A status palette for boards with more than eight columns.", es: "Una paleta de estados para tableros con más de ocho columnas." },
  ],
};

/* ---------------------------------------------------------------- Login */

const login: Case = {
  slug: "sign-in",
  title: { en: "Sign in", es: "Inicio de sesión" },
  summary: {
    en: "The first screen of the ERP, seen by the whole company every day. I made it feel like Plato Express and made every step say what's happening.",
    es: "La primera pantalla del ERP, la que ve toda la empresa todos los días. Hice que se sintiera de Plato Express y que cada paso dijera qué está pasando.",
  },
  meta: [
    { label: { en: "Product", es: "Producto" }, value: { en: "PEXSS, Plato Express's internal ERP", es: "PEXSS, el ERP interno de Plato Express" } },
    { label: { en: "My role", es: "Mi rol" }, value: { en: "UI/UX, motion, microcopy and front end", es: "UI/UX, movimiento, microcopy y frontend" } },
    { label: { en: "Scope", es: "Alcance" }, value: { en: "Sign in, forgot password, new password", es: "Iniciar sesión, recuperar y crear contraseña" } },
    { label: { en: "Stack", es: "Stack" }, value: { en: "Laravel, Livewire, Alpine.js, CSS", es: "Laravel, Livewire, Alpine.js, CSS" } },
  ],
  cover: desk(lAfter),
  impact: [
    { value: "3 → 1", label: { en: "visual language for the three access flows", es: "lenguaje visual para los tres flujos de acceso" } },
    { value: "2.5 s → 10 s", label: { en: "to read the reset confirmation, with “Go now”", es: "para leer la confirmación, con «Ir ahora»" } },
    { value: "1 → 0", label: { en: "server requests per keystroke on new password", es: "peticiones al servidor por tecla en nueva contraseña" } },
    { value: "4", label: { en: "bugs found and fixed on the way", es: "bugs encontrados y corregidos en el camino" } },
  ],
  context: [
    {
      en: "Nobody works in PEXSS without going through this screen. The old one was a generic card from the component library, centered over a pattern of kitchen icons, with small text and pop-ups that closed by themselves after 2.5 seconds.",
      es: "Nadie trabaja en PEXSS sin pasar por esta pantalla. La anterior era una tarjeta genérica de la librería de componentes, centrada sobre un patrón de íconos de cocina, con textos chicos y ventanas emergentes que se cerraban solas a los 2.5 segundos.",
    },
    {
      en: "The users range from office staff to operations, with a wide range of digital experience, on computers and phones.",
      es: "La usan desde personal de oficina hasta operación, con niveles muy distintos de experiencia digital, en computadora y en celular.",
    },
  ],
  phases: [
    {
      id: "discover",
      title: { en: "Walking every step of access", es: "Recorrer cada paso del acceso" },
      lead: {
        en: "Access is three moments: sign in, ask for a temporary password, create a new one. They were three screens with three styles and even two different logos.",
        es: "El acceso son tres momentos: iniciar sesión, pedir una contraseña temporal y crear una nueva. Eran tres pantallas con tres estilos y hasta dos logotipos distintos.",
      },
      blocks: [
        {
          kind: "list",
          items: [
            { en: "No system status. Pressing “Sign in” only dimmed the button. No text, no progress.", es: "Sin estado del sistema. Al enviar, el botón solo se atenuaba. Ni texto ni progreso." },
            { en: "Errors far from their cause: a red box under the button, away from the fields.", es: "Errores lejos de su causa: una caja roja debajo del botón, lejos de los campos." },
            { en: "Messages nobody could read: the reset confirmations closed after 2.5 and 3 seconds and redirected.", es: "Mensajes que no se alcanzaban a leer: las confirmaciones se cerraban a los 2.5 y 3 segundos y redirigían." },
            { en: "A confirmation that never showed: after a new password, the redirect killed the success message.", es: "Una confirmación que nunca se veía: después de crear la contraseña, la redirección cerraba el aviso de éxito." },
            { en: "Password rules shown only by color, all red from the start. Indistinguishable for colorblind people.", es: "Requisitos de contraseña solo por color, todos rojos desde el inicio. Indistinguibles para alguien con daltonismo." },
          ],
        },
        {
          kind: "compare",
          before: desk(lBefore),
          after: desk(lAfter),
          caption: { en: "Sign in, before and after.", es: "Inicio de sesión, antes y después." },
        },
      ],
    },
    {
      id: "define",
      title: { en: "A front door that feels like ours", es: "Una puerta de entrada que se sienta propia" },
      lead: {
        en: "Business logic, password rules and emails stayed untouched. This was an interface problem.",
        es: "La lógica de autenticación, las reglas de contraseña y los correos no se tocaban. Era un problema de interfaz.",
      },
      blocks: [
        {
          kind: "quote",
          body: {
            en: "How do we make the way into the system feel like ours, clear and trustworthy, so at every step people know what's happening and what comes next?",
            es: "¿Cómo hacemos que la puerta de entrada al sistema se sienta propia, clara y confiable, y que en cada paso la persona sepa qué está pasando y qué sigue?",
          },
        },
        {
          kind: "list",
          items: [
            { en: "Identity: recognizable as Plato Express at first glance.", es: "Identidad: que se reconozca como de Plato Express al primer vistazo." },
            { en: "Visible state: instant feedback and results long enough to read.", es: "Estado visible: retroalimentación inmediata y resultados que se alcancen a leer." },
            { en: "Recoverable errors: next to the field, in plain language, without blame.", es: "Errores recuperables: junto al campo, en lenguaje claro y sin culpar." },
            { en: "Accessible and light: contrast, focus, screen readers and “reduce motion”.", es: "Accesible y ligero: contraste, foco, lectores de pantalla y «reducir movimiento»." },
          ],
        },
      ],
    },
    {
      id: "develop",
      title: { en: "Composition, motion and states", es: "Composición, movimiento y estados" },
      lead: {
        en: "One editorial composition for all three flows: a photo window of a real dining room, brand shapes anchored to the edges, and a clear form.",
        es: "Una composición editorial para los tres flujos: una ventana fotográfica con un comedor real, formas de marca ancladas a los bordes y un formulario claro.",
      },
      blocks: [
        {
          kind: "decision",
          title: { en: "The brand is a cut, not an object", es: "La marca es un corte, no un objeto" },
          body: {
            en: "When I tried to “complete” the brand shapes as closed objects, they turned into generic floating circles. The identity lives in how they're cut against the edges.",
            es: "Cuando intenté «completar» las formas de marca como objetos cerrados, se volvieron círculos flotando al azar. La identidad está en cómo se cortan contra los bordes.",
          },
        },
        {
          kind: "decision",
          title: { en: "Shapes that breathe instead of slide", es: "Formas que respiran en vez de deslizarse" },
          body: {
            en: "The first motion moved the shapes as rigid blocks and uncovered their hidden edges. I switched to deforming the outline like a lava lamp, with the points that touch the edges pinned, so a shape never looks cut.",
            es: "El primer movimiento desplazaba las formas en bloque y destapaba sus bordes ocultos. Lo cambié a deformar el contorno como lámpara de lava, con los puntos que tocan los bordes fijos, para que una forma nunca se vea cortada.",
          },
        },
        {
          kind: "video",
          mp4: "/media/casos/login-movimiento.mp4",
          webm: "/media/casos/login-movimiento.webm",
          poster: { src: "/media/casos/login-movimiento-poster.webp", w: 2560, h: 1600 },
          caption: {
            en: "Ten seconds of the real screen: a slow photo carousel and shapes that breathe. All of it can be switched off.",
            es: "Diez segundos de la pantalla real: un carrusel lento de fotos y formas que respiran. Todo se puede desactivar.",
          },
        },
        {
          kind: "decision",
          title: { en: "A button in four beats", es: "Un botón en cuatro tiempos" },
          body: {
            en: "Rest, press, an arrow looping while the server answers, then the outcome. On error it does a small “no”. The label says “Signing in…”.",
            es: "Reposo, presión, una flecha en bucle mientras responde el servidor y el desenlace. Con error hace un pequeño gesto de «no». El texto dice «Iniciando sesión…».",
          },
        },
        {
          kind: "compare",
          before: desk(lBeforeError),
          after: desk(lAfterError),
          caption: {
            en: "Wrong credentials: the message sits under the fields and both fields are marked and linked for screen readers.",
            es: "Credenciales incorrectas: el mensaje va debajo de los campos, ambos se marcan y quedan ligados para lectores de pantalla.",
          },
        },
        {
          kind: "compare",
          before: desk(lBeforePass),
          after: desk(lAfterPass),
          caption: {
            en: "New password: check marks, text and a five-step bar instead of color only. Rules run in the browser with the same expressions the server uses.",
            es: "Nueva contraseña: palomita, texto y una barra de cinco tramos en lugar de solo color. Las reglas corren en el navegador con las mismas expresiones que usa el servidor.",
          },
        },
        {
          kind: "compare",
          before: desk(lBeforeSent),
          after: desk(lAfterSent),
          caption: {
            en: "Reset sent: a panel in the layout with a 10-second countdown ring and “Go now”, instead of a pop-up that vanished.",
            es: "Correo enviado: un panel dentro del diseño con un anillo de cuenta regresiva de 10 s y «Ir ahora», en lugar de una ventana que desaparecía.",
          },
        },
      ],
    },
    {
      id: "deliver",
      title: { en: "Built, measured frame by frame", es: "Construido y medido cuadro por cuadro" },
      lead: {
        en: "I implemented it in the real app with its own layout, so the rest of the ERP wasn't touched and form re-renders never restart the photos.",
        es: "Lo implementé en la app real con un layout propio, así el resto del ERP no se tocó y los re-render del formulario nunca reinician las fotos.",
      },
      blocks: [
        {
          kind: "decision",
          title: { en: "A bug only a frame-by-frame recording could find", es: "Un bug que solo se vio cuadro por cuadro" },
          body: {
            en: "The carousel flickered. Recording the screen showed why: the CSS minifier rewrote 7000ms as 7s, and the script read “7” as milliseconds, so the cycle lasted about 8 ms. The fix was reading CSS timings with their units.",
            es: "El carrusel parpadeaba. Grabar la pantalla mostró por qué: el minificador de CSS reescribía 7000ms como 7s y el script leía «7» como milisegundos, así que el ciclo duraba unos 8 ms. La solución fue leer los tiempos de CSS respetando su unidad.",
          },
        },
        {
          kind: "list",
          items: [
            { en: "No zoom below 1024 px: starting the scale animation froze Chrome's compositor 120–260 ms on every fade. On desktop it starts after the fade.", es: "Sin acercamiento debajo de 1024 px: arrancar la escala congelaba el compositor de Chrome 120–260 ms en cada fundido. En escritorio arranca al terminar el fundido." },
            { en: "WebP photos at two sizes with srcset, the first one preloaded as the largest element on screen.", es: "Fotos en WebP a dos tamaños con srcset; la primera precargada por ser el elemento más grande de la pantalla." },
            { en: "One function decides which session notice to show, with 12 automated tests.", es: "Una sola función decide qué aviso de sesión mostrar, con 12 pruebas automatizadas." },
            { en: "Built with an AI-assisted workflow in Claude Code: I defined the design, directed each change and checked every state visually.", es: "Hecho con un flujo asistido por IA en Claude Code: yo definí el diseño, dirigí cada cambio y validé visualmente cada estado." },
          ],
        },
        {
          kind: "pair",
          a: phone(lMob),
          b: phone(lMobPass),
          phone: true,
          caption: { en: "On a phone the photo becomes a strip and the form goes underneath.", es: "En celular la foto pasa arriba como franja y el formulario va abajo." },
        },
      ],
    },
  ],
  outcome: [
    {
      kind: "table",
      head: [{ en: "", es: "" }, { en: "Before", es: "Antes" }, { en: "After", es: "Después" }],
      rows: [
        [{ en: "Identity", es: "Identidad" }, { en: "Generic card over a pattern", es: "Tarjeta genérica sobre patrón" }, { en: "Brand composition with a real photo", es: "Composición de marca con foto real" }],
        [{ en: "On submit", es: "Al enviar" }, { en: "Dimmed button", es: "Botón atenuado" }, { en: "4-beat button and “Signing in…”", es: "Botón en 4 tiempos y «Iniciando sesión…»" }],
        [{ en: "Errors", es: "Errores" }, { en: "Red box under the button", es: "Caja roja debajo del botón" }, { en: "Next to the fields, linked for screen readers", es: "Junto a los campos, ligados para lectores" }],
        [{ en: "Reset result", es: "Resultado de recuperar" }, { en: "Pop-ups of 2.5 and 3 s", es: "Ventanas de 2.5 y 3 s" }, { en: "In-layout panel, 10 s and “Go now”", es: "Panel en el diseño, 10 s e «Ir ahora»" }],
        [{ en: "Password rules", es: "Requisitos" }, { en: "Color only, red from the start", es: "Solo color, rojos desde el inicio" }, { en: "Check, text and bar, live", es: "Palomita, texto y barra, en vivo" }],
        [{ en: "Motion", es: "Movimiento" }, { en: "None", es: "Ninguno" }, { en: "Ambient, subtle, can be switched off", es: "Ambiental, sutil y desactivable" }],
      ],
    },
  ],
  learned: [
    {
      title: { en: "Measure motion, don't just watch it", es: "Medir el movimiento, no solo verlo" },
      body: {
        en: "“It sometimes stutters” only made sense once I recorded the screen frame by frame.",
        es: "«A veces se traba» solo tuvo sentido cuando grabé la pantalla cuadro por cuadro.",
      },
    },
    {
      title: { en: "Messages nobody can read don't exist", es: "Los mensajes que nadie alcanza a leer no existen" },
      body: {
        en: "Two 2.5-second pop-ups and a confirmation that never rendered were communication lost.",
        es: "Dos ventanas de 2.5 s y una confirmación que nunca se mostraba eran comunicación perdida.",
      },
    },
    {
      title: { en: "Consistency over novelty", es: "Consistencia antes que novedad" },
      body: {
        en: "A different look for “new password” was interesting but broke the journey. Going back to the sign-in composition made it feel like one flow.",
        es: "Una pantalla distinta para crear contraseña era interesante, pero rompía el recorrido. Volver a la composición del login la hizo sentirse parte del mismo flujo.",
      },
    },
  ],
  next: [
    { en: "Let people pause or extend the countdown, to fully meet WCAG 2.2.1.", es: "Permitir detener o extender la cuenta regresiva, para cumplir del todo WCAG 2.2.1." },
    { en: "Bring two-step verification into the same composition.", es: "Llevar la verificación en dos pasos a la misma composición." },
    { en: "Measure reset requests, failed sign-ins and access tickets before and after.", es: "Medir solicitudes de recuperación, errores de credenciales y tickets de acceso antes y después." },
  ],
};

/* ---------------------------------------------------------------- Celebraciones */

const celebraciones: Case = {
  slug: "celebrations",
  title: { en: "Celebrations", es: "Celebraciones" },
  summary: {
    en: "Every day the ERP greets the company with birthdays and work anniversaries. I turned one generic card into a family of editorial pieces that feel personal with any real data.",
    es: "Cada día el ERP saluda a la empresa con cumpleaños y aniversarios laborales. Convertí una tarjeta genérica en una familia de piezas editoriales que se sienten personales con cualquier dato real.",
  },
  meta: [
    { label: { en: "Product", es: "Producto" }, value: { en: "PEXSS, Plato Express's internal ERP", es: "PEXSS, el ERP interno de Plato Express" } },
    { label: { en: "My role", es: "Mi rol" }, value: { en: "Art direction, motion and front end", es: "Dirección de arte, movimiento y frontend" } },
    { label: { en: "Timeline", es: "Periodo" }, value: { en: "One week, October 2026", es: "Una semana, octubre 2026" } },
    { label: { en: "Stack", es: "Stack" }, value: { en: "Canva, Laravel, Livewire, Alpine.js, CSS", es: "Canva, Laravel, Livewire, Alpine.js, CSS" } },
  ],
  cover: { src: cAfter, w: 2880, h: 1620 },
  impact: [
    { value: "1 → 7", label: { en: "pieces: 4 birthdays, 3 anniversaries", es: "piezas: 4 de cumpleaños, 3 de aniversario" } },
    { value: "2.5×", label: { en: "more area for the artwork in the modal", es: "más área para el arte en el modal" } },
    { value: "1.2 MB → 120 KB", label: { en: "per artwork, at most", es: "por arte, como máximo" } },
    { value: "0", label: { en: "new tables and images generated per person", es: "tablas nuevas e imágenes generadas por persona" } },
  ],
  context: [
    {
      en: "Some announcements are written by Communications; birthdays and anniversaries are generated by the system. Nobody writes or reviews them before they go out to the whole company, so whatever the data says is what everyone sees.",
      es: "Algunos anuncios los publica Comunicación; los cumpleaños y aniversarios los genera el sistema. Nadie los redacta ni los revisa antes de que salgan a toda la empresa, así que lo que digan los datos es lo que ve todo el mundo.",
    },
    {
      en: "The old version did the technical job (inform) but not the emotional one (celebrate).",
      es: "La versión anterior cumplía la función técnica (avisar), pero no la emocional (celebrar).",
    },
  ],
  phases: [
    {
      id: "discover",
      title: { en: "Designing with the real data", es: "Diseñar con los datos reales" },
      lead: {
        en: "Day one was an audit: where the data comes from, which rules the system applies and how real names, job titles and departments are distributed.",
        es: "El primer día fue auditoría: de dónde salen los datos, qué reglas aplica el sistema y cómo se distribuyen los nombres, puestos y áreas reales.",
      },
      blocks: [
        {
          kind: "list",
          items: [
            { en: "Everyone looked the same: the same card for any person and any seniority. A 25-year anniversary looked like a 1-year one.", es: "Todos se veían igual: la misma tarjeta para cualquier persona y antigüedad. Un aniversario de 25 años se veía igual que uno de 1." },
            { en: "The person was the smallest thing on screen: the decorative background weighed more than the name.", es: "La persona era lo más pequeño de la pantalla: el fondo decorativo pesaba más que el nombre." },
            { en: "Most people have no photo on file, so the company logo stood where the person should be.", es: "La mayoría no tiene foto registrada, así que el logotipo de la empresa aparecía donde debía ir la persona." },
            { en: "Empty data on display: a missing department printed “N/A”. A corrupted hire date would have shown “2022 years”.", es: "Datos vacíos a la vista: si faltaba el área se imprimía «N/A». Una fecha de ingreso corrupta habría mostrado «2022 años»." },
            { en: "Seeing the same composition every day trains people to close it without reading.", es: "Ver la misma composición todos los días entrena a la gente a cerrarla sin leer." },
          ],
        },
        {
          kind: "compare",
          before: { src: cBefore, w: 2880, h: 1620 },
          after: { src: cAfter, w: 2880, h: 1620 },
          caption: { en: "The daily modal, before and after.", es: "El modal diario, antes y después." },
        },
      ],
    },
    {
      id: "define",
      title: { en: "Personal, at scale, with no human in the loop", es: "Personal, masivo y sin nadie revisando" },
      lead: {
        en: "Busy days bring dozens of celebrations at once, names up to 40 characters and job titles up to 53. The design had to survive all of it on its own.",
        es: "Hay días con decenas de celebraciones a la vez, nombres de hasta 40 caracteres y puestos de hasta 53. El diseño tenía que sobrevivir a todo eso solo.",
      },
      blocks: [
        {
          kind: "quote",
          body: {
            en: "How do we make an automatic, daily, company-wide celebration feel personal, look cared for with any real data, and not turn into noise?",
            es: "¿Cómo hacemos que una celebración automática, diaria y masiva se sienta personal, se vea cuidada con cualquier dato real y no se vuelva ruido?",
          },
        },
        {
          kind: "list",
          items: [
            { en: "The person is the hero: their name is the first thing you read.", es: "La persona es la protagonista: su nombre es lo primero que se lee." },
            { en: "Variety without losing identity: several pieces, one visual family.", es: "Variedad sin perder identidad: varias piezas, una misma familia visual." },
            { en: "Holds up with real data: compound names, long titles, missing fields. Never an “N/A”.", es: "Robusto con datos reales: nombres compuestos, puestos largos, datos faltantes. Nunca un «N/A»." },
            { en: "Faithful to Canva, the team's source of truth, measured instead of eyeballed.", es: "Fiel a Canva, la fuente de verdad del equipo, medido y no a ojo." },
            { en: "Light: no new tables and no image generated per person.", es: "Ligero: sin tablas nuevas y sin imágenes generadas por persona." },
          ],
        },
      ],
    },
    {
      id: "develop",
      title: { en: "A family of pieces, composed in the browser", es: "Una familia de piezas, armada en el navegador" },
      lead: {
        en: "Seven pieces share one base: luminous cream, the brand green and champagne accents. Each has its own concept and its own motion.",
        es: "Las siete piezas comparten una base: crema luminoso, el verde institucional y acentos champán. Cada una tiene su concepto y su movimiento.",
      },
      blocks: [
        {
          kind: "pair",
          a: { src: cGlobos, w: 1733, h: 907 },
          b: { src: cAniversario, w: 1766, h: 891 },
          caption: {
            en: "Two of the master artworks. Names, titles and years are real text laid on top in the browser.",
            es: "Dos de las imágenes maestras. Nombres, puestos y años son texto real colocado encima en el navegador.",
          },
        },
        {
          kind: "decision",
          title: { en: "A master image plus real text, not one image per person", es: "Imagen maestra más texto real, no una imagen por persona" },
          body: {
            en: "Generating an image per person on the server meant storage, scheduled jobs and stale data. Instead, each piece is a fixed master image and the browser lays the real data on top: always current, crisp at any size, accessible and selectable.",
            es: "Generar una imagen por persona en el servidor implicaba almacenamiento, procesos programados y datos desactualizados. En cambio, cada pieza es una imagen maestra fija y el navegador coloca encima los datos reales: siempre al día, nítidos a cualquier tamaño, accesibles y seleccionables.",
          },
        },
        {
          kind: "decision",
          title: { en: "Content rules for real names", es: "Reglas de contenido para nombres reales" },
          body: {
            en: "Birthdays use first name plus first surname; compound surnames are respected. If a line doesn't fit, it shrinks, then wraps by words. If a field is missing, the line disappears and the block reflows. Years from 2 to 99 use the plural; anything outside that range isn't shown and gets logged.",
            es: "En cumpleaños va primer nombre más primer apellido; los apellidos compuestos se respetan. Si una línea no cabe, se reduce y después se ajusta por palabras. Si falta un dato, la línea desaparece y el bloque se reacomoda. De 2 a 99 años va en plural; fuera de ese rango no se muestra y queda registrado.",
          },
        },
        {
          kind: "decision",
          title: { en: "Variety against habituation", es: "Variedad contra la habituación" },
          body: {
            en: "Each person of the day gets a random piece, different from the person before and after. It stays stable when you reload and changes next session. Nothing is written to the database.",
            es: "Cada persona del día recibe una pieza al azar, distinta de la anterior y la siguiente. Se mantiene al recargar y cambia en la siguiente sesión. No se escribe nada en la base de datos.",
          },
        },
        {
          kind: "video",
          mp4: "/media/casos/celebraciones-piezas.mp4",
          webm: "/media/casos/celebraciones-piezas.webm",
          poster: { src: "/media/casos/celebraciones-piezas-poster.webp", w: 2560, h: 1440 },
          caption: {
            en: "All seven pieces moving: the four birthdays (balloons, cake, gifts, candle) and the three anniversaries (balloons, aura, fabric).",
            es: "Las siete piezas en movimiento: los cuatro cumpleaños (globos, pastel, regalos, vela) y los tres aniversarios (globos, aura, telas).",
          },
        },
        {
          kind: "demo",
          before: "/demos/celebraciones/antes.html",
          after: "/demos/celebraciones/despues.html",
          poster: { src: cAfter, w: 2880, h: 1620 },
          caption: {
            en: "The real modal running in the browser, with fictional people. Try the arrows and the pause button.",
            es: "El modal real corriendo en el navegador, con personas ficticias. Prueba las flechas y el botón de pausa.",
          },
        },
      ],
    },
    {
      id: "deliver",
      title: { en: "Canva as a measured contract", es: "Canva como contrato medido" },
      lead: {
        en: "The code had to reproduce Canva, not reinterpret it. So I measured it.",
        es: "El código tenía que reproducir Canva, no reinterpretarlo. Así que lo medí.",
      },
      blocks: [
        {
          kind: "list",
          items: [
            { en: "Font, size, baseline and box of every text came from Canva's PDF export; the PNG export served as pixel-level check.", es: "Fuente, tamaño, línea base y caja de cada texto salieron del PDF exportado de Canva; el PNG sirvió de verificación por pixel." },
            { en: "Canva's League Spartan Bold is the original 2014 cut. The Google Fonts version is a 2020 redesign about 18 % narrower, so I bundled the original (OFL).", es: "La League Spartan Bold de Canva es la versión original de 2014. La de Google Fonts es un rediseño de 2020 unos 18 % más angosto, así que empaqueté la original (OFL)." },
            { en: "Fabric can't ripple as a rigid image, so each cloth is split into ~13 strips tilted along a sine wave. An SVG displacement filter ran at ~30 fps with artifacts; this runs at 120 fps.", es: "Una imagen rígida no puede ondular, así que cada tela se divide en ~13 tramos que se inclinan siguiendo una onda senoidal. Un filtro SVG daba ~30 fps con artefactos; esto corre a 120 fps." },
            { en: "A global pause button (WCAG 2.2.2) and no motion at all with “reduce motion”.", es: "Un botón de pausa global (WCAG 2.2.2) y nada de movimiento con «reducir movimiento»." },
            { en: "Built with an AI-assisted workflow in Claude Code, with every piece reviewed live on the real modal.", es: "Hecho con un flujo asistido por IA en Claude Code, con cada pieza revisada en vivo sobre el modal real." },
          ],
        },
      ],
    },
  ],
  outcome: [
    {
      kind: "table",
      head: [{ en: "", es: "" }, { en: "Before", es: "Antes" }, { en: "After", es: "Después" }],
      rows: [
        [{ en: "Designs", es: "Diseños" }, { en: "1 card for everyone", es: "1 tarjeta para todos" }, { en: "7 pieces", es: "7 piezas" }],
        [{ en: "Hero", es: "Protagonista" }, { en: "The decorative background", es: "El fondo decorativo" }, { en: "The name, and the years on anniversaries", es: "El nombre y, en aniversario, los años" }],
        [{ en: "Missing data", es: "Dato faltante" }, { en: "“N/A”", es: "«N/A»" }, { en: "The line disappears", es: "La línea desaparece" }],
        [{ en: "Artwork weight", es: "Peso del arte" }, { en: "1.2 MB PNG", es: "PNG de 1.2 MB" }, { en: "48–120 KB WebP", es: "WebP de 48–120 KB" }],
        [{ en: "Accessibility", es: "Accesibilidad" }, { en: "No dialog role or name", es: "Sin rol de diálogo ni nombre" }, { en: "Named dialog, text summary, AA, pause", es: "Diálogo con nombre, resumen en texto, AA y pausa" }],
      ],
    },
    {
      kind: "text",
      body: [
        {
          en: "The team approved the pieces; their only request was to make the department line read as tertiary. With the real data, no birthday name overflows and almost every job title fits at full size.",
          es: "El equipo aprobó las piezas; el único ajuste que pidió fue marcar más la jerarquía del área. Con los datos reales, ningún nombre de cumpleaños se desborda y casi todos los puestos caben a tamaño completo.",
        },
      ],
    },
  ],
  learned: [
    {
      title: { en: "Freeze the contract before building", es: "Congelar el contrato antes de implementar" },
      body: {
        en: "For birthdays I patched Canva masters mid-build. For anniversaries I audited and closed Canva first, then coded. Faster, and no patches.",
        es: "En cumpleaños parché maestras de Canva a medio camino. En aniversarios primero audité y cerré Canva, después programé. Fue más rápido y sin parches.",
      },
    },
    {
      title: { en: "Motion has thresholds", es: "El movimiento tiene umbrales" },
      body: {
        en: "Below about 6 px/s it reads as still, an in-plane rotation reads as falling, and a short period reads as vibration.",
        es: "Por debajo de ~6 px/s se percibe estático, una rotación en el plano se lee como caída y un periodo corto se ve como vibración.",
      },
    },
    {
      title: { en: "The “same” font isn't always the same", es: "La «misma» fuente no siempre es la misma" },
      body: {
        en: "Versions of a typeface can change their widths. Verify with measurements, not by name.",
        es: "Las versiones de una tipografía pueden cambiar sus anchos. Hay que verificar con mediciones, no por el nombre.",
      },
    },
  ],
  next: [
    { en: "Measure how many people use “Skip the rest”, how long the modal stays open and whether they browse between people.", es: "Medir cuántas personas usan «Omitir restantes», cuánto tiempo pasa el modal abierto y si navegan entre personas." },
    { en: "A short perception survey before and after.", es: "Una encuesta breve de percepción antes y después." },
  ],
};

/* ---------------------------------------------------------------- Codelum POS */

const k = (src: string): Img => ({ src, w: 2880, h: 2048 });

const pos: Case = {
  slug: "point-of-sale",
  title: { en: "Point of sale", es: "Punto de venta" },
  summary: {
    en: "A restaurant POS already in daily use, redesigned so any cashier, from 18 to 70, can take an order, split a payment and close the register without help.",
    es: "Un punto de venta que ya se usaba todos los días, rediseñado para que cualquier cajero, de 18 a 70 años, pueda tomar una orden, dividir un pago y cerrar caja sin ayuda.",
  },
  meta: [
    { label: { en: "Company", es: "Empresa" }, value: { en: "Codelum, a tech startup (remote, Costa Rica)", es: "Codelum, startup tecnológica (remoto, Costa Rica)" } },
    { label: { en: "My role", es: "Mi rol" }, value: { en: "Sole UX/UI designer", es: "Única diseñadora UX/UI" } },
    { label: { en: "Timeline", es: "Periodo" }, value: { en: "January – June 2026", es: "Enero – junio 2026" } },
    { label: { en: "Tools", es: "Herramientas" }, value: { en: "Figma, DaisyUI 5, design tokens", es: "Figma, DaisyUI 5, design tokens" } },
  ],
  cover: k(kModProduct),
  impact: [
    { value: "4", label: { en: "screen sizes from one system: desktop, iPad, iPad mini and iPhone", es: "tamaños de pantalla con un solo sistema: escritorio, iPad, iPad mini e iPhone" } },
    { value: "3", label: { en: "payment methods in a single charge, with the balance always visible", es: "métodos de pago en un solo cobro, con lo pendiente siempre a la vista" } },
    { value: "18–70", label: { en: "the age range of the cashiers it had to work for", es: "el rango de edad de los cajeros para quienes tenía que funcionar" } },
    { value: "5", label: { en: "guided steps to set up a product, from price to modifiers", es: "pasos guiados para dar de alta un producto, del precio a los modificadores" } },
  ],
  context: [
    {
      en: "Codelum is a small tech startup. Its POS runs a local rotisserie-chicken restaurant in Costa Rica, a fast-food counter in the style of a big chain but homegrown. The system was already live: developers had built several views and cashiers were using them every shift.",
      es: "Codelum es una startup tecnológica pequeña. Su punto de venta opera un restaurante local de pollo rostizado en Costa Rica, un mostrador de comida rápida al estilo de una gran cadena, pero hecho en casa. El sistema ya estaba en producción: el equipo de desarrollo había construido varias vistas y los cajeros las usaban en cada turno.",
    },
    {
      en: "I joined as the only designer on a small remote team: they in Costa Rica, me in Mexico. My job was to redesign what existed, design what was missing and leave a system the developers could build on without me in the room.",
      es: "Entré como la única diseñadora de un equipo chico y remoto: ellos en Costa Rica, yo en México. Mi trabajo fue rediseñar lo que existía, diseñar lo que faltaba y dejar un sistema que el equipo pudiera construir sin necesitarme en cada decisión.",
    },
  ],
  phases: [
    {
      id: "discover",
      title: { en: "Auditing a system people already depend on", es: "Auditar un sistema del que ya depende la gente" },
      lead: {
        en: "There was no budget for formal research, but there was something better than a blank page: screens in daily use. I started with a heuristic review of every existing view and what I knew about the people at the counter.",
        es: "No había presupuesto para research formal, pero había algo mejor que una hoja en blanco: pantallas en uso diario. Empecé con una revisión heurística de cada vista existente y con lo que sabía de la gente en el mostrador.",
      },
      blocks: [
        {
          kind: "list",
          items: [
            { en: "Dated, inconsistent screens: each view solved buttons, tables and forms its own way, with small targets and dense text.", es: "Pantallas anticuadas e inconsistentes: cada vista resolvía botones, tablas y formularios a su manera, con áreas de toque chicas y texto denso." },
            { en: "Modifiers without rules: options, paid extras and “no onion” lived in the same list, so it wasn't clear what cost money.", es: "Modificadores sin reglas: opciones, extras con costo y «sin cebolla» vivían en la misma lista, y no quedaba claro qué costaba dinero." },
            { en: "Payments as one method at a time, when customers routinely pay part cash, part card, part Sinpe Móvil (Costa Rica's instant transfer).", es: "Pagos de un solo método a la vez, cuando los clientes pagan seguido una parte en efectivo, otra con tarjeta y otra por Sinpe Móvil." },
            { en: "Closing the register with no clear picture of expected versus counted cash, and no rule for who can close with a shortfall.", es: "Cierre de caja sin una vista clara de lo esperado contra lo contado, y sin una regla de quién puede cerrar con faltante." },
          ],
        },
        {
          kind: "quote",
          body: {
            en: "Proto-persona: cashiers from 18 to 70, from first jobs to decades behind a counter, every level of schooling, working fast with a line in front of them. If it needs explaining, it fails at lunch rush.",
            es: "Proto-persona: cajeros de 18 a 70 años, desde su primer empleo hasta décadas detrás de un mostrador, de toda escolaridad, trabajando rápido con una fila enfrente. Si necesita explicación, falla en la hora pico.",
          },
        },
        {
          kind: "image",
          img: k(kOrder),
          caption: {
            en: "New order: catalog by category, the ticket on the right and a numeric keypad within thumb's reach.",
            es: "Nueva orden: catálogo por categoría, el ticket a la derecha y un teclado numérico al alcance del pulgar.",
          },
        },
      ],
    },
    {
      id: "define",
      title: { en: "Principles before pixels", es: "Principios antes que pixeles" },
      lead: {
        en: "From the audit and the proto-persona I wrote four principles. Every later decision had to pass them, and they gave the product owner and me a shared way to say yes or no.",
        es: "De la auditoría y la proto-persona salieron cuatro principios. Toda decisión posterior tenía que pasarlos, y nos dieron al product owner y a mí una forma común de decir sí o no.",
      },
      blocks: [
        {
          kind: "quote",
          body: {
            en: "How might we make a busy counter feel calm, for a cashier of any age, without slowing down the line?",
            es: "¿Cómo hacemos que un mostrador lleno se sienta tranquilo, para un cajero de cualquier edad, sin frenar la fila?",
          },
        },
        {
          kind: "list",
          items: [
            { en: "Big and obvious: large targets, one primary action per screen, nothing that depends on precision.", es: "Grande y obvio: áreas de toque amplias, una acción principal por pantalla y nada que dependa de precisión." },
            { en: "Say it plainly: “Missing ₡250.00”, not “Discrepancy”. Labels in the words used at the counter.", es: "Dilo claro: «Faltan ₡250.00», no «Discrepancia». Etiquetas con las palabras del mostrador." },
            { en: "Color never alone: every color carries a word or an icon too.", es: "El color nunca solo: cada color va con una palabra o un ícono." },
            { en: "The rules live in the interface: if the business has a rule, the screen enforces it so nobody has to remember it.", es: "Las reglas viven en la interfaz: si el negocio tiene una regla, la pantalla la hace cumplir para que nadie tenga que recordarla." },
          ],
        },
      ],
    },
    {
      id: "develop",
      title: { en: "Turning business rules into interface", es: "Convertir reglas de negocio en interfaz" },
      lead: {
        en: "These are the decisions that changed the most for the people using it.",
        es: "Estas son las decisiones que más cambiaron el día a día de quien lo usa.",
      },
      blocks: [
        {
          kind: "decision",
          title: { en: "Modifiers with a color that explains the rule", es: "Modificadores con un color que explica la regla" },
          body: {
            en: "I split modifiers into three groups, each with its own color and a one-line rule: Options (violet, pick one, no cost), Extras (green, optional, price shown on the card) and Removals (red, always free). Each choice shows its stock: available, low stock or unavailable. The total updates as you tap.",
            es: "Separé los modificadores en tres grupos, cada uno con su color y una regla de una línea: Opciones (morado, elige una, sin costo), Extras (verde, opcionales, con el precio en la tarjeta) y Restas (rojo, siempre gratis). Cada opción muestra su existencia: disponible, stock bajo o no disponible. El total se actualiza al tocar.",
          },
        },
        {
          kind: "image",
          img: k(kModCombo),
          caption: {
            en: "A combo adds a drinks group on top of the same three rules. An unavailable drink is greyed out instead of hidden, so the cashier can tell the customer why.",
            es: "Un combo agrega el grupo de bebidas sobre las mismas tres reglas. Una bebida sin existencia se ve en gris en lugar de desaparecer, para que el cajero pueda explicarle al cliente por qué.",
          },
        },
        {
          kind: "decision",
          title: { en: "Split payments the way people actually pay", es: "Pagos divididos como de verdad paga la gente" },
          body: {
            en: "Up to three methods in one charge (cash, card, Sinpe Móvil), each as its own row with its amount. The amount due is the biggest thing on screen and the remaining balance turns red until it reaches zero. Quick buttons (+1k, +2k, +5k, +10k colones) match the bills customers actually hand over.",
            es: "Hasta tres métodos en un solo cobro (efectivo, tarjeta y Sinpe Móvil), cada uno en su fila con su monto. El total a pagar es lo más grande de la pantalla y lo que falta se queda en rojo hasta llegar a cero. Los botones rápidos (+1mil, +2mil, +5mil, +10mil) corresponden a los billetes que de verdad entrega el cliente.",
          },
        },
        {
          kind: "image",
          img: k(kPay3),
          caption: {
            en: "Paying with three methods. The cashier never has to do the math.",
            es: "Pago con tres métodos. El cajero nunca tiene que hacer la cuenta.",
          },
        },
        {
          kind: "decision",
          title: { en: "Closing the register: the rule is in the screen", es: "Cierre de caja: la regla está en la pantalla" },
          body: {
            en: "Each payment method gets its own count with expected versus counted. The summary says it in plain words: “Missing ₡250.00”. If there's a shortfall, only an administrator can close, and a note becomes required. The business rule can't be skipped by accident.",
            es: "Cada método de pago tiene su propio conteo, con lo esperado contra lo contado. El resumen lo dice en palabras simples: «Faltante ₡250.00». Si hay faltante, solo un administrador puede cerrar y la nota se vuelve obligatoria. La regla del negocio no se puede saltar por accidente.",
          },
        },
        {
          kind: "image",
          img: { src: kClose, w: 2880, h: 2052 },
          caption: {
            en: "Closing with a shortfall: per-method counts, the difference in red and a required admin note.",
            es: "Cierre con faltante: conteo por método, la diferencia en rojo y una nota obligatoria del administrador.",
          },
        },
        {
          kind: "decision",
          title: { en: "One system, four screens", es: "Un sistema, cuatro pantallas" },
          body: {
            en: "The same flows on desktop, iPad horizontal, iPad mini vertical and iPhone. On the phone, modifiers open in a bottom sheet you can reach with one thumb, and the payment keypad stays at the bottom.",
            es: "Los mismos flujos en escritorio, iPad horizontal, iPad mini vertical e iPhone. En celular, los modificadores abren en un bottom sheet que se alcanza con un pulgar, y el teclado de pago se queda abajo.",
          },
        },
        {
          kind: "pair",
          a: { src: kComboPhone, w: 804, h: 2350 },
          b: { src: kPayPhone, w: 804, h: 1748 },
          phone: true,
          caption: { en: "iPhone: a combo in a bottom sheet, and payment.", es: "iPhone: un combo en bottom sheet y el pago." },
        },
        {
          kind: "pair",
          a: { src: kComboPad, w: 1488, h: 2644 },
          b: { src: kPayPad, w: 1488, h: 2266 },
          caption: { en: "iPad mini vertical: the same combo and payment, rearranged for the size.", es: "iPad mini vertical: el mismo combo y pago, reacomodados para el tamaño." },
        },
      ],
    },
    {
      id: "deliver",
      title: { en: "A system the team could build without me", es: "Un sistema que el equipo pudiera construir sin mí" },
      lead: {
        en: "Working remotely across two countries, the files had to answer the developers' questions before they asked them.",
        es: "Trabajando a distancia entre dos países, los archivos tenían que responder las preguntas del equipo antes de que las hicieran.",
      },
      blocks: [
        {
          kind: "list",
          items: [
            { en: "A design system from scratch: color tokens (primary, neutrals, success, danger, warning and category colors), a type scale and interactive Figma components.", es: "Un design system desde cero: tokens de color (primario, neutrales, éxito, peligro, advertencia y categorías), escala tipográfica y componentes interactivos en Figma." },
            { en: "Mapped to DaisyUI 5, the library the team already used, so tokens became code without translation.", es: "Mapeado a DaisyUI 5, la librería que el equipo ya usaba, para que los tokens pasaran a código sin traducción." },
            { en: "Every state drawn: empty order, low stock, unavailable, partial payment, register open, closed and closed with a shortfall.", es: "Cada estado dibujado: orden vacía, stock bajo, no disponible, pago parcial, caja abierta, cerrada y cerrada con faltante." },
            { en: "Decisions validated with the product owner, who knew the restaurant's rules first-hand.", es: "Decisiones validadas con el product owner, que conocía de primera mano las reglas del restaurante." },
          ],
        },
        {
          kind: "image",
          img: { src: kTokens, w: 2880, h: 3956 },
          crop: true,
          caption: { en: "Part of the token sheet: primary, neutrals and semantic colors.", es: "Parte de la hoja de tokens: primario, neutrales y colores semánticos." },
        },
        {
          kind: "decision",
          title: { en: "Product setup in five steps", es: "Alta de producto en cinco pasos" },
          body: {
            en: "Creating a product touches prices, ingredients, inventory and modifiers. I split it into five guided steps. Removals are generated from the product's ingredients, so “no tomato” exists only if the product has tomato.",
            es: "Crear un producto toca precios, insumos, inventario y modificadores. Lo dividí en cinco pasos guiados. Las restas se generan a partir de los insumos del producto, así que «sin tomate» existe solo si el producto lleva tomate.",
          },
        },
        {
          kind: "pair",
          a: k(kProductPrices),
          b: k(kProductMods),
          caption: { en: "New product: prices, and modifiers configured.", es: "Nuevo producto: precios y modificadores configurados." },
        },
      ],
    },
  ],
  outcome: [
    {
      kind: "text",
      body: [
        {
          en: "The redesign went into the system the restaurant uses every day; the developers built on the views and components as I delivered them. The flows that used to depend on someone experienced at the counter (split payments, combos, closing the register) now explain themselves on screen.",
          es: "El rediseño entró al sistema que el restaurante usa todos los días; el equipo construyó sobre las vistas y componentes conforme los entregaba. Los flujos que antes dependían de alguien con experiencia en el mostrador (pagos divididos, combos, cierre de caja) ahora se explican solos en pantalla.",
        },
      ],
    },
    {
      kind: "image",
      img: k(kSessions),
      caption: { en: "Register sessions: every open and closed session in one table.", es: "Sesiones de caja: todas las sesiones abiertas y cerradas en una tabla." },
    },
  ],
  learned: [
    {
      title: { en: "Rules beat reminders", es: "Una regla vale más que un recordatorio" },
      body: {
        en: "Putting “only an admin can close with a shortfall” into the screen did more than any training would.",
        es: "Poner «solo un administrador puede cerrar con faltante» en la pantalla hizo más que cualquier capacitación.",
      },
    },
    {
      title: { en: "Designing for 18 to 70 is designing for everyone", es: "Diseñar para 18 a 70 es diseñar para todos" },
      body: {
        en: "Large targets and plain words weren't a concession to older users. They made the youngest cashiers faster too.",
        es: "Las áreas grandes y las palabras simples no fueron una concesión a los mayores. También hicieron más rápidos a los más jóvenes.",
      },
    },
    {
      title: { en: "Remote teams need answers in the file", es: "Un equipo remoto necesita las respuestas en el archivo" },
      body: {
        en: "Drawing every state saved more back-and-forth than any meeting across time zones.",
        es: "Dibujar cada estado ahorró más idas y vueltas que cualquier junta entre países.",
      },
    },
  ],
  next: [
    { en: "Usability tests with cashiers at both ends of the age range: take a combo order, split a payment, close the register.", es: "Pruebas de usabilidad con cajeros de los dos extremos de edad: tomar un combo, dividir un pago y cerrar caja." },
    { en: "Measure order time and register discrepancies before and after.", es: "Medir el tiempo por orden y las discrepancias de caja antes y después." },
    { en: "A kitchen view connected to the same order states.", es: "Una vista de cocina conectada a los mismos estados de la orden." },
  ],
};

export const CASES: Case[] = [proyectos, login, celebraciones, pos];

export function findCase(slug?: string) {
  return CASES.find((c) => c.slug === slug);
}
