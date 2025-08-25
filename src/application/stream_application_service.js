/*
Path: src/application/stream_application_service.js
*/

import { StreamEntity } from '../entities/stream_entity.js';
import { StreamStatusUseCase } from '../use_cases/stream_status_use_case.js';
import { StreamUIStatusPresenter } from '../interface_adapters/presenter/stream_ui_status_presenter.js';
import { DomAdapter } from '../infrastructure/dom_adapter.js';

export class StreamApplicationService {
    constructor({ domAdapter = new DomAdapter() } = {}) {
        this.streamEntity = new StreamEntity();
        this.uiPresenter = new StreamUIStatusPresenter(domAdapter);
        this.streamStatusUseCase = new StreamStatusUseCase(
            this.streamEntity,
            this.uiPresenter
        );
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectTimeout = null;
        this.domAdapter = domAdapter;
    }

    startStream() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:${window.STREAM_SERVER_CONFIG.wsPort}${window.STREAM_SERVER_CONFIG.wsPath}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            this.reconnectAttempts = 0;
            this.streamEntity.updateStatus('status', 'Conexión establecida');
            this.uiPresenter.showNotification('Conexión establecida con el servidor', 'success');
        };

        this.ws.onmessage = (event) => {
            let data;
            try {
                data = JSON.parse(event.data);
            } catch (e) {
                console.warn('Mensaje WebSocket no es JSON:', event.data);
                return;
            }
            this.streamStatusUseCase.handle(data);
        };

        this.ws.onerror = (err) => {
            console.error('WebSocket error', err);
            this.uiPresenter.showNotification('Error en la conexión con el servidor', 'danger');
        };

        this.ws.onclose = () => {
            this.uiPresenter.showNotification('Conexión cerrada', 'warning');
            this.tryReconnect();
        };
    }

    tryReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(30000, Math.pow(2, this.reconnectAttempts) * 1000);
            this.uiPresenter.showNotification(`Intentando reconectar (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`, 'warning');
            this.reconnectTimeout = setTimeout(() => {
                this.startStream();
            }, delay);
        } else {
            this.uiPresenter.showNotification('No se pudo reconectar al servidor después de varios intentos', 'danger');
        }
    }

    stopStream() {
        if (this.ws) {
            this.ws.close();
        }
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }
}
