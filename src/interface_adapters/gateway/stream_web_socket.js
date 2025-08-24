/*
Path: static/src/interface_adapters/gateway/stream_web_socket.js
*/

import { StreamUIStatusPresenter } from '../presenter/stream_ui_status_presenter.js';
import { StreamStatusUseCase } from '../../use_cases/stream_status_use_case.js';
import { StreamEntity } from '../../entities/stream_entity.js';
import { DomAdapter } from '../../infrastructure/dom_adapter.js';
import { STREAM_SERVER_CONFIG } from '../../infrastructure/config.js';

export class StreamWebSocketHandler {
    constructor(domAdapter = new DomAdapter()) {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectTimeout = null;
        this.streamEntity = new StreamEntity();
        this.uiPresenter = new StreamUIStatusPresenter(domAdapter);
        this.streamStatusUseCase = new StreamStatusUseCase(
            this.streamEntity,
            this.uiPresenter
        );
    }

    connect() {
        try {

            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${STREAM_SERVER_CONFIG.host}:${STREAM_SERVER_CONFIG.port}${STREAM_SERVER_CONFIG.wsPath}`;

            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('WebSocket conectado');
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
                console.log('WebSocket cerrado');
                this.uiPresenter.showNotification('Conexión cerrada', 'warning');
                this.tryReconnect();
            };
        } catch (err) {
            console.error('Fallo al iniciar WebSocket', err);
            showNotification('No se pudo conectar al servidor', 'danger');
            this.tryReconnect();
        }
    }

    tryReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(30000, Math.pow(2, this.reconnectAttempts) * 1000);

            this.uiPresenter.showNotification(`Intentando reconectar (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`, 'warning');

            this.reconnectTimeout = setTimeout(() => {
                console.log(`Intento de reconexión ${this.reconnectAttempts}...`);
                this.connect();
            }, delay);
        } else {
            this.uiPresenter.showNotification('No se pudo reconectar al servidor después de varios intentos', 'danger');
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }
}
