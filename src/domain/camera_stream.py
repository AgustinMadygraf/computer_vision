
"""
Path: src/domain/camera_stream.py
"""

from abc import ABC, abstractmethod

class CameraStreamInterface(ABC):
    "Interfaz para el stream de cámara IP."
    @abstractmethod
    def get_resolution(self):
        "Obtiene la resolución del stream de video."
        pass # Pylint: disable=E1101

    @abstractmethod
    def mjpeg_generator(self, quality=80):
        "Generador de stream MJPEG."
        pass # Pylint: disable=E1101

    @abstractmethod
    def save_snapshot(self, path=None):
        "Guarda un snapshot del stream de video."
        pass # Pylint: disable=E1101

    @abstractmethod
    def release(self):
        "Libera los recursos de la cámara."
        pass
