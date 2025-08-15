# Computer Vision Camera Service

Este proyecto proporciona una interfaz web para acceder a cámaras IP, permitiendo visualizar el stream MJPEG y tomar snapshots. Utiliza una arquitectura limpia para separar las preocupaciones y facilitar el mantenimiento y las pruebas.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![OpenCV](https://img.shields.io/badge/OpenCV-4.x-green.svg)
![Flask](https://img.shields.io/badge/Flask-2.x-red.svg)

## 📋 Requisitos

- Python 3.8+
- OpenCV 4.x
- Flask 2.x
- Acceso a una cámara IP compatible con RTSP

## 🚀 Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/agustinmadygraf/computer_vision.git
   cd computer_vision
   ```

2. Crear un entorno virtual e instalar dependencias:
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

## ⚙️ Configuración

1. Crear un archivo .env en la raíz del proyecto:
   ```
   IP=192.168.1.100
   USER=admin
   PASSWORD=yourpassword
   ```

2. Ajustar los parámetros según las especificaciones de tu cámara IP.

## 🏃‍♂️ Ejecución

Para iniciar el servidor:
```bash
python run.py
```

El servicio estará disponible en `http://localhost:5000`

## 🏗️ Estructura del proyecto

```
computer_vision/
├── .env                        # Variables de entorno (no incluido en el repositorio)
├── run.py                      # Punto de entrada de la aplicación
├── requirements.txt            # Dependencias del proyecto
├── src/
│   ├── domain/                 # Reglas y entidades de negocio
│   │   └── camera_stream.py    # Interfaces del dominio
│   ├── application/            # Casos de uso
│   │   └── camera_usecase.py   # Lógica de la aplicación
│   ├── infrastructure/         # Implementaciones concretas
│   │   └── opencv_camera_stream.py  # Implementación con OpenCV
│   ├── adapters/               # Adaptadores para conectar capas
│   │   ├── camera_http_adapter.py   # Adaptador HTTP
│   │   └── flask_app_factory.py     # Fábrica de la app Flask
│   └── presentation/           # Controladores de interfaz
│       └── camera_controller.py     # Controlador de rutas HTTP
└── docs/                       # Documentación adicional
     └── API_DOCUMENTATION.md        # Documentación detallada de la API

```

## 🧩 Arquitectura

Este proyecto implementa una arquitectura limpia (Clean Architecture) con las siguientes capas:

1. **Domain**: Define las interfaces y reglas de negocio.
2. **Application**: Implementa los casos de uso que orquestan el flujo de la aplicación.
3. **Infrastructure**: Contiene implementaciones concretas de las interfaces del dominio.
4. **Adapters**: Conecta la lógica de negocio con las interfaces externas.
5. **Presentation**: Maneja la forma en que se exponen las funcionalidades.

## 🌐 API

El servicio expone los siguientes endpoints:

- `GET /` - Página principal con stream embebido
- `GET /stream.mjpg` - Stream MJPEG de la cámara
- `GET /resolution` - Información sobre la resolución del video
- `GET /snapshot.jpg` - Toma un snapshot del stream actual

Para más detalles, consulta API_DOCUMENTATION.md.

## 🔧 Tecnologías utilizadas

- **OpenCV**: Procesamiento del stream de video
- **Flask**: Framework web para la API REST
- **Python-dotenv**: Gestión de variables de entorno

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, crea un issue o pull request con tus sugerencias.