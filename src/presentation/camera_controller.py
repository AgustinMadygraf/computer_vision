"""
Path: src/presentation/camera_controller.py
"""
from flask import Blueprint

# El controlador HTTP para la cámara, usando Blueprint para modularidad
camera_bp = Blueprint('camera', __name__)

def register_camera_routes(bp, adapter):
    "Registra las rutas HTTP de la cámara en el blueprint usando el adaptador."
    @bp.route("/")
    def index():
        return adapter.index()

    @bp.route("/stream.mjpg")
    def stream_mjpeg():
        return adapter.stream_mjpeg()

    @bp.route("/resolution")
    def resolution():
        return adapter.resolution()

    @bp.route("/snapshot.jpg")
    def snapshot():
        return adapter.snapshot()

    return bp
