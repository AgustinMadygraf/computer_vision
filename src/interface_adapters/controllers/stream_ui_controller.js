/*
Path: src/interface_adapters/controllers/stream_ui_controller.js
Responsabilidad: Controlador de eventos de UI para el stream principal.
*/


// Interfaces sugeridas
// import { IStreamStatusUseCase } from '../../use_cases/stream_status_use_case.js';
// import { IStreamUIStatusPresenter } from '../presenter/stream_ui_status_presenter.js';

export class StreamUIController {
    /**
     * @param {Object} options
     * @param {IStreamStatusUseCase} options.streamStatusUseCase - Caso de uso para cambiar el estado del stream
     * @param {IStreamUIStatusPresenter} options.uiPresenter - Presentador para mostrar estado en la UI
     */
    constructor({ streamStatusUseCase, uiPresenter }) {
        this.streamStatusUseCase = streamStatusUseCase;
        this.uiPresenter = uiPresenter;
    }

    /**
     * Vincula los eventos de UI a través de interfaces, no accede al DOM directamente
     * @param {Object} uiElements - Elementos de UI necesarios (inyectados por main.js)
     * @param {HTMLElement} uiElements.filtroSwitch
     * @param {HTMLElement} uiElements.imgElement
     */
    bindUIEvents(uiElements) {
        const { filtroSwitch, imgElement } = uiElements;
        if (filtroSwitch && imgElement) {
            filtroSwitch.addEventListener('change', (e) => {
                this.onFiltroChange(e.target.checked, imgElement);
            });
        }
    }

    /**
     * Invoca el caso de uso para cambiar el estado del stream y notifica al presentador
     */
    onFiltroChange(filtroActivo, imgElement) {
        console.log('[StreamUIController] Cambio de filtro:', filtroActivo ? 'activado' : 'desactivado');
        // El controlador no construye la URL ni manipula el DOM directamente
        this.streamStatusUseCase.changeStreamSource({ filtroActivo, imgElement });
        this.uiPresenter.showStatus(`Filtro amarillo: ${filtroActivo ? 'activado' : 'desactivado'}`);
    }
}
