// Demo PEXSS · Decoraciones de temporada (antes: junto al logo; después: en el header).
// El sidebar, el header y su movimiento son los del ERP (HTML renderizado + nav-icons.js + contour.js + Alpine/Mary);
// esta capa solo simula lo que hace el servidor: cambiar de página, marcar el activo, armar la ruta y pintar contenido
// de ejemplo. Todos los datos son ficticios.
(function () {
    const D = window.__demo;
    const st = D.state;
    const save = () => { try { sessionStorage.setItem(D.KEY, JSON.stringify(st)); } catch (e) {} };
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const fold = (t) => (t || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, ' ').trim();
    const label = (el) => (el?.querySelector('.mary-hideable')?.textContent || el?.textContent || '').replace(/\s+/g, ' ').trim();
    const pathOf = (href) => { try { return new URL(href, 'https://demo.local').pathname.replace(/\/+$/, '') || '/'; } catch (e) { return href; } };

    // ---------- Toast ----------
    function toast(msg) {
        let t = $('.demo-toast');
        if (!t) { t = document.createElement('div'); t.className = 'demo-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
        t.textContent = msg;
        t.classList.add('is-on');
        clearTimeout(t._h);
        t._h = setTimeout(() => t.classList.remove('is-on'), 2600);
    }
    window.__demoToast = toast;

    // ---------- Iconos originales (Heroicons) para la ruta, antes de que nav-icons los sustituya ----------
    const ICON = new Map();
    function snapshotIcons() {
        $$('#sidebar-pexss .sidebar-menu-search .menu :is(a, summary)').forEach((row) => {
            const svg = row.querySelector('svg');
            if (svg) ICON.set(row, svg.outerHTML.replace(/\bclass="[^"]*"/, 'class="inline flex-shrink-0 mb-0.5 h-4 w-4"'));
        });
    }

    // ---------- Navegación simulada ----------
    const links = () => $$('#sidebar-pexss .sidebar-menu-search .menu a[href]').filter((a) => a.getAttribute('href') && a.getAttribute('href') !== '#');
    function findLink(href) {
        const p = pathOf(href);
        return links().find((a) => pathOf(a.getAttribute('href')) === p);
    }
    function chainOf(a) {
        const chain = [];
        for (let d = a.closest('details'); d; d = d.parentElement?.closest('details')) chain.unshift(d.querySelector(':scope > summary'));
        return [...chain, a];
    }

    const SEP = (last) => `<span class="${last ? 'hidden' : 'hidden !block sm:!block'}"><svg class="inline flex-shrink-0 h-3 w-3 mx-1 text-base-content/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg></span>`;
    function renderCrumbs(chain) {
        const old = $('#pexss-breadcrumb');
        if (!old) return;
        const nav = old.cloneNode(false);
        nav.removeAttribute('data-nav-icons');
        const items = chain.map((row, i) => `<li class=""><span class="text-sm"${i === chain.length - 1 ? ' aria-current="page"' : ''}>${ICON.get(row) || ''}<span>${label(row)}</span></span></li>${SEP(i === chain.length - 1)}`).join('');
        nav.innerHTML = `<ul class="flex items-center py-2 breadcrumb-last-green" style="color: var(--pexss-text);">${items}</ul>`;
        old.replaceWith(nav);
    }

    function openAncestors(a) {
        for (let d = a.closest('details'); d; d = d.parentElement?.closest('details')) {
            const sum = d.querySelector(':scope > summary');
            const data = window.Alpine && sum ? window.Alpine.$data(sum) : null;
            if (data && 'show' in data) data.show = true; else d.open = true;
        }
    }

    function markCurrent(a) {
        $$('#sidebar-pexss .menu a.is-current-menu, #sidebar-pexss .menu a[aria-current]').forEach((x) => {
            x.classList.remove('is-current-menu', 'mary-active-menu');
            x.removeAttribute('aria-current');
        });
        a.classList.add('is-current-menu', 'mary-active-menu');
        a.setAttribute('aria-current', 'page');
    }

    function apply(href, { initial = false } = {}) {
        const a = findLink(href) || findLink('/dashboard');
        if (!a) return;
        const chain = chainOf(a);
        markCurrent(a);
        openAncestors(a);
        renderCrumbs(chain);
        renderPage(a, chain);
        st.route = pathOf(a.getAttribute('href'));
        save();
        document.title = `${label(a)} - PEXSS · Demo`;
        if (!initial) {
            window.scrollTo({ top: 0 });
            requestAnimationFrame(() => {
                document.dispatchEvent(new Event('livewire:navigated'));
                // Los accesos rápidos se pintan al navegar: la escena se vuelve a acomodar con la fila ya puesta.
                setTimeout(() => { try { window.__pexssNav?.initContour(); } catch (e) {} }, 80);
            });
        }
    }
    window.__demoGo = (href) => apply(href);

    // ---------- Contenido de ejemplo (el mismo en A y B) ----------
    const money = (n) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const NAMES = ['Ana Ejemplo', 'Carlos Muestra', 'Lucía Demo', 'Jorge Prueba', 'Mariana Ficticia', 'Diego Ejemplar', 'Paola Simulada', 'Ricardo Modelo'];
    const SITES = ['Comedor Norte 01', 'Comedor Centro 04', 'Planta Industrial 12', 'Hospital Demo 03', 'Corporativo Sur 07', 'Escuela Modelo 02', 'Comedor Poniente 09', 'Planta Oriente 15'];
    const icon = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="${d}"/></svg>`;
    const I = {
        chart: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z',
        doc: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
        db: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125',
        cal: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5',
        dots: 'M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z',
        card: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z',
        box: 'm21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
        search: 'm21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z',
        up: 'M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18',
        reset: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99',
        plus: 'M12 4.5v15m7.5-7.5h-15',
        tray: 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3',
        down: 'm19.5 8.25-7.5 7.5-7.5-7.5',
    };
    const MONTH = { january: 'Enero', february: 'Febrero', march: 'Marzo', april: 'Abril', may: 'Mayo', june: 'Junio', july: 'Julio', august: 'Agosto', september: 'Septiembre', october: 'Octubre', november: 'Noviembre', december: 'Diciembre' };
    const period = () => `${MONTH[st.season] || 'Diciembre'} 2026`;

    function dashboard() {
        const kpi = (name, tone, ic, value, rows) => `<article class="dk-card" style="--tone:${tone}"><span class="dk-ic">${icon(I[ic])}</span><h3>${name}</h3><small>Importe (${MONTH[st.season] || 'Diciembre'})</small><strong>${value}</strong><dl>${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></article>`;
        return `<div class="demo-tabs" role="tablist"><button class="is-on" role="tab" aria-selected="true">Operativo</button><button role="tab">Recursos Humanos</button><button role="tab">General</button></div>
        <section class="demo-filters" aria-label="Filtros">
            <label><span>Cliente</span><span class="demo-input">Todos los clientes${icon(I.down)}</span></label>
            <label><span>Comedor</span><span class="demo-input">Buscar comedor…${icon(I.down)}</span></label>
            <label><span>Estado</span><span class="demo-input">Todos los estados${icon(I.down)}</span></label>
            <label><span>Mes</span><span class="demo-input">${icon(I.cal)}${period()}</span></label>
            <button type="button" class="demo-primary" data-demo-toast="Demostración: los filtros no consultan datos reales.">${icon(I.search)}Buscar</button>
            <button type="button" class="demo-ghost">${icon(I.reset)}Quitar filtros</button>
        </section>
        <section class="demo-hero"><div><span class="demo-pill">VISTA GENERAL</span><h1>Negocio completo</h1><p>149 comedor(es) en alcance</p><p class="demo-period">${period()}</p></div>
            <div class="demo-growth"><span class="dk-ic">${icon(I.chart)}</span><div><small>Crecimiento vs. mes anterior</small><strong>+12.5%</strong></div></div></section>
        <section class="demo-kpis">
            <article class="dk-big"><h3><span class="dk-ic">${icon(I.chart)}</span>Ventas y conciliación</h3>
                <div class="dk-cols"><div><small>Importe ventas</small><strong>${money(728450)}</strong><em>▲ 12.5% vs. mes anterior</em></div>
                <div><small>Conciliado</small><strong>${money(706230)}</strong><em>▲ 11.8% vs. mes anterior</em></div>
                <div class="dk-split"><small>Facturado</small><strong>${money(706230)}</strong><small>Facturado con relación</small><b>${money(504120)}</b><small>Facturado sin relación</small><b>${money(202110)}</b></div></div></article>
            ${kpi('Venta por facturar', '#D2453B', 'doc', money(22220), [['Cierres', '18'], ['Facturado c/ relación', money(14350)], ['Facturado s/ relación', money(7870)]])}
            ${kpi('Consumos', '#3B5BDB', 'db', money(412560), [['Piezas', '125,430'], ['Facturado', money(412560)]])}
            ${kpi('Eventos', '#2F8F7B', 'cal', money(86320), [['Piezas', '8,420'], ['Facturado', money(86320)]])}
            ${kpi('Otros ingresos', '#E07A2E', 'dots', money(28350), [['Piezas', '2,860'], ['Facturado', money(28350)]])}
        </section>
        <section class="demo-row3">
            <article class="dk-wide is-blue"><h3><span class="dk-ic">${icon(I.card)}</span>Cuentas por cobrar</h3><div class="dk-cols"><div><small>Saldo total</small><strong>${money(195430)}</strong><span class="dk-chip">12% del total de ventas</span></div><div><small>Clientes con saldo</small><strong>28</strong><em>▲ 4 vs. mes anterior</em></div></div></article>
            <article class="dk-wide is-violet"><h3><span class="dk-ic">${icon(I.card)}</span>Cuentas por pagar</h3><div class="dk-cols"><div><small>Saldo total</small><strong>${money(143220)}</strong><span class="dk-chip">9% del total de compras</span></div><div><small>Proveedores con saldo</small><strong>16</strong><em>▲ 2 vs. mes anterior</em></div></div></article>
            <article class="dk-wide is-pink"><h3><span class="dk-ic">${icon(I.box)}</span>Inventario</h3><div class="dk-cols"><div><small>Valor total</small><strong>${money(1482350)}</strong><span class="dk-chip">+3.8% vs. mes anterior</span></div></div></article>
        </section>
        <section class="demo-table"><header><h2>Comedores con mayor venta</h2><span class="demo-tag">Datos ficticios</span></header>
            ${table(['Comedor', 'Cliente', 'Comensales', 'Venta', 'Estatus'], SITES.slice(0, 6).map((s, i) => [`<b>${s}</b>`, ['Cliente Demo A', 'Cliente Demo B', 'Cliente Demo C'][i % 3], (4210 - i * 310).toLocaleString('es-MX'), money(98450 - i * 8730), status(i)]))}</section>`;
    }
    function status(i) {
        const s = [['Conciliado', 'ok'], ['En revisión', 'info'], ['Pendiente', 'warn'], ['Conciliado', 'ok'], ['Pendiente', 'warn'], ['Conciliado', 'ok'], ['En revisión', 'info'], ['Cancelado', 'off']][i % 8];
        return `<span class="demo-st is-${s[1]}"><i></i>${s[0]}</span>`;
    }
    function table(cols, rows) {
        return `<div class="demo-tbl"><table><thead><tr>${cols.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    function listPage(a, chain) {
        const title = label(a);
        const mod = fold(label(chain[0]));
        const people = /recursos humanos|learning|usuarios|empleado|colaborador/.test(fold(title + ' ' + mod));
        const moneyish = /pos|compras|cxp|finanzas|factur|cotiza|comercial|srm|retail/.test(mod);
        let cols, rows;
        if (people) {
            cols = ['Colaborador', 'Puesto', 'Área', 'Estatus', 'Ingreso'];
            rows = NAMES.map((n, i) => [`<span class="demo-who"><i>${n.split(' ').map((p) => p[0]).join('')}</i><b>${n}</b></span>`, ['Cocinera', 'Supervisor', 'Nutrióloga', 'Almacenista', 'Cajera', 'Chef', 'Auxiliar', 'Gerente'][i], ['Operaciones', 'Operaciones', 'Calidad', 'Logística', 'POS', 'Operaciones', 'Compras', 'Comercial'][i], status([0, 0, 2, 0, 1, 0, 7, 0][i]), `${(i * 4) % 27 + 1} ${['ene', 'mar', 'jun', 'ago', 'oct'][i % 5]} 202${3 + (i % 3)}`]);
        } else if (moneyish) {
            cols = ['Folio', 'Comedor / proveedor', 'Monto', 'Estatus', 'Fecha'];
            rows = SITES.map((s, i) => [`<b>#DEMO-${2291 - i * 37}</b>`, s, money(12840 + i * 7315), status(i), `${28 - i * 3} ${(MONTH[st.season] || 'Diciembre').slice(0, 3).toLowerCase()} 2026`]);
        } else {
            cols = ['Clave', 'Nombre', 'Responsable', 'Estatus', 'Actualizado'];
            rows = SITES.map((s, i) => [`<b>${title.slice(0, 3).toUpperCase()}-${410 + i * 7}</b>`, `${title} · ${['General', 'Operativo', 'Regional', 'Temporal', 'Especial', 'Interno', 'Externo', 'Histórico'][i]}`, `<span class="demo-who"><i>${NAMES[(i + 3) % 8].split(' ').map((p) => p[0]).join('')}</i>${NAMES[(i + 3) % 8]}</span>`, status(i), `hace ${i + 1} h`]);
        }
        const path = chain.map(label).join(' › ');
        return `<header class="demo-head"><div><h1>${title}</h1><p>${path} · 128 registros de ejemplo</p></div><div class="demo-actions"><button type="button" class="demo-ghost" data-demo-toast="Demostración: la exportación está desactivada.">${icon(I.tray)}Exportar</button><button type="button" class="demo-primary" data-demo-toast="Demostración: no se crean registros.">${icon(I.plus)}Nuevo</button></div></header>
        <section class="demo-toolbar"><span class="demo-input is-search">${icon(I.search)}Buscar en ${title.toLowerCase()}…</span><span class="demo-input">Estatus${icon(I.down)}</span><span class="demo-input">Responsable${icon(I.down)}</span><span class="demo-tag">Datos ficticios</span></section>
        <section class="demo-table">${table(cols, rows)}<footer><span>Mostrando 1–8 de 128</span><span class="demo-pages"><b>1</b><i>2</i><i>3</i><i>…</i><i>16</i></span></footer></section>`;
    }
    function renderPage(a, chain) {
        const page = $('#demo-page');
        if (!page) return;
        page.innerHTML = pathOf(a.getAttribute('href')) === '/dashboard' ? dashboard() : listPage(a, chain);
    }

    // ---------- Interacciones que en el ERP van al servidor ----------
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[href]');
        if (a && !/^https?:\/\/(?!localhost)/.test(a.getAttribute('href') || '')) {
            e.preventDefault();
        }
        const t = e.target.closest('[data-demo-toast]');
        if (t) toast(t.dataset.demoToast);
        // Mary detiene el clic en los grupos (@click.stop): la navegación se decide aquí, en captura, y se aplica al
        // terminar el evento para que contour.js mida antes la apertura de origen.
        const link = e.target.closest('#sidebar-pexss .sidebar-menu-search .menu a[href]');
        if (link && !link.classList.contains('is-current-menu')) setTimeout(() => apply(link.getAttribute('href')), 0);
    }, true);
    document.addEventListener('click', (e) => {
        if (e.target.closest('#user-block a[href]')) toast('Demostración: el perfil no está disponible.');
        const hub = e.target.closest('.pexss-hub__item[data-hub-item]');
        if (hub) toast(`Demostración: aquí se abriría «${label(hub.querySelector('.pexss-hub__item-label') || hub)}».`);
    });
    document.addEventListener('submit', (e) => { e.preventDefault(); toast('Demostración: esta acción está desactivada.'); }, true);

    // ---------- Panel A/B ----------
    function paintPanel() {
        $$('[data-demo-variant]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.demoVariant === st.variant)));
        $$('[data-demo-theme]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.demoTheme === st.theme)));
        $$('[data-demo-collapse]').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.demoCollapse === '1') === !!st.collapsed)));
        const sel = $('#demo-season');
        if (sel) sel.value = st.season;
    }
    function drawer() { const el = $('.drawer-side[x-data]'); return el && window.Alpine ? window.Alpine.$data(el) : null; }
    function bindPanel() {
        $$('[data-demo-variant]').forEach((b) => b.addEventListener('click', () => {
            if (st.variant === b.dataset.demoVariant) return;
            st.variant = b.dataset.demoVariant;
            save();
            try { sessionStorage.removeItem('pexss.contour.sceneEntered'); sessionStorage.removeItem('pexss.navanim.played'); } catch (x) {}
            location.reload();
        }));
        $$('[data-demo-theme]').forEach((b) => b.addEventListener('click', () => {
            if (b.dataset.demoTheme === st.theme) return;
            const label = $('.pexss-theme-toggle label');
            if (label) label.click(); else { document.documentElement.classList.toggle('dark'); }
        }));
        $$('[data-demo-collapse]').forEach((b) => b.addEventListener('click', () => {
            const d = drawer();
            const want = b.dataset.demoCollapse === '1';
            if (d && d.collapsed !== want) d.toggle();
        }));
        $('#demo-season')?.addEventListener('change', (e) => {
            st.season = e.target.value; save();
            try { sessionStorage.removeItem('pexss.contour.sceneEntered'); } catch (x) {}
            location.reload();
        });
        $('[data-demo-replay]')?.addEventListener('click', () => {
            save();
            try { sessionStorage.removeItem('pexss.contour.sceneEntered'); } catch (x) {}
            location.reload();
        });
        // El toggle real del header y el de la demo se mantienen sincronizados.
        new MutationObserver(() => {
            const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            if (t !== st.theme) { st.theme = t; save(); paintPanel(); }
        }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        window.addEventListener('sidebar-toggled', (e) => { st.collapsed = !!e.detail; save(); paintPanel(); });
        paintPanel();
    }

    // Buscar empleado: el mismo desplegable del ERP; la búsqueda real es de Livewire, aquí no consulta nada.
    document.addEventListener('alpine:init', () => {
        window.Alpine.data('employeeSearchDropdown', () => ({
            open: false, q: '',
            toggle() { this.open = !this.open; if (this.open) this.$nextTick(() => this.$refs.query?.focus()); },
            away() { this.open = false; },
            clearWire() { this.q = ''; },
            scheduleSearch() {},
        }));
    });

    document.addEventListener('DOMContentLoaded', () => {
        snapshotIcons();
        apply(st.route || '/dashboard', { initial: true });
        const d = drawer();
        if (d && st.collapsed && !d.collapsed) d.collapsed = true;
        bindPanel();
    });
})();

// Propuesta «Ejecutivo»: las formas salvia del header respiran de forma continua; el botón ⏸/▶ (discreto, en la esquina
// del cielo) las congela donde van y las reanuda desde ahí; se recuerda. Con «reducir movimiento» arranca en pausa.
(function () {
    const root = document.documentElement;
    if (!root.hasAttribute('data-demo-exec')) return;
    const KEY = 'pexss.exec.breath';
    let pref = null;
    try { pref = localStorage.getItem(KEY); } catch (e) {}
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let moving = !(pref === 'off' || (reduced && pref !== 'live'));
    const PAUSE = '<svg class="ex-breath__pause" viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="2.5" width="3" height="11" rx="1.2" fill="currentColor"/><rect x="9.5" y="2.5" width="3" height="11" rx="1.2" fill="currentColor"/></svg>';
    const PLAY = '<svg class="ex-breath__play" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 2.8v10.4a.8.8 0 0 0 1.2.7l8.2-5.2a.8.8 0 0 0 0-1.4L6.2 2.1A.8.8 0 0 0 5 2.8Z" fill="currentColor"/></svg>';

    // El SVG animado sale del token del tema activo (--ex-waves-live), con ids propios para no chocar con la página.
    function wavesMarkup() {
        const v = getComputedStyle(root).getPropertyValue('--ex-waves-live').trim();
        const i = v.indexOf(',');
        if (i < 0) return '';
        return decodeURIComponent(v.slice(i + 1, v.lastIndexOf('"'))).replace(/id='/g, "id='exw-").replace(/url\(#/g, 'url(#exw-');
    }
    function syncWaves(header) {
        const markup = wavesMarkup();
        let host = header.querySelector(':scope > .ex-waves');
        if (!markup) { host?.remove(); return; }
        if (host && host.dataset.src === markup) return;
        if (!host) {
            host = document.createElement('div');
            host.className = 'ex-waves';
            host.setAttribute('aria-hidden', 'true');
            header.prepend(host);
        }
        host.dataset.src = markup;
        host.innerHTML = markup;
        const svg = host.querySelector('svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.display = 'block';
        if (!moving) svg.pauseAnimations();
    }
    function paint() {
        root.dataset.exBreath = moving ? 'live' : 'off';
        const header = document.querySelector('.header-pexss');
        const svg = header?.querySelector(':scope > .ex-waves svg');
        if (svg) moving ? svg.unpauseAnimations() : svg.pauseAnimations();
        const b = header?.querySelector('.ex-breath');
        if (!b) return;
        b.dataset.state = moving ? 'moving' : 'paused';
        const label = moving ? 'Pausar el movimiento del fondo' : 'Reanudar el movimiento del fondo';
        b.setAttribute('aria-label', label);
        b.title = label;
        b.setAttribute('aria-pressed', String(!moving));
    }
    function ensure() {
        const header = document.querySelector('.header-pexss');
        if (!header) return;
        syncWaves(header);
        if (header.querySelector('.ex-breath')) return;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ex-breath';
        b.innerHTML = PAUSE + PLAY;
        b.addEventListener('click', () => {
            moving = !moving;
            try { localStorage.setItem(KEY, moving ? 'live' : 'off'); } catch (e) {}
            paint();
        });
        header.appendChild(b);
        paint();
    }
    let queued = false;
    const schedule = () => {
        if (queued) return;
        queued = true;
        setTimeout(() => { queued = false; ensure(); }, 0);
    };
    new MutationObserver(schedule).observe(document.body || root, { childList: true, subtree: true });
    // Cambio de tema (claro/oscuro): el SVG se vuelve a tomar del token del tema nuevo.
    new MutationObserver(schedule).observe(root, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    document.addEventListener('DOMContentLoaded', ensure);
    paint();
})();
