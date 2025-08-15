"""
Path: run.py
"""

import os
import atexit
from flask import Flask, Response, jsonify, send_file, render_template_string
from dotenv import load_dotenv
from src.application.camera_usecase import CameraUseCase

load_dotenv()

print("IP:", os.getenv("IP"))
print("USER:", os.getenv("USER"))
print("PASSWORD:", os.getenv("PASSWORD"))

# Obtiene datos de entorno
IP = os.getenv("IP")
USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")

# Inicializa el caso de uso de cámara
camera_usecase = CameraUseCase(IP, USER, PASSWORD)
width, height = camera_usecase.get_resolution()
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
    "Generador de stream MJPEG."
    yield from camera_usecase.mjpeg_generator(quality=80)

@app.route("/")
def index():
    "Página principal."
    return render_template_string(INDEX_HTML, w=width, h=height)

@app.route("/stream.mjpg")
def stream_mjpeg():
    "Stream MJPEG."
    return Response(mjpeg_generator(),
                    mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/resolution")
def resolution():
    "Obtiene la resolución del stream de video."
    return jsonify({"width": width, "height": height})

@app.route("/snapshot.jpg")
def snapshot():
    "Toma un snapshot del stream de video."
    fname = camera_usecase.save_snapshot()
    if fname is None:
        return "No se pudo capturar frame", 503
    return send_file(fname, mimetype="image/jpeg")

@atexit.register
def cleanup():
    "Libera los recursos de la cámara."
    camera_usecase.release()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, threaded=True)
