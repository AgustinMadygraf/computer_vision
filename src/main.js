/*
Path: static/src/main.js
*/

import { STREAM_SERVER_CONFIG } from './infrastructure/config.js';

const protocol = window.location.protocol;
const mjpegPort = STREAM_SERVER_CONFIG.mjpegPort;
const host = STREAM_SERVER_CONFIG.host;

function getStreamUrl(type, index, filtroActivo = false, userId = null) {
    // Alterna entre stream_filtro.mjpg y stream_original.mjpg según filtroActivo
    const streamName = filtroActivo ? 'stream_filtro.mjpg' : 'stream_original.mjpg';
    let url = `${protocol}//${host}:${mjpegPort}/api/computer_vision/${type}/${index}/${streamName}`;
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

function setStreamSource(imgElement, type, index, filtroActivo = false, userId = null) {
    const url = getStreamUrl(type, index, filtroActivo, userId);
    imgElement.src = url;
    imgElement.onerror = () => {
        imgElement.alt = 'No se pudo cargar el stream';
        console.warn(`Advertencia: No se pudo conectar al stream ${type} ${index} (${filtroActivo ? 'filtro' : 'original'})`);
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
    const filtroSwitch = document.getElementById('filtro-switch');
    // Inicializa el stream según el estado del filtro
    const filtroActivoInicial = filtroSwitch ? filtroSwitch.checked : false;
    setStreamSource(imgElement, selectedType, selectedIndex, filtroActivoInicial);

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

    // Filtro amarillo: alterna la fuente del stream
    if (filtroSwitch) {
        filtroSwitch.addEventListener('change', (e) => {
            const filtroActivo = e.target.checked;
            setStreamSource(imgElement, selectedType, selectedIndex, filtroActivo);
            console.log('Filtro amarillo:', filtroActivo ? 'activado' : 'desactivado');
        });
    }
});
