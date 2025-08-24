import { STREAM_SERVER_CONFIG } from './config.js';

/*
Path: static/src/infrastructure/websocket_adapter.js
*/

export class IWebSocketAdapter {
	connect() { throw new Error('Not implemented'); }
	disconnect() { throw new Error('Not implemented'); }
}

export class WebSocketAdapter {
	constructor({ host, onOpen, onMessage, onError, onClose }) {
		this.host = host;
		this.port = STREAM_SERVER_CONFIG.wsPort;
		this.ws = null;
		this.onOpen = onOpen;
		this.onMessage = onMessage;
		this.onError = onError;
		this.onClose = onClose;
	}

	connect() {
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	const wsUrl = `${protocol}//${this.host}:${STREAM_SERVER_CONFIG.wsPort}${STREAM_SERVER_CONFIG.wsPath}`;
		this.ws = new WebSocket(wsUrl);
		this.ws.onopen = this.onOpen;
		this.ws.onmessage = this.onMessage;
		this.ws.onerror = this.onError;
		this.ws.onclose = this.onClose;
	}

	disconnect() {
		if (this.ws) {
			this.ws.close();
		}
	}
}
