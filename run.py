import os
import atexit
from time import sleep
from datetime import datetime

from flask import Flask, Response, jsonify, send_file, render_template_string
import cv2
from dotenv import load_dotenv  # <-- Agrega esto

load_dotenv()  # <-- Carga variables del .env

# Estabilidad RTSP (TCP + timeout 5 s)
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|stimeout;5000000"

# Obtiene datos de entorno
IP = os.getenv("IP")
USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")

RTSP_URL = f"rtsp://{IP}:554/user={USER}&password={PASSWORD}&channel=1&stream=0.sdp"

# --- Inicializar captura ---
cap = cv2.VideoCapture(RTSP_URL, cv2.CAP_FFMPEG)
if not cap.isOpened():
    raise SystemExit("No se pudo abrir el stream RTSP con OpenCV. Probá PyAV.")

# Leer un frame para que OpenCV actualice metadatos
for _ in range(20):  # pequeños reintentos por si tarda en estabilizar
    ok, frame = cap.read()
    if ok:
        break
    sleep(0.1)

if not ok:
    raise SystemExit("No se pudo obtener el primer frame del RTSP.")

width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
print(f"Resolución detectada: {width} x {height}")

app = Flask(__name__)

INDEX_HTML = """
<!doctype html>
<html>
  <head><meta charset="utf-8"><title>iCSee - MJPEG</title></head>
  <body style="margin:0;background:#111;color:#eee;font-family:system-ui">
    <div style="padding:12px">
      <h2 style="margin:0 0 8px">Stream MJPEG (prototipo)</h2>
      <div>Resolución detectada: {{ w }}×{{ h }}</div>
    </div>
    <img src="/stream.mjpg" style="width:100%;height:auto;display:block;"/>
  </body>
</html>
"""

def mjpeg_generator():
    # Calidad JPEG balanceada para LAN (80). Ajustá si querés menos ancho de banda.
    encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), 80]
    while True:
        ok, frame = cap.read()
        if not ok:
            # Si hay microcortes, esperamos y seguimos
            sleep(0.05)
            continue
        ok, jpg = cv2.imencode(".jpg", frame, encode_params)
        if not ok:
            continue
        yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" +
               jpg.tobytes() +
               b"\r\n")

@app.route("/")
def index():
    return render_template_string(INDEX_HTML, w=width, h=height)

@app.route("/stream.mjpg")
def stream_mjpeg():
    return Response(mjpeg_generator(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/resolution")
def resolution():
    return jsonify({"width": width, "height": height})

@app.route("/snapshot.jpg")
def snapshot():
    # Toma un frame y lo devuelve como archivo JPG
    ok, frame = cap.read()
    if not ok:
        return "No se pudo capturar frame", 503
    fname = f"snapshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
    cv2.imwrite(fname, frame)
    return send_file(fname, mimetype="image/jpeg")

@atexit.register
def cleanup():
    try:
        cap.release()
    except Exception:
        pass

if __name__ == "__main__":
    # Escucha en toda la LAN (intranet)
    app.run(host="0.0.0.0", port=5000, threaded=True)
