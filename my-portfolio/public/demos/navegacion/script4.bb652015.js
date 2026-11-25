// Arranque de la demo (antes de cualquier otro script): estado guardado, variante, temporada y tema.
(function () {
    var KEY = 'pexss.demo';
    var st = { season: 'november', route: '/dashboard', theme: 'light', collapsed: false, variant: 'executive' };
    try { Object.assign(st, JSON.parse(sessionStorage.getItem(KEY) || '{}')); } catch (e) {}
    // Sin temporada, cumpleaños y los doce meses: la decoración vive junto al logotipo (estilo Ejecutivo).
    var SEASONS = ['none', 'birthday', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    if (SEASONS.indexOf(st.season) < 0) st.season = 'november';
    // Estilo de íconos (2026-11-23, tres opciones): antes = menú previo al rediseño (lineales); executive = Material
    // Executive, la versión final aprobada del ERP (opción predeterminada); noicons = Material Executive sin íconos en el
    // menú. Valores retirados (material, flat, soft3d, glyph-color, flat-v1, after) o desconocidos pasan a Material Executive.
    // 2026-11-23: quedan tres opciones (Antes, Material Executive y Sin íconos); Material Original y Flat se retiraron y
    // sus valores guardados pasan a Material Executive.
    st.variant = 'executive';
    // «Sin íconos» (2026-11-18): Material Executive completo sin los íconos del menú (CSS en index.html); sin íconos la
    // rail colapsada quedaría vacía, así que el menú se queda expandido.
    var exec = st.variant === 'executive' || st.variant === 'noicons';
    if (st.variant === 'noicons') st.collapsed = false;
    window.__demo = { KEY: KEY, state: st };
    var root = document.documentElement;
    // Sin selector de paleta: Antes, Material Original y Flat siempre con sus colores originales (script8 los respeta).
    try { sessionStorage.setItem('pexss.demo.palette', 'original'); sessionStorage.setItem('pexss.demo.exec', 'current'); } catch (e) {}
    // Temporada: el mismo mecanismo de vista previa del ERP (pexss.seasonalPreview) lo leen nav-icons.js y contour.js.
    try {
        if (st.season === 'none') sessionStorage.removeItem('pexss.seasonalPreview');
        else sessionStorage.setItem('pexss.seasonalPreview', st.season);
        // Decoración de temporada (2026-11-18, como el ERP): visible salvo que el visitante la apague con su botón, y se
        // recuerda en este navegador (pexss.seasonal.shown = 0). Los bundles históricos (Antes, Material Original, Flat)
        // leen la clave anterior pexss.seasonal.place: se deriva de la nueva para que todas las opciones arranquen igual.
        var shown = localStorage.getItem('pexss.seasonal.shown') !== '0';
        localStorage.setItem('pexss.seasonal.place', shown ? 'logo' : 'off');
        localStorage.removeItem('pexss.seasonal.placeFrom');
        sessionStorage.removeItem('pexss.seasonal.hidden');
        if (!exec) {
            // Su botón solo escribe la clave anterior: se anota también en la nueva (corre antes que su manejador).
            document.addEventListener('click', function (e) {
                var t = e.target.closest && e.target.closest('#sidebar-pexss [data-pexss-brand-wrap] > .pexss-season-toggle');
                if (!t) return;
                try { localStorage.setItem('pexss.seasonal.shown', t.parentElement.classList.contains('is-season-hidden') ? '1' : '0'); } catch (x) {}
            }, true);
        }
    } catch (e) {}
    // Tema: lo persiste el toggle real de Mary (mary-theme / mary-class).
    try {
        localStorage.setItem('mary-theme', JSON.stringify(st.theme));
        localStorage.setItem('mary-class', JSON.stringify(st.theme));
    } catch (e) {}
    root.setAttribute('data-theme', st.theme);
    root.dataset.variant = st.variant;
    root.dataset.demoIcons = exec ? 'executive' : st.variant;
    root.setAttribute('data-pexss-nav-icons', { before: 'soft3d', executive: 'iconshock-material-executive' }[exec ? 'executive' : st.variant]);
    // Flat y Material Executive: los mismos atributos que pone el layout del ERP (config app.nav_subicons y app.nav_subicons_custom).
    if (exec) {
        root.setAttribute('data-pexss-nav-subicons', 'config,pos,rh,inventarios,operaciones,calidad,finanzas,compras,cxp,plato_learning_hub,cotizaciones,comercial,logistica,seguridad_patrimonial,aperturas,menu_planning,srm,fact,pos_retail,quiniela_mundial,proyectos_tareas,it');
        root.setAttribute('data-pexss-nav-subicons-custom', '');
    }
    // Estilo Ejecutivo: el mismo atributo que pone el layout del ERP en <html>.
    root.setAttribute('data-pexss-exec', '');
    root.classList.toggle('dark', st.theme === 'dark');
    // Sin backend: Livewire no existe. Lo que el ERP pide a Livewire (navegar) lo atiende la demo.
    window.Livewire = {
        navigate: function (href) { window.__demoGo ? window.__demoGo(href) : null; },
        on: function () {}, hook: function () {}, dispatch: function () {}, find: function () { return null; }, all: function () { return []; },
    };
    document.addEventListener('alpine:init', function () {
        window.Alpine.magic('wire', function () { return new Proxy({}, { get: function () { return undefined; } }); });
    });
})();
