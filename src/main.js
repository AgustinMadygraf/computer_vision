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

// --- WebSocket para filtro amarillo ---
let filtroWs = null;
let filtroActivo = true;


let currentUserId = null;
function getStreamUrl(type, index, userId = null) {
    let url = `${protocol}//${host}:${mjpegPorts[0]}/api/computer_vision/${type}/${index}/stream.mjpg`;
    if (userId) {
        url += `?user_id=${encodeURIComponent(userId)}`;
    }
    return url;
}

function getSnapshotUrl(type, index) {
    return `${protocol}//${host}:${mjpegPorts[0]}/api/computer_vision/${type}/${index}/snapshot.jpg`;
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

function setFiltroStatus(msg, type = 'info') {
    const statusDiv = document.getElementById('filtro-status');
    if (statusDiv) {
        statusDiv.innerHTML = `<span class="badge bg-${type}">${msg}</span>`;
    }
}

function enviarFiltroEstado(estado) {
    if (filtroWs && filtroWs.readyState === 1) {
        console.log('[Filtro] Enviando estado:', estado ? 'filtro:on' : 'filtro:off');
        filtroWs.send(estado ? 'filtro:on' : 'filtro:off');
        filtroActivo = estado;
    }
}

function conectarFiltroWebSocket() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${host}:${STREAM_SERVER_CONFIG.wsPort}${STREAM_SERVER_CONFIG.wsPath}`;
    console.log('[WebSocket] Intentando conectar a:', wsUrl);
    filtroWs = new WebSocket(wsUrl);
    filtroWs.onopen = () => {
        console.log('[WebSocket] Conectado');
        setFiltroStatus('Conectado', 'success');
        filtroWs.send('filtro:on');
    };
    filtroWs.onmessage = (event) => {
        let msg = event.data;
        let userIdUpdated = false;
        try {
            const data = JSON.parse(msg);
            if (data.user_id) {
                if (currentUserId !== data.user_id) {
                    console.log('[WebSocket] Nuevo user_id recibido:', data.user_id);
                    currentUserId = data.user_id;
                    const imgElement = document.getElementById('stream-img');
                    if (imgElement) {
                        console.log('[Stream] Actualizando src MJPEG con user_id:', currentUserId);
                        trySetMjpegStream(imgElement, selectedType, selectedIndex, currentUserId);
                    }
                    userIdUpdated = true;
                }
            }
            msg = data.message || msg;
        } catch {}
        setFiltroStatus(msg, msg.includes('activado') ? 'success' : 'warning');
        if (userIdUpdated) {
            // Ya actualizado arriba
        }
    };
    filtroWs.onerror = (err) => {
        console.error('[WebSocket] Error de conexión', err);
        setFiltroStatus('Error de conexión', 'danger');
    };
    filtroWs.onclose = () => {
        console.warn('[WebSocket] Conexión cerrada');
        setFiltroStatus('Desconectado', 'danger');
    };
}

async function fetchAvailableStreams() {
    try {
        const response = await fetch(`${protocol}//${host}:${mjpegPorts[0]}/api/computer_vision/streams`);
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

    // Filtro amarillo
    const filtroSwitch = document.getElementById('filtro-switch');
    conectarFiltroWebSocket();
    if (filtroSwitch) {
        filtroSwitch.addEventListener('change', (e) => {
            console.log('Filtro amarillo:', e.target.checked ? 'activado' : 'desactivado');
            enviarFiltroEstado(e.target.checked);
        });
    }
});

streamController.start();
window.addEventListener('beforeunload', () => {
    streamController.stop();
    if (filtroWs && filtroWs.readyState === 1) {
        filtroWs.send('close');
        filtroWs.close();
    }
});
