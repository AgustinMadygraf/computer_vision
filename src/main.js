/*
Path: static/src/main.js
*/

import { STREAM_SERVER_CONFIG } from './infrastructure/config.js';

const protocol = window.location.protocol;
const mjpegPort = STREAM_SERVER_CONFIG.mjpegPort;
const host = STREAM_SERVER_CONFIG.host;

function getStreamUrl(type, index, userId = null) {
    let url = `${protocol}//${host}:${mjpegPort}/api/computer_vision/${type}/${index}/stream.mjpg`;
    if (userId) {
        url += `?user_id=${encodeURIComponent(userId)}`;
    }
    return url;
}

function getSnapshotUrl(type, index) {
    return `${protocol}//${host}:${mjpegPort}/api/computer_vision/${type}/${index}/snapshot.jpg`;
}

const selectedType = 'usb';
const selectedIndex = 0;

function trySetMjpegStream(imgElement, type, index, userId = null) {
    const url = getStreamUrl(type, index, userId);
    imgElement.src = url;
    imgElement.onerror = () => {
        imgElement.alt = 'No se pudo cargar el stream';
        console.warn(`Advertencia: No se pudo conectar al stream ${type} ${index}`);
    };
}

async function fetchAvailableStreams() {
    try {
        const response = await fetch(`${protocol}//${host}:${mjpegPort}/api/computer_vision/streams`);
        if (!response.ok) throw new Error('No se pudo obtener la lista de streams');
        const streams = await response.json();
        console.log('Streams disponibles:', streams);
        const select = document.getElementById('stream-select');
        if (select) {
            select.innerHTML = '';
            Object.entries(streams).forEach(([type, items]) => {
                items.forEach(item => { /* ... */ });
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
                console.log('[Snapshot] Solicitando snapshot a:', url);
                const response = await fetch(url);
                if (!response.ok) throw new Error('No se pudo capturar el snapshot');
                const blob = await response.blob();
                const imgUrl = URL.createObjectURL(blob);
                snapshotResult.innerHTML = `<img src="${imgUrl}" class="img-fluid mt-2" alt="Snapshot" />`;
                console.log('[Snapshot] Snapshot recibido y mostrado');
            } catch (err) {
                snapshotResult.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
                console.error('[Snapshot] Error:', err);
            }
            snapshotBtn.disabled = false;
            snapshotBtn.textContent = 'Snapshot';
        });
    }

    // Filtro amarillo (GET booleano, ruta dinámica)
    const filtroSwitch = document.getElementById('filtro-switch');
    if (filtroSwitch) {
        filtroSwitch.addEventListener('change', async (e) => {
            const estado = e.target.checked;
            // Usa el tipo e índice seleccionados
            const url = `${protocol}//${host}:${mjpegPort}/api/computer_vision/${selectedType}/${selectedIndex}/filtro_amarillo?enabled=${estado}`;
            try {
                const response = await fetch(url, { method: 'GET' });
                if (!response.ok) throw new Error('No se pudo cambiar el estado del filtro');
                console.log('Filtro amarillo:', estado ? 'activado' : 'desactivado');
            } catch (err) {
                console.error('Error al cambiar el filtro amarillo:', err);
            }
        });
    }
});
