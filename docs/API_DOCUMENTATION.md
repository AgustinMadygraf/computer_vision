---

## Preguntas frecuentes y detalles técnicos

### ¿El endpoint `/resolution` siempre está disponible y responde rápido?
El endpoint `/resolution` responde rápidamente porque retorna la resolución detectada al iniciar el backend. Sin embargo, depende de que la cámara esté correctamente conectada y configurada al arrancar el servidor. Si la cámara no está disponible, el backend no inicia y el endpoint no estará accesible.

### ¿El stream MJPEG puede caerse y cómo se detecta desde el frontend?
El stream MJPEG puede caerse si la conexión RTSP se pierde o la cámara deja de enviar frames. Desde el frontend, esto se detecta porque la imagen embebida (`<img src="/stream.mjpg">`) dejará de actualizarse y mostrará el último frame recibido. No hay una señal explícita de error, pero el usuario puede notar que el video está congelado. Se recomienda que el frontend implemente algún mecanismo visual para indicar la pérdida de conexión si es necesario.

### ¿Hay algún límite de frecuencia para tomar snapshots?
No existe un límite de frecuencia implementado en el backend para el endpoint `/snapshot.jpg`. Cada solicitud genera un snapshot en tiempo real. Sin embargo, tomar snapshots de forma muy frecuente puede sobrecargar la cámara o el servidor. Si no se puede capturar un frame, el backend responde con código 503.

### ¿El backend soporta múltiples cámaras o solo una?
Actualmente, el backend está diseñado para soportar una sola cámara IP, configurada mediante variables de entorno. Para soportar múltiples cámaras, sería necesario modificar la arquitectura para permitir instancias y rutas diferenciadas por cámara.

# Backend API Documentation

## Overview
Este documento describe los endpoints y el funcionamiento del backend para el sistema de cámara IP. Es el insumo principal para el desarrollo del frontend.

---

## Endpoints

### 1. Página principal
- **URL:** `/`
- **Método:** GET
- **Descripción:** Devuelve la página principal con el stream MJPEG embebido.
- **Respuesta:** HTML

---

### 2. Stream MJPEG
- **URL:** `/stream.mjpg`
- **Método:** GET
- **Descripción:** Devuelve el stream de video en formato MJPEG.
- **Respuesta:** `multipart/x-mixed-replace; boundary=frame`
- **Ejemplo de uso en frontend:**
  ```html
  <img src="/stream.mjpg" alt="Stream" />
  ```

---

### 3. Resolución del stream
- **URL:** `/resolution`
- **Método:** GET
- **Descripción:** Devuelve la resolución actual del stream de video.
- **Respuesta:** JSON
  ```json
  {
    "width": 1280,
    "height": 720
  }
  ```
- **Códigos de estado:**
  - 200 OK: Respuesta exitosa

---

### 4. Snapshot
- **URL:** `/snapshot.jpg`
- **Método:** GET
- **Descripción:** Toma un snapshot del stream y lo devuelve como imagen JPEG.
- **Respuesta exitosa:** `image/jpeg`
- **Respuesta de error:**
  - Código 503, texto plano: `No se pudo capturar frame`
- **Ejemplo de uso en frontend (JavaScript):**
  ```js
  fetch('/snapshot.jpg')
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      document.getElementById('snapshot').src = url;
    });
  ```

---

## Ejemplo de flujo de integración
1. El frontend solicita `/resolution` para conocer el tamaño del video.
2. Muestra el stream embebiendo `/stream.mjpg` en un `<img>`.
3. Permite al usuario tomar snapshots solicitando `/snapshot.jpg` y mostrando la imagen.

---

## Manejo de errores
- Si la cámara no está disponible, los endpoints pueden devolver errores HTTP (503 en `/snapshot.jpg`).
- El frontend debe manejar estos errores y mostrar mensajes adecuados al usuario.

---

## CORS
Actualmente, el backend no implementa CORS explícito. Si el frontend se sirve desde otro dominio, será necesario habilitarlo agregando el paquete `flask-cors` y configurando en el backend.

---

## Reglas de negocio
- El stream y los snapshots requieren que la cámara esté conectada y configurada.
- No hay autenticación implementada actualmente.

---

## Notas técnicas
- El backend está desarrollado en Python con Flask.
- La arquitectura sigue principios de arquitectura limpia.
- El adaptador HTTP y los controladores están desacoplados de la lógica de negocio.
- Los snapshots se generan en tiempo real y se envían directamente, no se almacenan en disco.
