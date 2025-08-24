/*
Path: static/src/main.js
*/

import { STREAM_SERVER_CONFIG } from './infrastructure/config.js';
import { StreamController } from './interface_adapters/controllers/stream_controller.js';

const protocol = window.location.protocol;
const mjpegPorts = STREAM_SERVER_CONFIG.mjpegPorts;
const mjpegPath = STREAM_SERVER_CONFIG.mjpegPath;
const host = STREAM_SERVER_CONFIG.host;
const streamController = new StreamController();

function trySetMjpegStream(imgElement) {
    let triedPorts = 0;
    function tryPort(portIdx) {
        if (portIdx >= mjpegPorts.length) {
            imgElement.alt = 'No se pudo cargar el stream';
            console.warn('Advertencia: No se pudo conectar al stream MJPEG en ninguno de los puertos configurados:', mjpegPorts);
            return;
        }
        const url = `${protocol}//${host}:${mjpegPorts[portIdx]}${mjpegPath}`;
        try {
            imgElement.src = url;
            imgElement.onerror = () => {
                triedPorts++;
                tryPort(portIdx + 1);
            };
        } catch (err) {
            console.warn('Advertencia: Error al intentar conectar al stream MJPEG en', url, err);
            tryPort(portIdx + 1);
        }
    }
    tryPort(0);
}

document.addEventListener('DOMContentLoaded', () => {
    const imgElement = document.getElementById('stream-img');
    trySetMjpegStream(imgElement);

    const snapshotBtn = document.getElementById('snapshot-btn');
    const snapshotResult = document.getElementById('snapshot-result');
    if (snapshotBtn) {
        snapshotBtn.addEventListener('click', async () => {
            snapshotBtn.disabled = true;
            snapshotBtn.textContent = 'Capturando...';
            let success = false;
            let lastError = null;
            for (let i = 0; i < mjpegPorts.length; i++) {
                const url = `${protocol}//${host}:${mjpegPorts[i]}${STREAM_SERVER_CONFIG.snapshotPath}`;
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error('No se pudo capturar el snapshot');
                    const blob = await response.blob();
                    const imgUrl = URL.createObjectURL(blob);
                    snapshotResult.innerHTML = `<img src="${imgUrl}" alt="Snapshot" class="img-fluid" style="max-width: 400px;" />` +
                        `<div class="mt-2"><a href="${imgUrl}" download="snapshot.jpg" class="btn btn-success">Descargar</a></div>`;
                    success = true;
                    break;
                } catch (err) {
                    lastError = err;
                }
            }
            if (!success) {
                snapshotResult.innerHTML = `<div class="alert alert-danger">${lastError ? lastError.message : 'No se pudo capturar el snapshot'}</div>`;
            }
            snapshotBtn.disabled = false;
            snapshotBtn.textContent = 'Snapshot';
        });
    }
});

streamController.start();
window.addEventListener('beforeunload', () => {
    streamController.stop();
});
