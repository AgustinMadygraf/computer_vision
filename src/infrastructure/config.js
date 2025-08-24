/*
Path: src/infrastructure/config.js
*/

// Configuración centralizada para la infraestructura de streaming
export const STREAM_SERVER_CONFIG = {
	host: '127.0.0.1',
	mjpegPorts: [5001, 5001], // Puertos para MJPEG y Snapshot (fallback)
	wsPort: 5001, // Puerto fijo para WebSocket
	mjpegPath: '/api/computer_vision/stream.mjpg',
	snapshotPath: '/api/computer_vision/snapshot.jpg',
	wsPath: '/api/computer_vision/ws'
};


/*
Nota técnica sobre la configuración de puertos:
Por motivos de compatibilidad con la infraestructura actual y restricciones en el proxy inverso del backend,
la asignación de puertos en 'mjpegPorts' utiliza 5001 como puerto principal y 5001 nuevamente como fallback.
Lo ideal sería emplear 5000 como puerto principal y 5001 como fallback, pero debido a una falla en la 
redirección del backend (el intento de redireccionar el tráfico de 5000 a 5001 no está funcionando correctamente),
se ha optado por esta configuración temporal. Esta decisión garantiza la continuidad del servicio de streaming
mientras se resuelve el inconveniente en la capa de proxy.
*/
