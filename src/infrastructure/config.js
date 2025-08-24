// Configuración centralizada para la infraestructura de streaming
export const STREAM_SERVER_CONFIG = {
	host: '127.0.0.1',
	port: 5001,
	mjpegPath: '/api/computer_vision/stream.mjpg',
	wsPath: '/api/computer_vision/ws',
	snapshotPath: '/api/computer_vision/snapshot.jpg'
};
