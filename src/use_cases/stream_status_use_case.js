/*
Path: static/src/use_cases/stream_status_use_case.js
*/


// Interfaz para el presenter
export class IStreamStatusPresenter {
    showStatus(message) { throw new Error('Not implemented'); }
    showLost() { throw new Error('Not implemented'); }
    showRecovered() { throw new Error('Not implemented'); }
}

import { StreamEntity } from '../entities/stream_entity.js';
// La implementación concreta se importa donde se use, no aquí

export class StreamStatusUseCase {
    /**
     * @param {StreamEntity} entity
     * @param {IStreamStatusPresenter} presenter
     * @param {Object} [adapters]
     * @param {IWebSocketAdapter} [adapters.wsAdapter] - Debe ser una interfaz, no una clase concreta
     * @param {IHttpAdapter} [adapters.httpAdapter] - Debe ser una interfaz, no una clase concreta
     * @param {IDomAdapter} [adapters.domAdapter] - Debe ser una interfaz, no una clase concreta
     */
    constructor(entity, presenter, adapters = {}) {
        this.entity = entity;
        this.presenter = presenter;
        // Solo interfaces, nunca clases concretas
        this.wsAdapter = adapters.wsAdapter || null;
        this.httpAdapter = adapters.httpAdapter || null;
        this.domAdapter = adapters.domAdapter || null;
    }

    handle(eventData) {
        this.entity.updateStatus(eventData.event, eventData.message);
        switch(this.entity.status) {
            case 'active':
                this.presenter.showStatus(this.entity.message);
                break;
            case 'lost':
                this.presenter.showLost();
                break;
            case 'recovered':
                this.presenter.showRecovered();
                break;
            default:
                // Estado desconocido
                break;
        }
    }
}
