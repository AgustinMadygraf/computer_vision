"""
Path: src/adapters/flask_app_factory.py
"""
import atexit
from flask import Flask
from src.presentation.camera_controller import camera_bp, register_camera_routes

def create_app(adapter):
    "Crea y configura la app Flask con las rutas necesarias usando blueprints."
    app = Flask(__name__)

    # Registrar las rutas del controlador de cámara
    bp = register_camera_routes(camera_bp, adapter)
    app.register_blueprint(bp)

    @atexit.register
    def cleanup():
        adapter.cleanup()

    return app
