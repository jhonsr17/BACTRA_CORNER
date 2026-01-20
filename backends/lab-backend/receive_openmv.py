import serial
import struct
import time
import os
import base64

def capture_single_image(PORT="COM11", baud=115200, timeout=8):
    """
    Captura UNA imagen de la cámara OpenMV H7.
    Guarda el archivo JPEG y devuelve su ruta y contenido base64.
    """
    save_dir = "received_images"
    os.makedirs(save_dir, exist_ok=True)

    try:
        ser = serial.Serial(PORT, baud, timeout=timeout)
        ser.reset_input_buffer()
        ser.reset_output_buffer()
        time.sleep(0.2)
        print(f"🟢 Conectado a {PORT} @ {baud}")
    except Exception as e:
        raise Exception(f"❌ No se pudo abrir el puerto {PORT}: {e}")

    try:
        # Solicitar captura
        ser.write(b'C')
        ser.flush()
        print("📸 Captura solicitada...")

        # Leer tamaño de la imagen
        size_data = ser.read(4)
        if len(size_data) != 4:
            raise Exception("❌ No se recibió tamaño de imagen (verifique main.py en la cámara)")

        size = struct.unpack("<I", size_data)[0]
        print(f"📏 Tamaño de imagen: {size} bytes")

        if size < 1_000 or size > 2_000_000:
            raise Exception(f"⚠️ Tamaño inválido recibido: {size} bytes")

        # Leer la imagen completa
        img_data = bytearray()
        remaining = size
        start_time = time.time()

        while remaining > 0:
            chunk = ser.read(min(4096, remaining))
            if not chunk:
                if time.time() - start_time > timeout:
                    raise Exception("⏱️ Tiempo de espera agotado al recibir imagen.")
                continue
            img_data.extend(chunk)
            remaining -= len(chunk)

        if len(img_data) != size:
            raise Exception(f"⚠️ Imagen incompleta ({len(img_data)}/{size} bytes)")

        # Guardar imagen
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = f"openmv_{timestamp}.jpg"
        filepath = os.path.join(save_dir, filename)
        with open(filepath, "wb") as f:
            f.write(img_data)

        print(f"💾 Imagen guardada como: {filepath}")

        # Convertir a base64 para enviar por API
        img_base64 = base64.b64encode(img_data).decode("utf-8")

        return {
            "message": "✅ Captura exitosa",
            "path": filepath,
            "image_base64": img_base64
        }

    finally:
        ser.close()
        print("🔴 Conexión serial cerrada")
