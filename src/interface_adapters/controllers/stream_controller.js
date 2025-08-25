/*
Path: static/src/interface_adapters/controllers/stream_controller.js
*/


import { StreamApplicationService } from '../../application/stream_application_service.js';
import { STREAM_SERVER_CONFIG } from '../../infrastructure/config.js';

export class StreamController {
    constructor(streamApplicationService) {
        this.streamApplicationService = streamApplicationService || new StreamApplicationService({ config: STREAM_SERVER_CONFIG });
    }

    start() {
        this.streamApplicationService.startStream();
    }

    stop() {
        this.streamApplicationService.stopStream();
    }
}
