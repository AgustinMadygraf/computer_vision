"""
Path: src/application/camera_usecase.py
"""
from src.domain.camera_stream import CameraStream

class CameraUseCase:
    "Caso de uso para gestionar el stream y snapshots de la cámara IP."
    def __init__(self, ip, user, password):
        self.camera = CameraStream(ip, user, password)

    def get_resolution(self):
        "Obtiene la resolución del stream de video."
        return self.camera.get_resolution()

    def mjpeg_generator(self, quality=80):
        "Generador de stream MJPEG."
        return self.camera.mjpeg_generator(quality=quality)

    def save_snapshot(self, path=None):
        "Guarda un snapshot del stream de video."
        return self.camera.save_snapshot(path)

    def release(self):
        "Libera los recursos de la cámara."
        self.camera.release()
