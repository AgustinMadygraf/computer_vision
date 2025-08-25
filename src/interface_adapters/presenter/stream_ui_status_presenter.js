/*
Path: static/src/interface_adapters/presenter/notification_presenter.js
*/


import { DomAdapter } from '../../infrastructure/dom_adapter.js';

export class StreamUIStatusPresenter {
    constructor(domAdapter = new DomAdapter()) {
        this.domAdapter = domAdapter;
    }

    showNotification(message, type = 'info') {
        // Presenta una notificación en la UI, sin lógica de control ni eventos
        let notificationsContainer = this.domAdapter.getElement('ws-notifications');
        if (!notificationsContainer) {
            notificationsContainer = document.createElement('div');
            notificationsContainer.id = 'ws-notifications';
            notificationsContainer.className = 'position-fixed top-0 end-0 p-3';
            notificationsContainer.style.zIndex = '1050';
            document.body.appendChild(notificationsContainer);
        }

        const notification = document.createElement('div');
        notification.className = `toast align-items-center text-white bg-${type} border-0`;
        notification.role = 'alert';
        notification.setAttribute('aria-live', 'assertive');
        notification.setAttribute('aria-atomic', 'true');

        notification.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
            </div>
        `;

        notificationsContainer.appendChild(notification);

        // La lógica de control de duración/autohide debe ser gestionada por el controlador/caso de uso
        if (window.bootstrap && window.bootstrap.Toast) {
            const toast = new window.bootstrap.Toast(notification, { autohide: true, delay: 5000 });
            toast.show();
        }
    }

    showStatus(message) {
        this.domAdapter.setText('stream-status', message);
    }

    showLost() {
        // Presenta el estado de "perdido" en la UI
        this.domAdapter.addClass('stream-img', 'stream-lost');
        this.showStatus('Se ha perdido la conexión con la cámara');
    }

    showRecovered() {
        // Presenta el estado de "recuperado" en la UI
        this.domAdapter.removeClass('stream-img', 'stream-lost');
        this.showStatus('Conexión restablecida');
        // La lógica de recarga de imagen debe ser gestionada por el controlador/caso de uso
    }
}
