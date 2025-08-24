/*
Path: static/src/interface_adapters/controllers/stream_controller.js
*/


import { StreamWebSocketHandler } from '../gateway/stream_web_socket.js';
import { DomAdapter } from '../../infrastructure/dom_adapter.js';

export class StreamController {
    constructor(streamWebSocketHandler) {
        this.streamWebSocketHandler = streamWebSocketHandler || new StreamWebSocketHandler(new DomAdapter());
    }

    start() {
        this.streamWebSocketHandler.connect();
    }

    stop() {
        this.streamWebSocketHandler.disconnect();
    }
}
