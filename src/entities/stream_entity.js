/*
Path: static/src/entities/stream_entity.js
*/

// StreamEntity ahora puede recibir adaptadores como dependencias (opcional)
export class StreamEntity {
    /**
     * @param {Object} options
     * @param {string|null} [options.id]
     * @param {string} [options.status]
     * @param {string|null} [options.lastEvent]
     * @param {Object|null} [options.resolution]
     * @param {IWebSocketAdapter} [options.wsAdapter]
     * @param {IHttpAdapter} [options.httpAdapter]
     */
    constructor({ id = null, status = 'unknown', lastEvent = null, resolution = null, wsAdapter = null, httpAdapter = null } = {}) {
        this.id = id;
        this.status = status; // 'active', 'lost', 'recovered', etc.
        this.lastEvent = lastEvent; // Último evento recibido
        this.resolution = resolution; // { width, height } o similar
        this.wsAdapter = wsAdapter;
        this.httpAdapter = httpAdapter;
    }

    updateStatus(event, message = null) {
        this.lastEvent = event;
        switch (event) {
            case 'status':
                this.status = 'active';
                break;
            case 'imagen_perdida':
                this.status = 'lost';
                break;
            case 'imagen_recuperada':
                this.status = 'recovered';
                break;
            default:
                this.status = 'unknown';
        }
        if (message) {
            this.message = message;
        }
    }
}