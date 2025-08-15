"""
Path: src/domain/camera_stream.py
"""

import os
from time import sleep
from datetime import datetime
import cv2

class CameraStream:
    "Clase para manejar el stream de video de una cámara IP."
    def __init__(self, ip, user, password):
        # Opciones de conexión para OpenCV
        os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|stimeout;5000000"
        self.rtsp_url = f"rtsp://{ip}:554/user={user}&password={password}&channel=1&stream=0.sdp"
        self.cap = cv2.VideoCapture(self.rtsp_url, cv2.CAP_FFMPEG)
        if not self.cap.isOpened():
            raise RuntimeError("No se pudo abrir el stream RTSP con OpenCV.")
        # Intentar leer el primer frame para obtener metadatos
        ok = False
        for _ in range(20):
            ok, _frame = self.cap.read()
            if ok:
                break
            sleep(0.1)
        if not ok:
            raise RuntimeError("No se pudo obtener el primer frame del RTSP.")
        self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH)) #Pylint: disable=E1101
        self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) #Pylint: disable=E1101

    def get_resolution(self):
        "Obtiene la resolución del stream de video."
        return self.width, self.height

    def read_frame(self):
        "Lee un frame del stream de video."
        ok, frame = self.cap.read()
        if not ok:
            return None
        return frame

    def mjpeg_generator(self, quality=80):
        "Generador de stream MJPEG."
        encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), quality] #Pylint: disable=E1101
        while True:
            frame = self.read_frame()
            if frame is None:
                sleep(0.05)
                continue
            ok, jpg = cv2.imencode(".jpg", frame, encode_params) #Pylint: disable=E1101
            if not ok:
                continue
            yield (b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n" +
                    jpg.tobytes() +
                    b"\r\n")

    def save_snapshot(self, path=None):
        "Guarda un frame como imagen JPG."
        frame = self.read_frame()
        if frame is None:
            return None
        if path is None:
            path = f"snapshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
        cv2.imwrite(path, frame) #Pylint: disable=E1101
        return path

    def release(self):
        "Libera los recursos de la cámara."
        try:
            self.cap.release()
        except cv2.error: #Pylint: disable=E1101
            pass
