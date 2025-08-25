/*
Path: static/src/interface_adapters/controllers/stream_controller.js
*/


import { StreamApplicationService } from '../../application/stream_application_service.js';

export class StreamController {
    constructor(streamApplicationService) {
        this.streamApplicationService = streamApplicationService || new StreamApplicationService();
    }

    start() {
        this.streamApplicationService.startStream();
    }

    stop() {
        this.streamApplicationService.stopStream();
    }
}
