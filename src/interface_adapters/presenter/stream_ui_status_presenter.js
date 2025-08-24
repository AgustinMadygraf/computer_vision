/*
Path: static/src/interface_adapters/presenter/notification_presenter.js
*/


import { DomAdapter } from '../../infrastructure/dom_adapter.js';

export class StreamUIStatusPresenter {
    constructor(domAdapter = new DomAdapter()) {
        this.domAdapter = domAdapter;
    }

    showNotification(message, type = 'info') {
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

        const toast = new bootstrap.Toast(notification, { autohide: true, delay: 5000 });
        toast.show();

        notification.addEventListener('hidden.bs.toast', () => {
            notification.remove();
        });
    }

    showStatus(message) {
        this.domAdapter.setText('stream-status', message);
    }

    showLost() {
        this.domAdapter.addClass('stream-img', 'stream-lost');
        this.showStatus('Se ha perdido la conexión con la cámara');
    }

    showRecovered() {
        this.domAdapter.removeClass('stream-img', 'stream-lost');
        this.showStatus('Conexión restablecida');
        const img = this.domAdapter.getElement('stream-img');
        if (img) {
            const src = img.src;
            img.src = '';
            setTimeout(() => { img.src = src; }, 500);
        }
    }
}
