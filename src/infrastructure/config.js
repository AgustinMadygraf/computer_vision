/*
Path: src/infrastructure/config.js
*/

// Configuración centralizada para la infraestructura de streaming
export const STREAM_SERVER_CONFIG = {
	host: '127.0.0.1',
	mjpegPort: 5001, // Puerto para MJPEG y Snapshot (fallback)
	mjpegPath: '/api/computer_vision/stream.mjpg',
	snapshotPath: '/api/computer_vision/snapshot.jpg',
};
