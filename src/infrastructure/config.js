// Configuración centralizada para la infraestructura de streaming
export const STREAM_SERVER_CONFIG = {
	host: '127.0.0.1',
	mjpegPorts: [5000, 5001], // Puertos para MJPEG y Snapshot (fallback)
	wsPort: 5001, // Puerto fijo para WebSocket
	mjpegPath: '/api/computer_vision/stream.mjpg',
	snapshotPath: '/api/computer_vision/snapshot.jpg',
	wsPath: '/api/computer_vision/ws'
};
