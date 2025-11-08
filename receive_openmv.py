import serial
import struct
import os
import time
import requests
from datetime import datetime

# ⚙️ Configuración del puerto serial y backend
PORT = "COM11"               # Cambia si tu cámara usa otro puerto
BAUD = 115200
BACKEND_URL = "http://127.0.0.1:8080/upload_image/"
SAVE_DIR = r"C:\Users\laura\Documents\BACTRA\pictures_esp32"

# Crear carpeta si no existe
os.makedirs(SAVE_DIR, exist_ok=True)


def send_to_backend(sample_id: str, image_path: str):
    """Envía la imagen capturada al backend FastAPI."""
    with open(image_path, "rb") as img_file:
        files = {"file": (os.path.basename(image_path), img_file, "image/jpeg")}
        data = {"sample_id": sample_id}
        try:
            resp = requests.post(BACKEND_URL, files=files, data=data, timeout=10)
            print("📤 Enviado al backend:", resp.json())
        except Exception as e:
            print("⚠️ Error al enviar al backend:", e)


def receive_images():
    """Lee imágenes enviadas por la OpenMV y las guarda localmente."""
    try:
        ser = serial.Serial(PORT, BAUD, timeout=10)
        print(f"🟢 Conectado al puerto {PORT}")
    except Exception as e:
        print(f"❌ No se detectó la cámara: {e}")
        return

    try:
        img_counter = 0
        while True:
            # Leer 4 bytes para el tamaño
            size_data = ser.read(4)
            if len(size_data) != 4:
                continue

            size = struct.unpack("<I", size_data)[0]

            # Validar tamaño razonable
            if size < 1000 or size > 500000:
                print("⚠️ Tamaño no válido, descartando...")
                continue

            # Leer los datos de la imagen
            img_data = ser.read(size)
            if len(img_data) != size:
                print("⚠️ Imagen incompleta, descartando...")
                continue

            # Guardar imagen en carpeta
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]
            filename = f"photo_{timestamp}.jpg"
            filepath = os.path.join(SAVE_DIR, filename)
            with open(filepath, "wb") as f:
                f.write(img_data)

            print(f"💾 Guardada: {filepath}")

            # Enviar al backend automáticamente
            sample_id = f"muestra_{img_counter:03d}"
            send_to_backend(sample_id, filepath)

            img_counter += 1
            time.sleep(1)

    except KeyboardInterrupt:
        print("🛑 Interrumpido por el usuario.")
    finally:
        ser.close()
        print("🔴 Conexión cerrada.")


if __name__ == "__main__":
    receive_images()
