try { 
    /**
     * Visor PDF de anuncios: canvas + PDF.js (evita el visor nativo de Chrome/Acrobat
     * que dispara chrome-extension://invalid al embeber el archivo en un iframe).
     */
    window.pexssLoadPdfJs = window.pexssLoadPdfJs || function () {
        if (window.pdfjsLib) {
            return Promise.resolve(window.pdfjsLib);
        }

        if (window.__pexssPdfJsLoading) {
            return window.__pexssPdfJsLoading;
        }

        window.__pexssPdfJsLoading = new Promise(function (resolve, reject) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
            script.async = true;
            script.onload = function () {
                if (!window.pdfjsLib) {
                    reject(new Error('PDF.js no disponible'));
                    return;
                }

                window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                    'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
                resolve(window.pdfjsLib);
            };
            script.onerror = function () {
                reject(new Error('No se pudo cargar el visor PDF'));
            };
            document.head.appendChild(script);
        });

        return window.__pexssPdfJsLoading;
    };

    window.__pexssPdfDataCache = window.__pexssPdfDataCache || new Map();

    window.pexssFetchPdfBytes = window.pexssFetchPdfBytes || function (src) {
        if (! window.__pexssPdfDataCache.has(src)) {
            const request = fetch(src, {
                credentials: src.startsWith('blob:') ? 'omit' : 'same-origin',
            }).then(function (response) {
                if (! response.ok) {
                    throw new Error('PDF HTTP ' + response.status);
                }

                return response.arrayBuffer();
            }).catch(function (error) {
                window.__pexssPdfDataCache.delete(src);
                throw error;
            });

            window.__pexssPdfDataCache.set(src, request);
        }

        return window.__pexssPdfDataCache.get(src).then(function (buffer) {
            return buffer.slice(0);
        });
    };

    window.pexssAnnouncementPdfViewer = window.pexssAnnouncementPdfViewer || function () {
        // PDF.js usa campos privados (#d). Alpine envuelve x-data en Proxy y rompe getPage().
        const engine = {
            pdfDoc: null,
            renderTask: null,
            loadedSrc: '',
            loadId: 0,
        };

        return {
            src: '',
            downloadUrl: '',
            name: 'Documento.pdf',
            page: 1,
            pages: 0,
            loading: true,
            error: '',
            mountFromParent() {
                const read = () => {
                    const root = this.$el.parentElement;
                    this.src = root?.getAttribute('data-pdf-src') || '';
                    this.downloadUrl = root?.getAttribute('data-pdf-download') || '';
                    this.name = root?.getAttribute('data-pdf-name') || 'Documento.pdf';

                    return this.loadPdf();
                };

                return this.$nextTick().then(read);
            },
            async loadPdf() {
                const loadId = ++engine.loadId;

                if (!this.src) {
                    this.loading = false;
                    this.error = 'No hay un PDF para mostrar.';
                    return;
                }

                if (engine.loadedSrc === this.src && engine.pdfDoc) {
                    this.loading = false;
                    this.error = '';
                    await this.$nextTick();
                    await this.renderPage();
                    return;
                }

                this.loading = true;
                this.error = '';
                this.page = 1;
                this.pages = 0;

                try {
                    const pdfjsLib = await window.pexssLoadPdfJs();
                    const bytes = await window.pexssFetchPdfBytes(this.src);

                    if (loadId !== engine.loadId) {
                        return;
                    }

                    engine.pdfDoc = await pdfjsLib.getDocument({
                        data: new Uint8Array(bytes),
                        isEvalSupported: false,
                    }).promise;

                    if (loadId !== engine.loadId) {
                        engine.pdfDoc?.destroy();
                        engine.pdfDoc = null;
                        return;
                    }

                    engine.loadedSrc = this.src;
                    this.pages = engine.pdfDoc.numPages || 0;
                    this.loading = false;
                    await this.$nextTick();
                    await this.renderPage();
                } catch (error) {
                    if (loadId !== engine.loadId) {
                        return;
                    }

                    this.loading = false;
                    this.error = 'No se pudo mostrar el PDF. Descárgalo para verlo.';
                    console.error('[Anuncios] No se pudo renderizar el PDF.', error);
                }
            },
            async renderPage() {
                const canvas = this.$refs.canvas;
                if (!engine.pdfDoc || !canvas) {
                    return;
                }

                if (engine.renderTask) {
                    try {
                        engine.renderTask.cancel();
                    } catch (error) {
                        // La cancelación es informativa; el siguiente render sigue igual.
                    }
                }

                const page = await engine.pdfDoc.getPage(this.page);
                const context = canvas.getContext('2d');
                const stage = this.$refs.stage;
                const unscaled = page.getViewport({ scale: 1 });
                const width = Math.max(320, (stage?.clientWidth || 800) - 24);
                const scale = width / unscaled.width;
                const outputScale = window.devicePixelRatio || 1;
                const viewport = page.getViewport({ scale: scale * outputScale });

                canvas.width = viewport.width;
                canvas.height = viewport.height;
                canvas.style.width = width + 'px';
                canvas.style.height = (unscaled.height * scale) + 'px';

                engine.renderTask = page.render({
                    canvasContext: context,
                    viewport,
                });

                try {
                    await engine.renderTask.promise;
                } catch (error) {
                    if (error?.name !== 'RenderingCancelledException') {
                        throw error;
                    }
                } finally {
                    engine.renderTask = null;
                }
            },
            async goTo(page) {
                const next = Math.min(this.pages, Math.max(1, page));
                if (next === this.page) {
                    return;
                }

                this.page = next;
                await this.renderPage();
            },
            teardown() {
                engine.loadId += 1;

                if (engine.renderTask) {
                    try {
                        engine.renderTask.cancel();
                    } catch (error) {
                        // noop
                    }
                }

                engine.pdfDoc?.destroy();
                engine.pdfDoc = null;
                engine.renderTask = null;
                engine.loadedSrc = '';
            },
        };
    };

    /**
     * Atrás / adelante del navegador.
     * Con wire:navigate, Livewire guarda snapshots en history.state.alpine; un reload() aquí
     * compite con ese flujo y puede dejar la URL en la página anterior + recarga completa.
     * Solo forzamos recarga cuando el estado no es de la pila SPA de Livewire.
     */
    window.addEventListener('popstate', function (event) {
        const state = event.state || {};
        const alpine = state.alpine || {};
        if (alpine.snapshotIdx) {
            return;
        }
        window.location.reload();
    });
    window.pexssIsRecepcionesOcPath = window.pexssIsRecepcionesOcPath || function () {
        return (window.location.pathname || '') === '/CxP/recepciones-oc';
    };
    window.pexssIsQualityAuditsPath = window.pexssIsQualityAuditsPath || function (pathname) {
        var p = pathname || window.location.pathname || '';
        return p === '/quality/audits' || p.indexOf('/quality/audits/') === 0;
    };
    window.pexssIsQualityIncidencesPath = window.pexssIsQualityIncidencesPath || function (pathname) {
        var p = pathname || window.location.pathname || '';
        return p === '/quality/incidences' || p.indexOf('/quality/incidences/') === 0;
    };
    window.pexssIsQualitySupplierIncidencesPath = window.pexssIsQualitySupplierIncidencesPath || function (pathname) {
        var p = pathname || window.location.pathname || '';
        return p === '/quality/supplier-incidences' || p.indexOf('/quality/supplier-incidences/') === 0;
    };
    window.pexssIsQualityNavPath = window.pexssIsQualityNavPath || function (pathname) {
        return window.pexssIsQualityAuditsPath(pathname)
            || window.pexssIsQualityIncidencesPath(pathname)
            || window.pexssIsQualitySupplierIncidencesPath(pathname);
    };
    window.pexssRecepcionesOcShellReady = false;
    window.pexssRecepcionesOcShellHideTimer = null;

    window.pexssReleaseRecepcionesOcShellLoader = function () {
        if (window.pexssRecepcionesOcShellReady || !window.pexssIsRecepcionesOcPath()) {
            return;
        }

        window.pexssRecepcionesOcShellReady = true;
        clearTimeout(window.pexssRecepcionesOcShellHideTimer);

        var initialEl = document.getElementById('initial-loader');
        if (initialEl) {
            initialEl.remove();
        }

        if (window.Alpine && typeof Alpine.store === 'function') {
            var loaderStore = Alpine.store('loader');
            if (loaderStore) {
                loaderStore.pending = 0;
                loaderStore.show = false;
            }
        }
    };

    window.pexssScheduleReleaseRecepcionesOcShellLoader = function (delayMs) {
        if (window.pexssRecepcionesOcShellReady || !window.pexssIsRecepcionesOcPath()) {
            return;
        }

        clearTimeout(window.pexssRecepcionesOcShellHideTimer);
        window.pexssRecepcionesOcShellHideTimer = setTimeout(function () {
            requestAnimationFrame(function () {
                requestAnimationFrame(window.pexssReleaseRecepcionesOcShellLoader);
            });
        }, delayMs ?? 120);
    };

    window.pexssBootRecepcionesOcShellLoader = function () {
        if (!window.pexssIsRecepcionesOcPath()) {
            return;
        }

        window.pexssRecepcionesOcShellReady = false;
        clearTimeout(window.pexssRecepcionesOcShellHideTimer);

        if (window.Alpine && typeof Alpine.store === 'function') {
            var loaderStore = Alpine.store('loader');
            if (loaderStore) {
                loaderStore.pending = Math.max(loaderStore.pending || 0, 1);
                loaderStore.show = true;
            }
        }
    };

    (function() {
        function removeInitial() {
            var el = document.getElementById('initial-loader');
            if (el) el.remove();
        }
        var isDashboard = (window.location.pathname || '') === '/dashboard';
        var isRecepcionesOc = window.pexssIsRecepcionesOcPath();

        if (isDashboard || isRecepcionesOc) {
            if (isRecepcionesOc) {
                setTimeout(function () {
                    window.pexssReleaseRecepcionesOcShellLoader();
                }, 15000);
            }

            return;
        } else if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(removeInitial, 0);
        } else {
            document.addEventListener('DOMContentLoaded', removeInitial, { once: true });
        }
        setTimeout(removeInitial, 15000);
    })();
    window.pexssDashboardShellReady = false;
    window.pexssAnnouncementsModalOpen = false;
    document.addEventListener('livewire:init', function() {
        Livewire.on('dashboard-shell-ready', function() {
            window.pexssDashboardShellReady = true;
        });
        Livewire.on('recepciones-oc-shell-ready', function () {
            window.pexssScheduleReleaseRecepcionesOcShellLoader(80);
        });
    });
    document.addEventListener('livewire:initialized', function () {
        window.pexssScheduleReleaseRecepcionesOcShellLoader(120);
    });
    document.addEventListener("alpine:init", () => {
        /*
         * F10 · Utility Hub del header. Panel con buscador que lanza las utilidades originales (apiladas en
         * $refs.stack): al elegir una, el hub se cierra y en el siguiente tick se pulsa el disparador original, para que
         * su propio click.outside no lo cierre con el mismo clic. El estado (avisos de importaciones, descargas en curso,
         * total de diagramas) se lee de los badges que ya pintan los componentes; un MutationObserver lo sigue sin
         * peticiones propias y se desconecta en destroy() (wire:navigate reconstruye el layout).
         */
        Alpine.data('pexssUtilityHub', () => ({
            open: false,
            shown: false,                                       // visible en pantalla (sigue un momento tras cerrar, para la salida)
            query: '',
            launched: null,
            status: { imports: false, downloads: '', guides: '', announcements: '' },
            toolOpen: false,

            get activity() {
                return this.status.imports || this.status.downloads !== '';
            },

            get activityText() {
                const parts = [];
                if (this.status.imports) parts.push('importaciones con avisos');
                if (this.status.downloads) parts.push(`${this.status.downloads} en Mis descargas`);
                return parts.length ? `Con actividad: ${parts.join(', ')}` : '';
            },

            init() {
                this.readStatus();
                this._observer = new MutationObserver(() => this.readStatus());
                const watch = { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['style', 'open'] };
                this._observer.observe(this.$refs.stack, watch);
                // Anuncios vive fuera del hub (en la fila): su badge y su menú se siguen igual que los apilados.
                const announcements = document.querySelector('[data-header-announcements]');
                if (announcements) this._observer.observe(announcements, watch);
                // Último pointerdown: distingue un cierre por clic fuera (el foco se queda donde el usuario hizo clic) de uno
                // por Escape o por la X del panel (el foco vuelve a Herramientas).
                // Se decide en el pointerdown: tras un roundtrip el nodo pulsado (la X de Mis descargas) ya no está en el DOM.
                this._onPointerDown = (event) => {
                    this._pointerAt = Date.now();
                    this._pointerInside = Boolean(this.launched && this.sourceEl(this.launched)?.contains(event.target));
                };
                window.addEventListener('pointerdown', this._onPointerDown, true);
            },

            destroy() {
                this._observer?.disconnect();
                window.removeEventListener('pointerdown', this._onPointerDown, true);
                clearTimeout(this._launchTimer);
                clearTimeout(this._focusTimer);
                clearTimeout(this._closeTimer);
            },

            readStatus() {
                const badge = (key) => [...this.$refs.stack.querySelectorAll(`[data-hub-tool="${key}"] [data-header-badge]`)]
                    .find((el) => el.style.display !== 'none');
                const announcementsBadge = document.querySelector('[data-header-announcements] [data-header-badge]');
                const next = {
                    imports: Boolean(badge('imports')),
                    downloads: badge('downloads')?.textContent.trim() || '',
                    guides: this.$refs.stack.querySelector('[data-hub-tool="guides"] [x-ref="trigger"] > span')?.textContent.trim() || '',
                    announcements: announcementsBadge && announcementsBadge.style.display !== 'none' ? announcementsBadge.textContent.trim() : '',
                };
                if (Object.keys(next).some((key) => next[key] !== this.status[key])) {
                    this.status = next;
                }
                // Herramienta abierta desde el hub: tono activo en el botón mientras su panel siga visible.
                // Un cierre se confirma un tick después: un re-render de Livewire puede cerrar y reabrir el panel al instante.
                const open = this.sourceOpen();
                if (open && !this.toolOpen) {
                    this.toolOpen = true;
                } else if (!open && this.toolOpen) {
                    clearTimeout(this._closeTimer);
                    this._closeTimer = setTimeout(() => {
                        if (!this.toolOpen || this.sourceOpen()) return;
                        this.toolOpen = false;
                        this.onSourceClosed();
                    }, 0);
                }
            },

            normalize(text) {
                return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
            },

            matches(text) {
                const query = this.normalize(this.query);
                if (!query) return true;
                const haystack = this.normalize(text);
                return query.split(/\s+/).every((term) => haystack.includes(term));
            },

            anyMatch(scope) {
                return [...scope.querySelectorAll('[data-hub-item]')].some((item) => this.matches(item.dataset.search));
            },

            visibleItems() {
                return [...this.$refs.panel.querySelectorAll('[data-hub-item]')].filter((item) => this.matches(item.dataset.search));
            },

            toggle(fromKeyboard) {
                this.open ? this.close(false) : this.show(fromKeyboard);
            },

            // Puntero fino: el foco entra al buscador. Táctil: nunca al campo (no abre el teclado virtual sin pedirlo); si se
            // abrió con teclado o desde «Más», el foco va al panel para que las flechas sigan funcionando.
            // queueMicrotask: corre después del flush que quita [hidden] al panel, así lo que se teclea entra al buscador.
            // Sin buscador: con teclado el foco va a la primera herramienta; con puntero, al panel (Escape y flechas siguen).
            // Entrada del rediseño: el panel cae con un leve rebote y los mosaicos llegan en cascada (35 ms entre cada uno).
            show(fromKeyboard) {
                this.query = '';
                this.open = true;
                this.shown = true;
                queueMicrotask(() => {
                    this.place();
                    const first = this.visibleItems()[0];
                    fromKeyboard && first ? first.focus() : this.$refs.panel.focus({ preventScroll: true });
                    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                    this.$refs.panel.getAnimations().forEach((a) => a.cancel());
                    this.$refs.panel.animate([{ opacity: 0, transform: 'translateY(-8px) scale(.94)' }, { opacity: 1, transform: 'translateY(1px) scale(1.01)', offset: 0.7 }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.2,.8,.3,1)' });
                    this.visibleItems().forEach((item, i) => item.animate([{ opacity: 0, transform: 'translateY(-5px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: 60 + i * 35, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
                });
            },

            // Alineado al borde derecho del botón (CSS); si no cabe a la izquierda (320 px con el hub fuera del extremo),
            // se desplaza lo justo para dejar 8 px de margen. El alto máximo llega hasta 12 px antes del borde inferior
            // del viewport: con más herramientas, el listado hace scroll y el buscador queda fijo arriba.
            place() {
                const panel = this.$refs.panel;
                panel.style.right = '';
                const rect = panel.getBoundingClientRect();
                if (rect.left < 8) panel.style.right = `${rect.left - 8}px`;
                panel.style.maxHeight = `${Math.max(180, window.innerHeight - rect.top - 12)}px`;
            },

            // Salida breve (160 ms) antes de ocultarlo; con movimiento reducido se oculta al instante.
            close(returnFocus) {
                if (!this.open) return;
                this.open = false;
                if (returnFocus) this.$refs.trigger.focus();
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    this.shown = false;
                    return;
                }
                this.$refs.panel.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-6px) scale(.96)' }], { duration: 160, easing: 'ease-in' })
                    .finished.then(() => { if (!this.open) this.shown = false; }, () => {});
            },

            launch(key) {
                const trigger = this.sourceEl(key)?.querySelector('summary, [x-ref="trigger"]');
                this.close(false);
                this.launched = key;
                this._pointerAt = 0;
                clearTimeout(this._launchTimer);
                // En el siguiente tick: el click.outside del componente ya procesó el clic que eligió la herramienta.
                this._launchTimer = setTimeout(() => {
                    trigger?.click();
                    this.focusInto(key);
                }, 0);
            },

            // Anuncios no está apilado: su ranura abre el menú (misma instancia Livewire) anclado a Herramientas, sin
            // mostrar el megáfono.
            launchAnnouncements() {
                this.close(false);
                this.launched = 'announcements';
                this._pointerAt = 0;
                clearTimeout(this._launchTimer);
                // En el siguiente tick, como launch(): si no, el click.outside del dropdown de Mary lo cierra con este clic.
                this._launchTimer = setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('pexss-announcements-open'));
                    this.focusInto('announcements');
                }, 0);
            },

            sourceEl(key) {
                return key === 'announcements'
                    ? document.querySelector('[data-header-announcements]')
                    : this.$refs.stack.querySelector(`[data-hub-tool="${key}"]`);
            },

            // Panel visible de una herramienta: el de Alpine/Livewire (data-header-panel) o el menú de un dropdown de Mary.
            panelOf(key) {
                const source = key && this.sourceEl(key);
                if (!source) return null;
                const details = source.querySelector('details[open]');
                if (details) return details.querySelector('ul');
                return [...source.querySelectorAll('[data-header-panel]')].find((panel) => panel.getClientRects().length > 0) || null;
            },

            sourceOpen() {
                return Boolean(this.panelOf(this.launched));
            },

            // Al abrir, el foco entra al panel (su contenedor, para no caer en una acción como «Eliminar todos»); si el
            // propio componente ya lo puso dentro (el campo de Buscar empleado), se respeta. Espera hasta ~2 s porque Mis
            // descargas abre con un roundtrip de Livewire.
            focusInto(key, attempt = 0) {
                clearTimeout(this._focusTimer);
                this._focusTimer = setTimeout(() => {
                    if (this.launched !== key) return;
                    const panel = this.panelOf(key);
                    if (!panel) {
                        if (attempt < 20) this.focusInto(key, attempt + 1);
                        return;
                    }
                    if (panel.contains(document.activeElement)) return;
                    if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '-1');
                    panel.focus({ preventScroll: true });
                    this.keepFocus(key);
                }, attempt === 0 ? 60 : 100);
            },

            // Un roundtrip al abrir (refreshMenu de Anuncios) vuelve a pintar el panel y el morph quita el tabindex: si el
            // foco cae a body mientras el panel sigue abierto, se devuelve al panel. Solo durante el primer segundo y medio.
            keepFocus(key, checks = 0) {
                this._focusTimer = setTimeout(() => {
                    if (this.launched !== key) return;
                    const panel = this.panelOf(key);
                    if (!panel) return;
                    if (document.activeElement === document.body) {
                        if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '-1');
                        panel.focus({ preventScroll: true });
                    }
                    if (checks < 5) this.keepFocus(key, checks + 1);
                }, 300);
            },

            // Escape con una herramienta abierta desde el hub. Las que no cierran solas con Escape se cierran con su propio
            // mecanismo: el estado del dropdown en Descargar reportes;
            // Anuncios lo cierra su ranura. Con otro modal encima, el Escape no es de la herramienta.
            onEscape() {
                if (this.open || !this.launched || !this.sourceOpen()) return;
                if (document.querySelector('dialog[open], .modal-open')) return;
                this._pointerAt = 0;
                const source = this.sourceEl(this.launched);
                if (this.launched === 'reports') {
                    const details = source.querySelector('details[open]');
                    if (details) Alpine.$data(details).open = false;
                }
            },

            // El panel de origen se cerró (Escape, su X, una acción o clic fuera). Tras un clic fuera el foco queda donde el
            // usuario hizo clic; en los demás casos, si quedó en body o en un elemento oculto, vuelve a Herramientas.
            onSourceClosed() {
                const key = this.launched;
                this.launched = null;
                clearTimeout(this._focusTimer);
                const source = this.sourceEl(key);
                // Clic fuera reciente: el foco se queda donde el usuario hizo clic. 2 s cubren el roundtrip de Mis descargas.
                const recentPointer = Date.now() - (this._pointerAt || 0) < 2000;
                if (recentPointer && !this._pointerInside) return;
                if (document.querySelector('dialog[open], .modal-open')) return;
                // Con el panel ya cerrado, un foco que siga dentro de la herramienta está en algo que se va a ocultar (su
                // disparador apilado, el menú que se cierra o el megáfono colapsado): vuelve a Herramientas.
                const active = document.activeElement;
                const lost = !active || active === document.body || Boolean(source?.contains(active))
                    || this.$refs.stack.contains(active) || getComputedStyle(active).visibility === 'hidden';
                if (lost) this.$refs.trigger.focus({ preventScroll: true });
            },

            onKeydown(event) {
                const items = this.visibleItems();
                const index = items.indexOf(document.activeElement);
                if (event.key === 'Escape') {
                    event.stopPropagation();
                    this.close(true);
                } else if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(event.key)) {
                    // Cuadrícula de 3 columnas: izquierda/derecha avanzan de uno en uno, arriba/abajo de fila en fila.
                    event.preventDefault();
                    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 3, ArrowUp: -3 }[event.key];
                    const next = index === -1 ? 0 : Math.max(0, Math.min(items.length - 1, index + step));
                    items[next]?.focus();
                } else if ((event.key === 'Home' || event.key === 'End') && index !== -1) {
                    event.preventDefault();
                    (event.key === 'Home' ? items[0] : items[items.length - 1])?.focus();
                }
            },

            onFocusOut(event) {
                const next = event.relatedTarget;
                if (next && !this.$refs.panel.contains(next) && next !== this.$refs.trigger) this.close(false);
            },
        }));

        /*
         * F9C.2 · Ranura contextual de Anuncios. El conteo se lee del badge que ya pinta el componente (x-show sobre
         * $wire.unreadCount); un MutationObserver lo sigue sin peticiones propias. Visible con anuncios sin ver, con foco
         * dentro, con su menú abierto o mientras el hub la reveló. La animación (160 ms) se habilita después del primer
         * cálculo para que la carga y cada wire:navigate no la reproduzcan.
         */
        Alpine.data('pexssAnnouncementsSlot', () => ({
            count: 0,
            anchored: false,

            init() {
                this.read();
                this._observer = new MutationObserver(() => this.read());
                this._observer.observe(this.$el, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['style'] });
                requestAnimationFrame(() => this.$el.classList.add('is-motion-ready'));
            },

            destroy() {
                this._observer?.disconnect();
                clearTimeout(this._layoutTimer);
                clearTimeout(this._blurTimer);
            },

            read() {
                const badge = this.$el.querySelector('[data-header-badge]');
                const count = badge && badge.style.display !== 'none' ? (parseInt(badge.textContent, 10) || 1) : 0;
                if (count !== this.count) this.count = count;
                this.apply();
            },

            menuOpen() {
                return Boolean(this.$el.querySelector('details[open]'));
            },

            apply() {
                // Abierto desde el hub con 0 sin ver, el menú se ancla a Herramientas y el megáfono sigue oculto.
                const inUse = !this.anchored && (this.menuOpen() || this.$el.contains(document.activeElement));
                const visible = this.count > 0 || inUse;
                if (visible === !this.$el.classList.contains('is-collapsed')) return;
                this.$el.classList.toggle('is-collapsed', !visible);
                // El paginador mide anchos reales: se recalcula al terminar la transición (transitionend) o, sin
                // animación (carga, reduced-motion), en el siguiente tick; el temporizador queda de respaldo.
                clearTimeout(this._layoutTimer);
                const animated = this.$el.classList.contains('is-motion-ready') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                this._layoutTimer = setTimeout(() => this.relayout(), animated ? 260 : 0);
            },

            openFromHub() {
                const summary = this.$el.querySelector('summary');
                if (!summary || this.menuOpen()) return;
                // Con el megáfono visible el menú abre bajo él; colapsado, abre bajo Herramientas (la ranura mide 0 y queda
                // pegada a su borde izquierdo) sin revelar ningún icono temporal.
                this.anchored = this.$el.classList.contains('is-collapsed');
                this.$el.classList.toggle('is-hub-anchored', this.anchored);
                summary.click();
            },

            // El refreshMenu al abrir vuelve a pintar el componente y el details se cierra y reabre un instante: un cierre
            // solo cuenta si un tick después sigue cerrado (si no, se perdía el anclaje a Herramientas).
            onToggle(event) {
                const details = event.target;
                if (details.tagName !== 'DETAILS' || details.open) return;
                setTimeout(() => {
                    if (details.open) return;
                    this.anchored = false;
                    this.$el.classList.remove('is-hub-anchored');
                    this.apply();
                }, 0);
            },

            // El dropdown de Mary no cierra con Escape: se cierra aquí con su propio estado. Abierto desde el megáfono, el
            // foco vuelve al megáfono; abierto desde el hub, el hub lo devuelve a Herramientas.
            onEscape() {
                const details = this.$el.querySelector('details[open]');
                if (!details || document.querySelector('dialog[open], .modal-open')) return;
                const fromMegaphone = !this.anchored;
                Alpine.$data(details).open = false;
                if (fromMegaphone) this.$el.querySelector('summary')?.focus({ preventScroll: true });
            },

            // setTimeout y no microtask: el foco tiene que haber llegado a su destino antes de decidir si se oculta.
            onFocusOut(event) {
                if (this.$el.contains(event.relatedTarget)) return;
                clearTimeout(this._blurTimer);
                this._blurTimer = setTimeout(() => this.apply(), 0);
            },

            onTransitionEnd(event) {
                if (event.target !== this.$el || event.propertyName !== 'max-width') return;
                this.relayout();
            },

            relayout() {
                clearTimeout(this._layoutTimer);
                const pager = this.$el.closest('.pexss-tools-pager');
                if (pager) Alpine.$data(pager)?.layout?.();
            },
        }));

        /*
         * Iconos del header: muestra los que caben y pagina el resto con ‹ ›. Oculta con display:none
         * en lugar de overflow porque un contenedor con overflow recortaría los paneles que abren hacia abajo.
         */
        Alpine.data('headerToolsPager', () => ({
            start: 0,
            perPage: 0,
            total: 0,
            visible: [],
            badgePrev: false,
            badgeNext: false,
            _resizeObserver: null,
            _mutationObserver: null,
            _frame: null,
            _badgeFrame: null,
            _swipe: null,
            _suppressClickUntil: 0,
            moreOpen: false,
            moreItems: [],
            _tipTimer: null,
            _tipWarmUntil: 0,

            get paged() { return this.perPage < this.total; },
            get hasPrev() { return this.paged && this.start > 0; },
            get hasNext() { return this.paged && this.start + this.perPage < this.total; },

            init() {
                this._resizeObserver = new ResizeObserver(() => this.schedule());
                this._resizeObserver.observe(this.$el);
                // En lg el grupo de herramientas toma el ancho de su contenido (el breadcrumb se queda el resto): si ya
                // paginó, su ancho no crece al ensancharse el header. Observar el header vuelve a medir con todo visible.
                const header = this.$el.closest('.header-pexss');
                if (header) {
                    this._resizeObserver.observe(header);
                }
                // Los badges cambian con Livewire (aparecen, se quitan o se ocultan con x-show): solo se recalculan los puntos de las flechas.
                // x-anchor también mueve estilos al reposicionar paneles: se agrupa en un solo cálculo por frame.
                this._mutationObserver = new MutationObserver(() => {
                    cancelAnimationFrame(this._badgeFrame);
                    this._badgeFrame = requestAnimationFrame(() => this.updateBadges());
                });
                this._mutationObserver.observe(this.$refs.track, { subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'class'] });
                this.$nextTick(() => {
                    this.layout();
                    this.$el.style.overflow = 'visible';
                });
            },

            destroy() {
                this._resizeObserver?.disconnect();
                this._mutationObserver?.disconnect();
                cancelAnimationFrame(this._frame);
                cancelAnimationFrame(this._badgeFrame);
            },

            schedule() {
                cancelAnimationFrame(this._frame);
                this._frame = requestAnimationFrame(() => this.layout());
            },

            layout() {
                this.tipHide();
                const tools = [...this.$refs.track.querySelectorAll(':scope > [data-header-tool]')];
                tools.forEach((el) => { el.style.display = ''; });

                // Herramientas que no pintan nada (sin permiso o deshabilitadas) no cuentan.
                this.visible = tools.filter((el) => el.getBoundingClientRect().width > 0);
                const widths = this.visible.map((el) => el.getBoundingClientRect().width);
                const gap = parseFloat(getComputedStyle(this.$refs.track).columnGap) || 0;
                const needed = widths.reduce((sum, width) => sum + width, 0) + gap * Math.max(widths.length - 1, 0);
                // Ancho con decimales y 1 px de tolerancia: en lg el grupo mide lo que su contenido, y clientWidth
                // (entero, redondeado hacia abajo) podía quedar por debajo de `needed` y paginar sin necesidad.
                const available = this.$el.getBoundingClientRect().width;

                this.total = this.visible.length;

                if (needed <= available + 1) {
                    this.perPage = this.total;
                    this.start = 0;
                } else {
                    // F8.1: ancho reservado para los controles de página. Desktop: las dos flechas (2 × 28 px). <lg: el
                    // único «Más herramientas» más su separación (app.css publica --pexss-pager-reserve).
                    const reserve = parseFloat(getComputedStyle(this.$el).getPropertyValue('--pexss-pager-reserve')) || 2 * 28;
                    const slot = Math.max(...widths) + gap;
                    const previousPerPage = this.perPage;
                    this.perPage = Math.max(1, Math.floor((available - reserve + gap) / slot));
                    if (this.perPage !== previousPerPage) this.closeMore();
                    this.start = Math.min(this.start, Math.max(0, this.total - this.perPage));

                    // Al girar o redimensionar, el icono con un panel o modal abierto se queda en la página visible:
                    // ocultarlo escondería también su panel (o lo mandaría a la esquina) y el modal quedaría abierto por dentro.
                    const openIndex = this.visible.findIndex((el) => this.hasOpenPanel(el));
                    if (openIndex !== -1 && openIndex < this.start) {
                        this.start = openIndex;
                    } else if (openIndex !== -1 && openIndex >= this.start + this.perPage) {
                        this.start = openIndex - this.perPage + 1;
                    }
                }

                this.apply();
            },

            // Avisa en ‹ o › cuando un icono oculto de ese lado tiene badge (importación sin ver, descarga en curso, anuncios).
            updateBadges() {
                const hasBadge = (el) => [...el.querySelectorAll('[data-header-badge]')]
                    .some((badge) => getComputedStyle(badge).display !== 'none');

                this.badgePrev = this.paged && this.visible.slice(0, this.start).some(hasBadge);
                this.badgeNext = this.paged && this.visible.slice(this.start + this.perPage).some(hasBadge);
            },

            hasOpenPanel(el) {
                return Boolean(el.querySelector('details[open], dialog[open]'))
                    || [...el.querySelectorAll('[data-header-panel]')].some((panel) => panel.getClientRects().length > 0);
            },

            apply(direction = null) {
                this.visible.forEach((el, index) => {
                    el.style.display = index >= this.start && index < this.start + this.perPage ? '' : 'none';
                });
                this.updateBadges();

                // F8: entrada breve de la página nueva (app.css, solo opacidad y 6 px en los disparadores; nada de layout).
                const track = this.$refs.track;
                track.classList.remove('is-paging-next', 'is-paging-prev');
                if (direction) {
                    this.closeMore();
                    void track.offsetWidth;
                    track.classList.add(direction === 'next' ? 'is-paging-next' : 'is-paging-prev');
                }
            },

            prev() {
                if (!this.hasPrev) return;
                // F8: vuelve al inicio de la página completa anterior. La última página se ajusta al final (puede
                // solapar la anterior: 0 → 3 → 4 con 7 iconos y 3 por página); restar perPage desde ahí daba 4 → 1 y
                // el ida y vuelta (flechas o swipe) no regresaba a las mismas páginas.
                this.start = Math.max(0, (Math.ceil(this.start / this.perPage) - 1) * this.perPage);
                this.apply('prev');
                this.keepArrowFocus(this.$refs.prevArrow, this.$refs.nextArrow, this.hasPrev);
            },

            next() {
                if (!this.hasNext) return;
                this.start = Math.min(this.total - this.perPage, this.start + this.perPage);
                this.apply('next');
                this.keepArrowFocus(this.$refs.nextArrow, this.$refs.prevArrow, this.hasNext);
            },

            // Si la flecha con el foco se deshabilita al llegar al extremo, el foco pasa a la otra (no se pierde en body).
            keepArrowFocus(arrow, other, stillEnabled) {
                if (!stillEnabled && document.activeElement === arrow) {
                    this.$nextTick(() => other?.focus({ preventScroll: true }));
                }
            },

            /*
             * F8 — swipe táctil sobre el grupo de herramientas. Usa el mismo start/perPage que las flechas (prev/next):
             * no hay un segundo paginador. Solo touch/pen (el ratón tiene las flechas) y solo si hay páginas.
             * - Eje: se decide tras 10 px; horizontal solo si |dx| > 1.5 · |dy|. Un gesto vertical se abandona y el
             *   scroll sigue normal (touch-action: pan-y en app.css deja al navegador el desplazamiento vertical).
             * - Umbral: 40 px horizontales al soltar; menos es un toque y el clic sigue su curso.
             * - Tras un swipe se descarta el clic que el navegador genera al soltar (swipeGuard, fase de captura):
             *   no abre un dropdown ni ejecuta la herramienta bajo el dedo. pointercancel limpia el gesto.
             * Los listeners son x-on del propio elemento: Alpine los quita al destruirlo (wire:navigate incluido).
             */
            swipeStart(event) {
                this.tipHide();
                this._swipe = null;
                // Un toque nuevo es un gesto deliberado: ya no hay clic residual del swipe anterior que descartar.
                this._suppressClickUntil = 0;
                if (!this.paged || event.pointerType === 'mouse' || !event.isPrimary) return;
                if (event.target.closest('.pexss-tools-more')) return;
                this._swipe = { id: event.pointerId, x: event.clientX, y: event.clientY, axis: null };
            },

            swipeMove(event) {
                const swipe = this._swipe;
                if (!swipe || event.pointerId !== swipe.id || swipe.axis) return;
                const dx = Math.abs(event.clientX - swipe.x);
                const dy = Math.abs(event.clientY - swipe.y);
                if (dx < 10 && dy < 10) return;
                swipe.axis = dx > dy * 1.5 ? 'x' : 'y';
                if (swipe.axis === 'y') this._swipe = null;
            },

            swipeEnd(event) {
                const swipe = this._swipe;
                this._swipe = null;
                if (!swipe || event.pointerId !== swipe.id || swipe.axis !== 'x') return;
                const dx = event.clientX - swipe.x;
                const dy = Math.abs(event.clientY - swipe.y);
                if (Math.abs(dx) < 40 || Math.abs(dx) <= dy * 1.5) return;
                this._suppressClickUntil = performance.now() + 400;
                dx < 0 ? this.next() : this.prev();
            },

            swipeCancel() {
                this._swipe = null;
            },

            /*
             * F8.1 — «Más herramientas» (<lg). Lista las herramientas fuera de la página visible, en su orden y con su
             * aviso (mismo criterio que los puntos de las flechas). Elegir una mueve el paginador a su página y activa el
             * disparador original: summary de Mary, botón Livewire/Alpine o el label del tema.
             */
            toolTrigger(el) {
                return el.querySelector('summary, [x-ref="trigger"], label.swap, button');
            },

            toolLabel(el) {
                const trigger = this.toolTrigger(el);
                return trigger?.getAttribute('aria-label') || trigger?.getAttribute('title') || trigger?.dataset.pexssTip
                    || el.querySelector('[title]')?.getAttribute('title') || 'Herramienta';
            },

            /*
             * F8.2 — tooltip de las herramientas del header (solo lg). El texto sale del title que ya trae cada
             * disparador (sin catálogo propio): al mostrarlo se mueve a data-pexss-tip para que el tooltip nativo no
             * se duplique, y los botones sin aria-label lo reciben con ese mismo texto (su nombre accesible no cambia).
             * El title del tema lo reescribe Mary al cambiar de tema: se vuelve a mover en el siguiente hover.
             * Puntero: 300 ms de permanencia. Foco de teclado (focus-visible): inmediato. Escape, clic, tecla de
             * acción o panel abierto lo ocultan.
             */
            tipTrigger(event) {
                if (!window.matchMedia('(min-width: 1024px)').matches) return null;
                // Ejecutivo: las herramientas del hub están a la vista y cada una lleva su propio tooltip.
                const tool = event.target.closest?.('[x-ref="track"] > [data-header-tool], .pexss-hub__source');
                const trigger = tool && this.toolTrigger(tool);
                return trigger && trigger.contains(event.target) ? trigger : null;
            },

            tipText(trigger) {
                const title = trigger.getAttribute('title');
                if (title) {
                    trigger.dataset.pexssTip = title;
                    if (trigger.tagName !== 'LABEL' && !trigger.hasAttribute('aria-label')) {
                        trigger.setAttribute('aria-label', title);
                    }
                    trigger.removeAttribute('title');
                }
                return trigger.dataset.pexssTip || '';
            },

            tipShow(trigger) {
                const tip = this.$refs.tip;
                const panelOpen = trigger.getAttribute('aria-expanded') === 'true' || trigger.closest('details')?.open
                    || [...(trigger.closest('[data-header-tool]')?.querySelectorAll('[data-header-panel]') || [])]
                        .some((panel) => panel.getClientRects().length > 0);
                const text = this.tipText(trigger);
                if (!tip || !text || panelOpen) return this.tipHide();

                tip.textContent = text;
                tip.hidden = false;
                const box = trigger.getBoundingClientRect();
                const width = tip.offsetWidth;
                const left = Math.min(Math.max(8, box.left + box.width / 2 - width / 2), window.innerWidth - width - 8);
                tip.style.left = `${left}px`;
                tip.style.top = `${box.bottom + 6}px`;
            },

            tipHide() {
                clearTimeout(this._tipTimer);
                if (this.$refs.tip) this.$refs.tip.hidden = true;
            },

            tipOver(event) {
                if (event.pointerType !== 'mouse') return;
                const trigger = this.tipTrigger(event);
                if (!trigger) return;
                this.tipText(trigger);
                clearTimeout(this._tipTimer);
                // Ya visible (o recién cerrado al salir de otro icono): pasa al nuevo sin volver a esperar.
                if (!this.$refs.tip.hidden || performance.now() < this._tipWarmUntil) return this.tipShow(trigger);
                this._tipTimer = setTimeout(() => this.tipShow(trigger), 300);
            },

            tipOut(event) {
                const trigger = this.tipTrigger(event);
                if (trigger && trigger.contains(event.relatedTarget)) return;
                if (!this.$refs.tip.hidden) this._tipWarmUntil = performance.now() + 300;
                this.tipHide();
            },

            tipFocus(event) {
                const trigger = this.tipTrigger(event);
                if (trigger && event.target.matches(':focus-visible')) this.tipShow(trigger);
            },

            toolIcon(el) {
                const svg = [...(this.toolTrigger(el)?.querySelectorAll('svg') || [])]
                    .find((icon) => getComputedStyle(icon).opacity !== '0');
                if (!svg) return '';
                const icon = svg.cloneNode(true);
                [...icon.attributes].forEach((attr) => {
                    if (!['viewBox', 'fill', 'stroke', 'stroke-width', 'xmlns', 'aria-hidden'].includes(attr.name)) {
                        icon.removeAttribute(attr.name);
                    }
                });
                icon.querySelectorAll('*').forEach((node) => [...node.attributes]
                    .filter((attr) => /^(x-|:|@|wire:)/.test(attr.name))
                    .forEach((attr) => node.removeAttribute(attr.name)));
                return icon.outerHTML;
            },

            openMore(focusFirst = false) {
                const hasBadge = (el) => [...el.querySelectorAll('[data-header-badge]')]
                    .some((badge) => getComputedStyle(badge).display !== 'none');
                this.moreItems = this.visible
                    .map((el, index) => ({ el, index }))
                    .filter(({ index }) => index < this.start || index >= this.start + this.perPage)
                    .map(({ el, index }) => ({ index, label: this.toolLabel(el), icon: this.toolIcon(el), badge: hasBadge(el) }));
                this.moreOpen = this.moreItems.length > 0;
                if (this.moreOpen && focusFirst) {
                    this.$nextTick(() => this.$refs.moreMenu.querySelector('[role="menuitem"]')?.focus());
                }
            },

            toggleMore(viaKeyboard) {
                this.moreOpen ? this.closeMore() : this.openMore(viaKeyboard);
            },

            closeMore(returnFocus = false) {
                if (!this.moreOpen) return;
                this.moreOpen = false;
                if (returnFocus) this.$refs.moreButton?.focus();
            },

            moveMore(step) {
                const items = [...this.$refs.moreMenu.querySelectorAll('[role="menuitem"]')];
                if (!items.length) return;
                const current = items.indexOf(document.activeElement);
                const next = Number.isFinite(step)
                    ? (current + step + items.length) % items.length
                    : (step < 0 ? 0 : items.length - 1);
                items[next].focus();
            },

            selectMore(index) {
                const el = this.visible[index];
                this.moreOpen = false;
                if (!el) return;
                const target = Math.min(Math.floor(index / this.perPage) * this.perPage, this.total - this.perPage);
                const direction = target > this.start ? 'next' : 'prev';
                this.start = Math.max(0, target);
                this.apply(direction);
                this.$nextTick(() => {
                    const trigger = this.toolTrigger(el);
                    trigger?.focus({ preventScroll: true });
                    trigger?.click();
                });
            },

            swipeGuard(event) {
                if (performance.now() < (this._suppressClickUntil || 0)) {
                    event.preventDefault();
                    event.stopPropagation();
                    this._suppressClickUntil = 0;
                }
            },
        }));

        Alpine.store('loader', {
            show: false,
            pending: 0,
            /** Si true, el hook de Livewire no oculta el overlay (p. ej. hasta redirect tras guardar). */
            holdUntilNavigate: false,
        })

        window.pexssBootRecepcionesOcShellLoader();

        Alpine.store('toast', {
            show: false,
            type: 'success', // success, error, info, warning
            message: '',
            timeout: 5000,
            position: 'top-right' // top-right, top-left, bottom-right, bottom-left
        })

        // Escuchar cambios de tema desde el componente theme-toggle de Mary UI
        // El componente dispara eventos 'theme-changed' y 'theme-changed-class'
        // Alpine.js pasa el valor directamente en e.detail
        document.addEventListener('theme-changed', (e) => {
            // El valor puede estar en e.detail directamente o en e.detail.theme
            const theme = e.detail?.theme || e.detail || localStorage.getItem('mary-theme')?.replaceAll('"', '') || 'light';
            const html = document.documentElement;
            html.setAttribute('data-theme', theme);
            /* Alinear `html.dark` / `html.light` con el tema Daisy (evita overlay negro con data-theme=light). */
            if (theme === 'dark' || theme === 'light') {
                html.classList.remove('dark', 'light');
                html.classList.add(theme === 'dark' ? 'dark' : 'light');
            }
        });

        document.addEventListener('theme-changed-class', (e) => {
            // El valor puede estar en e.detail directamente o en e.detail.class
            const themeClass = e.detail?.class || e.detail || localStorage.getItem('mary-class')?.replaceAll('"', '') || 'light';
            const html = document.documentElement;
            
            // Remover todas las clases de tema
            html.classList.remove('dark', 'light');
            
            // Aplicar la nueva clase
            if (themeClass === 'dark') {
                html.classList.add('dark');
            } else {
                html.classList.add('light');
            }

            /* Mantener `data-theme` alineado si el toggle solo envía clase (light/dark). */
            if (themeClass === 'dark' || themeClass === 'light') {
                html.setAttribute('data-theme', themeClass === 'dark' ? 'dark' : 'light');
            }
        });

        // Sincronizar cambios de tema desde localStorage (por si se cambia desde otro tab)
        // Compatible con Mary UI que usa 'mary-theme' y 'mary-class'
        window.addEventListener('storage', (e) => {
            if (e.key === 'mary-theme' || e.key === 'mary-class') {
                const theme = localStorage.getItem('mary-theme')?.replaceAll('"', '') || 'light';
                const html = document.documentElement;

                html.setAttribute('data-theme', theme);
                if (theme === 'dark' || theme === 'light') {
                    html.classList.remove('dark', 'light');
                    html.classList.add(theme === 'dark' ? 'dark' : 'light');
                }
            }
        });
    })

    // Definir funciones globales ANTES de que Livewire se cargue
    window.hidePexssToast = function() {
        if (window._pexssToastTimer) {
            clearTimeout(window._pexssToastTimer);
            window._pexssToastTimer = null;
        }
        if (window.Alpine && Alpine.store && Alpine.store('toast')) {
            const toast = Alpine.store('toast');
            toast.show = false;
            // Limpiar mensaje tras la animación de salida (evita borde residual)
            setTimeout(function() {
                if (Alpine.store('toast') && !Alpine.store('toast').show) {
                    Alpine.store('toast').message = '';
                }
            }, 250);
        }
    };

    window.showToast = function(type, message, timeout = 5000) {
        if (window.Alpine && Alpine.store) {
            Alpine.store('toast').type = type;
            Alpine.store('toast').message = message;
            Alpine.store('toast').timeout = timeout;
            Alpine.store('toast').show = true;

            if (window._pexssToastTimer) {
                clearTimeout(window._pexssToastTimer);
            }
            if (timeout > 0) {
                window._pexssToastTimer = setTimeout(function() {
                    window.hidePexssToast();
                }, timeout);
            }
        }
    }

    window.showSuccess = function(message, timeout = 5000) {
        showToast('success', message, timeout);
    }

    window.showError = function(message, timeout = 5000) {
        showToast('error', message, timeout);
    }

    window.showInfo = function(message, timeout = 5000) {
        showToast('info', message, timeout);
    }

    window.showWarning = function(message, timeout = 5000) {
        showToast('warning', message, timeout);
    }

    /** SweetAlert: aviso de correo enviado (módulo Aperturas). Cierra solo a los 2 s. */
    window.showAperturasAlertEmailSent = function(emails) {
        if (!emails || !emails.length || typeof Swal === 'undefined') return;
        var list = emails.map(function(e) {
            var d = document.createElement('div');
            d.textContent = String(e);
            return '<li style="margin:6px 0;word-break:break-all">' + d.innerHTML + '</li>';
        }).join('');
        Swal.fire({
            icon: 'success',
            title: 'Correo enviado',
            html: '<p style="margin:0 0 10px 0;font-size:15px">El aviso se envió correctamente a:</p><ul style="text-align:left;margin:0;padding-left:1.25rem;font-size:14px">' + list + '</ul>',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false
        });
    };

    // Funciones globales para cambio de estatus desde tablas
    window.confirmToggleCompanyStatus = function(companyId, action) {
        if (window.Livewire) {
            window.Livewire.dispatch('toggle-company-status', { id: companyId, action: action });
        }
    }

    
    window.confirmToggleUnityStatus = function(unityId, action) {
        if (window.Livewire) {
            window.Livewire.dispatch('toggle-unity-status', { id: unityId, action: action });
        }
    }

    window.confirmToggleUnityGroupStatus = function(unityGroupId, action) {
        if (window.Livewire) {
            window.Livewire.dispatch('toggle-unity-group-status', { id: unityGroupId, action: action });
        }
    }

    window.confirmTogglePOSSystemStatus = function(systemId, action) {
        if (window.Livewire) {
            window.Livewire.dispatch('toggle-pos-system-status', { id: systemId, action: action });
        }
    }

    window.confirmTogglePeripheralStatus = function(peripheralId, action) {
        if (window.Livewire) {
            window.Livewire.dispatch('toggle-peripheral-status', { id: peripheralId, action: action });
        }
    }

    window.confirmToggleHolidayStatus = function(holidayId, action) {
        if (window.Livewire) {
            window.Livewire.dispatch('toggle-holiday-status', { id: holidayId, action: action });
        }
    }

    window.confirmToggleMediaContentStatus = function(mediaContentId, action) {
        if (window.Livewire) {
            window.Livewire.dispatch('toggle-media-content-status', { id: mediaContentId, action: action });
        }
    };

    window.confirmToggleLicenseStatus = function(licenseId, action) {
        if (window.Livewire) {
            window.Livewire.dispatch('toggle-license-status', { id: licenseId, action: action });
        }
    };

    
    

    
    document.addEventListener('livewire:init', () => {
        function pexssPrefetchWorkDashboardFromDom() {
            if (window.__pexssWorkGlobalDashboardPrefetchDone) {
                return;
            }

            try {
                const link = document.querySelector('[data-work-dashboard-link]');
                if (!link) {
                    return;
                }
                window.__pexssWorkGlobalDashboardPrefetchDone = true;
                link.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window }))
                link.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true, view: window }))
            } catch (_) {
                // ignore
            }
        }

        window.addEventListener('livewire:navigate', (event) => {
            try {
                const from = window.location.pathname || ''
                let to = ''
                const detailUrl = event.detail?.url
                if (detailUrl) {
                    to = detailUrl instanceof URL
                        ? detailUrl.pathname
                        : (new URL(String(detailUrl), window.location.origin)).pathname
                }
                if (!window.pexssIsQualityNavPath(from) && !window.pexssIsQualityNavPath(to)) {
                    return
                }
                const s = Alpine.store('loader')
                if (s) {
                    s.pending = Math.max(s.pending || 0, 1)
                    s.show = true
                }
            } catch (_) {
                // ignore
            }
        })

        window.addEventListener('livewire:navigated', () => {
            if (window.pexssIsRecepcionesOcPath()) {
                window.pexssBootRecepcionesOcShellLoader()
                window.pexssScheduleReleaseRecepcionesOcShellLoader(120)

                return
            }

            const path = window.location.pathname || ''
            const el = document.getElementById('initial-loader')
            if (el) {
                el.remove()
            }
            if (path !== '/dashboard') {
                window.pexssDashboardShellReady = false
            }

            if (path === '/work/projects') {
                if (typeof window.requestIdleCallback === 'function') {
                    window.requestIdleCallback(pexssPrefetchWorkDashboardFromDom, { timeout: 2500 })
                } else {
                    setTimeout(pexssPrefetchWorkDashboardFromDom, 1200)
                }
            }
            window.pexssRecepcionesOcShellReady = false

            // Auditorías / Incidencias: la navegación wire:navigate ya terminó al disparar
            // livewire:navigated (HTML del destino en el DOM). Apagar tras el paint
            // real — sin setTimeout fijo que se adelanta o se queda corto.
            if (window.pexssIsQualityNavPath(path)) {
                const s = Alpine.store('loader')
                if (s) {
                    s.holdUntilNavigate = false
                    clearTimeout(window.__pexssQualityNavLoaderHideTimer)
                    window.__pexssQualityNavLoaderHideTimer = null
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            const st = Alpine.store('loader')
                            if (!st) return
                            if (!window.pexssIsQualityNavPath(window.location.pathname || '')) return
                            st.pending = 0
                            st.show = false
                        })
                    })
                }

                return
            }

            const s = Alpine.store('loader')
            if (s) {
                s.pending = 0
                s.show = false
                s.holdUntilNavigate = false
            }
        })

        window.addEventListener('beforeunload', () => {
            const s = Alpine.store('loader')
            if (s) {
                s.holdUntilNavigate = false
            }
        })

        function pexssQuotationsLoaderPaths() {
            const p = window.location.pathname || ''

            
            
            const noGlobalLoaderOnLivewireCommit = new Set([
                '/quotations/confirmations',
                '/quotations/quotes',
                '/quotations/dashboard',
                '/quotations/calendar',
                '/quotations/menus',
                '/cotizaciones/cotizar',
                '/cotizaciones/dashboard',
                '/cotizaciones/calendario',
                '/cotizaciones/events/confirm',
                '/cotizaciones/platillos',
                '/cotizaciones/menus',
            ])
            if (noGlobalLoaderOnLivewireCommit.has(p)) {
                return null
            }

            if (p === '/dashboard') {
                if (!window.pexssDashboardShellReady) {
                    return null;
                }

                return { delayMs: 120 };
            }

            
            if (p === '/work/dashboard' || /^\/work\/projects\/[^/]+\/dashboard\/?$/.test(p)) {
                return null;
            }

            if (
                p === '/quotations' || p.startsWith('/quotations/') ||
                p === '/cotizaciones' || p.startsWith('/cotizaciones/') ||
                p === '/comercial/lugares' || p.startsWith('/comercial/lugares/') ||
                p.startsWith('/training/content-library')
            ) {
                return { delayMs: 280 }
            }
            if (p === '/system/companies' || p.startsWith('/system/companies/')) {
                return { delayMs: 50 }
            }
            // Comedores (índice + edición/import): mismo criterio que compañías — el modal x-confirm-modal
            // pone $store.loader.show = true y el hook commit debe bajar pending/show al terminar la petición.
            if (
                p === '/system/unities'
                || p.startsWith('/system/unities/')
                || p === '/system/unity'
            ) {
                return { delayMs: 50 }
            }
            // Tokens clientes API (índice, crear, detalle, editar): mismo loader de página que comedores.
            if (p.startsWith('/system/api-integrations/api-clients-tokens')) {
                return { delayMs: 50 }
            }
            // Proyectos y tareas (índice, crear, editar, tablero): mismo criterio que compañías/comedores.
            if (p === '/work/projects' || p.startsWith('/work/projects/')) {
                return { delayMs: 50 }
            }
            return null
        }

        const pexssSilentBackgroundMethods = new Set([
            'pollImportStatus',
            'hasActiveProcessingImports',
            'refreshMenu',
            'updateImportProgress',
            // Mis descargas (header): wire:poll mientras hay exportaciones en cola.
            // No debe tapar el dashboard ni otras pantallas cada ~15s.
            'checkExports',
            'refreshAfterAutoDownload',
            // Insights: cupo personal/proyecto al entrar al tab (no debe tapar el tablero).
            'insightsDashboardUsage',
            'isInsightsAiAvailable',
            // Formularios públicos: refresh al entrar al tab (mismo criterio que Insights).
            'refreshProjectFormsList',
            'appliedProjectTemplateIds',
            // Primer paint del gerencial: la vista ya muestra su propio loader hasta bootstrapDashboardData.
            'bootstrapDashboardData',
            // Work Management: boot diferido sin overlay (editar proyecto, dashboard proyecto, filtros).
            'ensureCommercialCatalogReady',
            'ensureDashboardBooted',
            'ensureFiltersCatalogReady',
            'ensureTeamTabBooted',
            'confirmProjectDelete',
            'refreshTableSilent',
        ])
        // app.js lo usa para no mostrar el modal de 502/503/504 en peticiones de fondo.
        window.pexssSilentBackgroundMethods = pexssSilentBackgroundMethods

        // Contador para llamadas $wire envueltas (p. ej. refreshBoard silent): el commit
        // de Livewire se bufferiza ~5ms y el nombre del método no siempre basta.
        window.pexssSilentLivewireDepth = window.pexssSilentLivewireDepth || 0
        window.pexssWithSilentLivewire = async function pexssWithSilentLivewire(fn) {
            window.pexssSilentLivewireDepth = (window.pexssSilentLivewireDepth || 0) + 1
            try {
                return await fn()
            } finally {
                window.pexssSilentLivewireDepth = Math.max(0, (window.pexssSilentLivewireDepth || 1) - 1)
            }
        }

        function isPexssSilentBackgroundCommit(commit) {
            if ((window.pexssSilentLivewireDepth || 0) > 0) {
                return true
            }

            const calls = commit?.calls
            if (!Array.isArray(calls) || calls.length === 0) {
                return false
            }

            // Home /dashboard: pestañas y paneles lazy traen skeleton o loader propio.
            if ((window.location.pathname || '') === '/dashboard') {
                const onlyDashboardBackground = calls.every((call) => {
                    const method = String(call?.method || '')

                    return method === '__lazyLoad' || pexssSilentBackgroundMethods.has(method)
                })

                if (onlyDashboardBackground) {
                    return true
                }
            }

            return calls.every((call) => {
                const method = String(call?.method || '')
                return method !== '' && pexssSilentBackgroundMethods.has(method)
            })
        }

        const reviewsQuietActions = new Set([
            'showEventDetail',
            'showEventHistory',
            'openQuotationFilesModal',
            'openRelatedInvoicesModal',
            'closeEventModal',
            'closeHistoryModal',
            'closeRelatedInvoicesModal',
            'closeRejectQuotationModal',
            'rejectUserEmailOptions',
            'printPdf',
            'openQuotationPdf',
            'confirmQuotationPdfCompany',
            'closePdfCompanyModal',
            'gotoPage',
            'nextPage',
            'previousPage',
            'setPage',
            'setPerPage',
            'applyAttentionQuickFilter',
            'applyBillingSummaryFilter',
            'syncFiltersFromParent',
        ])

        function isReviewsQuietAction(commit) {
            if ((window.location.pathname || '') !== '/quotations/reviews') {
                return false
            }

            const calls = commit?.calls
            if (!Array.isArray(calls) || calls.length === 0) {
                return false
            }

            return calls.every((call) => reviewsQuietActions.has(String(call?.method || '')))
        }

        const quotesQuietActions = new Set([
            'printPdf',
            'openQuotationPdf',
            'confirmQuotationPdfCompany',
            'closePdfCompanyModal',
            'openRejectionHistory',
            'openSendEmailConfirm',
            'closeSendEmailConfirmModal',
            'duplicateQuotation',
            'changeStatus',
            'closeStatusChangeConfirmModal',
            'openOcModal',
            'previewSendEmail',
            'confirmChangeStatus',
            'confirmSendEmailFromList',
            'refreshTable',
            'gotoPage',
            'nextPage',
            'previousPage',
            'setPage',
            'setPerPage',
            'syncFiltersFromParent',
        ])

        function isQuotesQuietAction(commit) {
            if ((window.location.pathname || '') !== '/quotations/quotes') {
                return false
            }

            const calls = commit?.calls
            if (!Array.isArray(calls) || calls.length === 0) {
                return false
            }

            return calls.every((call) => quotesQuietActions.has(String(call?.method || '')))
        }

        if (typeof Livewire.hook === 'function') {
            Livewire.hook('commit', ({ commit, succeed, fail }) => {
                if (window.pexssAnnouncementsModalOpen) {
                    return
                }

                if (isPexssSilentBackgroundCommit(commit) || isReviewsQuietAction(commit) || isQuotesQuietAction(commit)) {
                    return
                }

                if (!pexssQuotationsLoaderPaths()) {
                    return
                }

                // El overlay espera 280ms para no tapar acciones rápidas. El contador sube
                // al empezar la petición: si al terminar sale otra (tabla anidada, #[On]),
                // el overlay sigue visible en lugar de apagarse y volver a salir.
                const hideDelay = window.location.pathname === '/dashboard' ? 400 : 100
                const loaderStore = () => (window.Alpine && typeof Alpine.store === 'function')
                    ? Alpine.store('loader')
                    : null

                const active = loaderStore()
                if (active) {
                    active.pending = (active.pending || 0) + 1
                }

                const showTimer = setTimeout(() => {
                    const st = loaderStore()
                    if (st && (st.pending || 0) > 0) {
                        st.show = true
                    }
                }, 280)

                const done = () => {
                    clearTimeout(showTimer)
                    const s = loaderStore()
                    if (!s) return
                    if (s.holdUntilNavigate) {
                        s.show = true
                        s.pending = Math.max(s.pending || 0, 1)

                        return
                    }
                    s.pending = Math.max((s.pending || 1) - 1, 0)
                    if (s.pending === 0) {
                        setTimeout(() => {
                            const st = loaderStore()
                            if (st && st.pending === 0 && !st.holdUntilNavigate) {
                                st.show = false
                            }
                        }, hideDelay)
                    }
                }

                succeed(done)
                fail(done)
            })
        }
    })
 } catch (e) { console.warn('[demo] componentes del layout', e); }