/*
Path: static/src/main.js
*/

import { STREAM_SERVER_CONFIG } from './infrastructure/config.js';
import { StreamController } from './interface_adapters/controllers/stream_controller.js';

const protocol = window.location.protocol;
const mjpegUrl = `${protocol}//${STREAM_SERVER_CONFIG.host}:${STREAM_SERVER_CONFIG.port}${STREAM_SERVER_CONFIG.mjpegPath}`;
const streamController = new StreamController();

streamController.start();
document.getElementById('stream-img').src = mjpegUrl;
window.addEventListener('beforeunload', () => {
    streamController.stop();
});

// Lógica para el botón de snapshot
document.addEventListener('DOMContentLoaded', () => {
    const snapshotBtn = document.getElementById('snapshot-btn');
    const snapshotResult = document.getElementById('snapshot-result');
    if (snapshotBtn) {
        snapshotBtn.addEventListener('click', async () => {
            snapshotBtn.disabled = true;
            snapshotBtn.textContent = 'Capturando...';
            try {
                const response = await fetch(STREAM_SERVER_CONFIG.snapshotPath);
                if (!response.ok) throw new Error('No se pudo capturar el snapshot');
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                snapshotResult.innerHTML = `<img src="${url}" alt="Snapshot" class="img-fluid" style="max-width: 400px;" />` +
                    `<div class="mt-2"><a href="${url}" download="snapshot.jpg" class="btn btn-success">Descargar</a></div>`;
            } catch (err) {
                snapshotResult.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
            } finally {
                snapshotBtn.disabled = false;
                snapshotBtn.textContent = 'Snapshot';
            }
        });
    }
});
