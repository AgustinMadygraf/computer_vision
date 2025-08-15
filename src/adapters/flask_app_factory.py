"""
Path: src/adapters/flask_app_factory.py
"""
import atexit
from flask import Flask

def create_app(adapter):
    "Crea y configura la app Flask con las rutas necesarias."
    app = Flask(__name__)

    @app.route("/")
    def index():
        return adapter.index()

    @app.route("/stream.mjpg")
    def stream_mjpeg():
        return adapter.stream_mjpeg()

    @app.route("/resolution")
    def resolution():
        return adapter.resolution()

    @app.route("/snapshot.jpg")
    def snapshot():
        return adapter.snapshot()

    @atexit.register
    def cleanup():
        adapter.cleanup()

    return app
