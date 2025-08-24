/*
Path: static/src/adapters/header_loader.js
*/

import { HttpAdapter } from '../infrastructure/http_adapter.js';
import { DomAdapter } from '../infrastructure/dom_adapter.js';

export function loadHeader(headerPath = 'public/templates/header.html', containerId = 'header-container') {
    const httpAdapter = new HttpAdapter();
    const domAdapter = new DomAdapter();

    async function fetchAndRenderHeader() {
        try {
            const html = await httpAdapter.getText(headerPath);
            domAdapter.setHtml(containerId, html);

            const headerContainer = domAdapter.getElement(containerId);
            const navLinks = headerContainer ? headerContainer.querySelectorAll('.nav-link') : [];
            const currentFile = window.location.pathname.split('/').pop();
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href) {
                    const linkFile = href.split('/').pop();
                    if (linkFile === currentFile) {
                        link.classList.add('active');
                        link.setAttribute('aria-current', 'page');
                    } else {
                        link.classList.remove('active');
                        link.removeAttribute('aria-current');
                    }
                }
            });
        } catch (err) {
            domAdapter.setHtml(containerId, `<div class="alert alert-warning" role="alert">No se pudo cargar el menú de navegación.</div>`);
            console.error('[headerLoader] Error al cargar el header:', err);
            // Aquí podrías usar showNotification si lo deseas
        }
    }
    fetchAndRenderHeader();
}