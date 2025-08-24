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

function getStreamUrl(type, index) {
    return `${protocol}//${host}:${mjpegPorts[0]}/api/computer_vision/${type}/${index}/stream.mjpg`;
}

function getSnapshotUrl(type, index) {
    return `${protocol}//${host}:${mjpegPorts[0]}/api/computer_vision/${type}/${index}/snapshot.jpg`;
}

// Ejemplo de uso: el tipo y el índice deberían venir de la UI
const selectedType = 'usb'; // o 'wifi', 'img'
const selectedIndex = 0;    // el índice seleccionado por el usuario

function trySetMjpegStream(imgElement, type, index) {
    const url = getStreamUrl(type, index);
    imgElement.src = url;
    imgElement.onerror = () => {
        imgElement.alt = 'No se pudo cargar el stream';
        console.warn(`Advertencia: No se pudo conectar al stream ${type} ${index}`);
    };
}

async function fetchAvailableStreams() {
    try {
        const response = await fetch(`${protocol}//${host}:${mjpegPorts[0]}/api/computer_vision/streams`);
        if (!response.ok) throw new Error('No se pudo obtener la lista de streams');
        const streams = await response.json();

        // Ejemplo: mostrar en consola y poblar un <select> en la UI
        console.log('Streams disponibles:', streams);

        const select = document.getElementById('stream-select');
        if (select) {
            select.innerHTML = '';
            Object.entries(streams).forEach(([type, items]) => {
                items.forEach(item => {
                    const option = document.createElement('option');
                    option.value = `${type}:${item.index}`;
                    option.textContent = `${item.name} (${type})`;
                    select.appendChild(option);
                });
            });
        }
    } catch (err) {
        console.error('Error al obtener streams:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAvailableStreams();
    const imgElement = document.getElementById('stream-img');
    trySetMjpegStream(imgElement, selectedType, selectedIndex);

    const snapshotBtn = document.getElementById('snapshot-btn');
    const snapshotResult = document.getElementById('snapshot-result');
    if (snapshotBtn) {
        snapshotBtn.addEventListener('click', async () => {
            snapshotBtn.disabled = true;
            snapshotBtn.textContent = 'Capturando...';
            try {
                const url = getSnapshotUrl(selectedType, selectedIndex);
                const response = await fetch(url);
                if (!response.ok) throw new Error('No se pudo capturar el snapshot');
                const blob = await response.blob();
                const imgUrl = URL.createObjectURL(blob);
                snapshotResult.innerHTML = `<img src="${imgUrl}" alt="Snapshot" class="img-fluid" style="max-width: 400px;" />` +
                    `<div class="mt-2"><a href="${imgUrl}" download="snapshot.jpg" class="btn btn-success">Descargar</a></div>`;
            } catch (err) {
                snapshotResult.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
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
