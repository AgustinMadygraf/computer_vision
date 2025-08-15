"""
Path: src/adapters/camera_http_adapter.py
"""

from flask import Response, jsonify, send_file, render_template_string

class CameraHTTPAdapter:
    "Adaptador HTTP para exponer los casos de uso de la cámara IP."
    def __init__(self, camera_usecase):
        self.camera_usecase = camera_usecase
        self.width, self.height = self.camera_usecase.get_resolution()

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

    def index(self):
        "Página principal."
        return render_template_string(self.INDEX_HTML, w=self.width, h=self.height)

    def stream_mjpeg(self):
        "Stream MJPEG."
        def mjpeg_generator():
            yield from self.camera_usecase.mjpeg_generator(quality=80)
        return Response(mjpeg_generator(),
                        mimetype="multipart/x-mixed-replace; boundary=frame")

    def resolution(self):
        "Obtiene la resolución del stream de video."
        return jsonify({"width": self.width, "height": self.height})

    def snapshot(self):
        "Toma un snapshot del stream de video."
        fname = self.camera_usecase.save_snapshot()
        if fname is None:
            return "No se pudo capturar frame", 503
        return send_file(fname, mimetype="image/jpeg")

    def cleanup(self):
        "Libera los recursos de la cámara."
        self.camera_usecase.release()
