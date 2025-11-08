from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
import os
import json
import requests
from datetime import datetime

app = FastAPI()

# 📁 Carpetas y archivos locales
UPLOAD_DIR = "received_images"
LOG_FILE = "capturas.json"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 🌐 URL del backend MED
MED_BACKEND_URL = "http://127.0.0.1:8000/med/cases"

@app.post("/upload_image/")
async def upload_image(
    sample_id: str = Form(...),
    file: UploadFile = File(...),
):
    """Recibe una imagen desde la cámara, la guarda, la registra y envía el caso al MED."""

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{sample_id}_{timestamp}.jpg"
    filepath = os.path.join(UPLOAD_DIR, filename)

    # Guardar imagen localmente
    with open(filepath, "wb") as buffer:
        buffer.write(await file.read())

    # Crear registro local
    record = {
        "sample_id": sample_id,
        "filename": filename,
        "path": filepath,
        "timestamp": datetime.now().isoformat()
    }

    # Guardar/actualizar capturas.json
    history = []
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                history = json.load(f)
        except json.JSONDecodeError:
            history = []

    history.append(record)

    with open(LOG_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=4, ensure_ascii=False)

    print(f"📸 Nueva captura guardada: {filename}")

    # 🚀 Enviar caso al backend MED (SOLO JSON)
    payload = {
        "sample_id": sample_id,
        "bacteria": "Desconocida",
        "notes": f"Imagen guardada en LAB: {filename}"
    }

    try:
        resp = requests.post(MED_BACKEND_URL, json=payload, timeout=10)

        try:
            med_response = resp.json()
        except Exception:
            med_response = {
                "status_code": resp.status_code,
                "response_text": resp.text.strip() or "<respuesta vacía>"
            }

        print(f"📤 Caso enviado al MED: {med_response}")

    except Exception as e:
        med_response = {"error": str(e)}
        print(f"⚠️ Error al enviar al MED: {e}")

    return JSONResponse({
        "message": "✅ Imagen guardada y caso registrado en MED",
        "saved_as": filename,
        "path": filepath,
        "med_response": med_response
    })
