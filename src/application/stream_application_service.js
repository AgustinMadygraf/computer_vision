/*
Path: src/application/stream_application_service.js
*/

import { StreamEntity } from '../entities/stream_entity.js';
import { StreamStatusUseCase } from '../use_cases/stream_status_use_case.js';
import { StreamUIStatusPresenter } from '../interface_adapters/presenter/stream_ui_status_presenter.js';
import { DomAdapter } from '../infrastructure/dom_adapter.js';

export class StreamApplicationService {
    /**
     * @param {Object} options
     * @param {Object} options.config - Configuración de streaming (host, wsPort, wsPath)
     * @param {DomAdapter} [options.domAdapter]
     */
    constructor({ config, domAdapter = new DomAdapter() } = {}) {
        if (!config) throw new Error('StreamApplicationService requiere un objeto de configuración');
        this.config = config;
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

}
