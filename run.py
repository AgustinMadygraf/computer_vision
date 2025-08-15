"""
Path: run.py
"""

import os
from dotenv import load_dotenv
from src.application.camera_usecase import CameraUseCase
from src.infrastructure.opencv_camera_stream import OpenCVCameraStream
from src.adapters.camera_http_adapter import CameraHTTPAdapter
from src.adapters.flask_app_factory import create_app

load_dotenv()

# Obtiene datos de entorno
IP = os.getenv("IP")
USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")

# Inicializa la implementación concreta de infraestructura y la inyecta en el caso de uso
camera_stream = OpenCVCameraStream(IP, USER, PASSWORD)
camera_usecase = CameraUseCase(camera_stream)
adapter = CameraHTTPAdapter(camera_usecase)

app = create_app(adapter)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, threaded=True)
