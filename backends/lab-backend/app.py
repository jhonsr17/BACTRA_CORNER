# app.py (LAB BACKEND)
import os
import json
import base64
from datetime import datetime
from typing import Optional

import cv2
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import numpy as np
import requests

from analyze_image import analyze_bacteria
from receive_openmv import capture_single_image

# ---------- Config ----------
LAB_HOST = os.getenv("LAB_HOST", "http://127.0.0.1:8000")
MED_API_URL = os.getenv("MED_API_URL", "http://127.0.0.1:5177")
IMAGES_DIR = os.getenv("IMAGES_DIR", "received_images")
CAPTURAS_JSON = os.getenv("CAPTURAS_JSON", "capturas.json")
OPENMV_PORT = os.getenv("OPENMV_PORT", "COM11")

os.makedirs(IMAGES_DIR, exist_ok=True)

# ---------- App ----------
app = FastAPI()
app.mount(f"/{IMAGES_DIR}", StaticFiles(directory=IMAGES_DIR), name="images")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # si quieres, restringe por env
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Utils ----------
def _save_capture_meta(sample_id: str, filename: str, bacteria: Optional[str] = None, notes: str = ""):
    rec = {
        "sample_id": sample_id,
        "filename": filename,
        "path": os.path.join(IMAGES_DIR, filename),
        "timestamp": datetime.now().isoformat(),
    }
    if bacteria is not None:
        rec["bacteria"] = bacteria
    if notes:
        rec["notes"] = notes

    data = []
    if os.path.exists(CAPTURAS_JSON):
        try:
            with open(CAPTURAS_JSON, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            data = []
    data.append(rec)
    with open(CAPTURAS_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def _post_to_med(sample_id: str, bacteria: str, notes: str = ""):
    try:
        url = f"{MED_API_URL}/med/cases"
        body = {"sample_id": sample_id, "bacteria": bacteria, "notes": notes}
        r = requests.post(url, json=body, timeout=10)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        return {"error": f"No se pudo enviar a MED: {e}"}

# ---------- Health ----------
@app.get("/health")
def health():
    return {"status": "ok", "MED_API_URL": MED_API_URL, "OPENMV_PORT": OPENMV_PORT}

# ---------- Analizador base (compatibilidad) ----------
def detect_bacteria_from_image(image_path: str) -> dict:
    """
    Conserva nombre histórico pero retorna dict completo.
    """
    result = analyze_bacteria(image_path)
    if "error" in result:
        return {"bacteria": "UNKNOWN", "analysis": result}
    return {"bacteria": result["bacteria"], "analysis": result}

# ---------- ENDPOINTS ----------
@app.post("/upload_image/")
async def upload_image(
    sample_id: str = Form(...),
    file: UploadFile = File(None),
    saved_image: Optional[str] = Form(None)  # nombre en disco si ya existe
):
    """
    - Si viene 'file': guarda, analiza y envía a MED.
    - Si viene 'saved_image': analiza ese archivo ya guardado y envía a MED.
    """
    if not file and not saved_image:
        return {"error": "Debe enviar un 'file' o 'saved_image'."}

    if file:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{sample_id}_{timestamp}.jpg"
        save_path = os.path.join(IMAGES_DIR, filename)
        with open(save_path, "wb") as f:
            f.write(await file.read())
    else:
        filename = os.path.basename(saved_image)
        save_path = os.path.join(IMAGES_DIR, filename)
        if not os.path.exists(save_path):
            return {"error": f"Archivo no encontrado: {save_path}"}

    result = detect_bacteria_from_image(save_path)
    bacteria = result["bacteria"]
    analysis = result["analysis"]

    med_response = _post_to_med(sample_id, bacteria, notes=f"Imagen: {filename}")

    _save_capture_meta(sample_id, filename, bacteria=bacteria, notes="upload_image")

    return {
        "message": "✅ Capturada y enviada a MED",
        "saved_as": filename,
        "bacteria_detected": bacteria,
        "analysis": analysis,
        "med_response": med_response,
        "image_url": f"{LAB_HOST}/{IMAGES_DIR}/{filename}"
    }

@app.post("/capture_from_openmv/")
def capture_from_openmv():
    """
    Ordena a la OpenMV tomar foto (comando 'C'), analiza y envía a MED.
    Devuelve también la imagen como base64 para previsualizar en el front.
    """
    try:
        result = capture_single_image(OPENMV_PORT)

        # Si la función devuelve un dict (nuevo formato)
        if isinstance(result, dict):
            image_path = result["path"]
            image_base64 = result.get("image_base64", None)
        else:
            # compatibilidad con versiones anteriores
            image_path = result
            image_base64 = None

        sample_id = "openmv_" + datetime.now().strftime("%H%M%S")

        result_analysis = detect_bacteria_from_image(image_path)
        bacteria = result_analysis["bacteria"]
        analysis = result_analysis["analysis"]

        med_response = _post_to_med(sample_id, bacteria, notes=f"Imagen: {os.path.basename(image_path)}")

        _save_capture_meta(sample_id, os.path.basename(image_path), bacteria=bacteria, notes="capture_from_openmv")

        if not image_base64:
            with open(image_path, "rb") as f:
                image_base64 = base64.b64encode(f.read()).decode()

        return {
            "message": "📸 Imagen tomada desde OpenMV",
            "saved_as": os.path.basename(image_path),
            "bacteria": bacteria,
            "analysis": analysis,
            "med_response": med_response,
            "image_base64": image_base64,
            "image_url": f"{LAB_HOST}/{IMAGES_DIR}/{os.path.basename(image_path)}"
        }

    except Exception as e:
        return {"error": str(e)}


@app.get("/last_image")
def last_image():
    images = sorted([p for p in os.listdir(IMAGES_DIR) if p.lower().endswith((".jpg", ".jpeg", ".png"))])
    if not images:
        return {"message": "No hay imágenes todavía"}
    last = images[-1]
    return {"image": last, "image_url": f"{LAB_HOST}/{IMAGES_DIR}/{last}"}

# ---------- Analizar imagen según registro de capturas ----------
from pydantic import BaseModel

class AnalyzeRequest(BaseModel):
    sample_id: str

@app.post("/analyze_image/")
async def analyze_image(req: AnalyzeRequest):
    """
    Busca la imagen asociada al sample_id en capturas.json, la analiza
    con detect_bacteria_from_image y devuelve los resultados.
    """
    try:
        sample_id = req.sample_id

        # Verifica si hay registros
        if not os.path.exists(CAPTURAS_JSON):
            return {"error": "No se encontró el archivo de capturas.json"}

        with open(CAPTURAS_JSON, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Busca las capturas que correspondan a este sample_id
        matches = [r for r in data if r.get("sample_id") == sample_id]
        if not matches:
            return {"error": f"No se encontró ninguna imagen para el sample_id {sample_id}"}

        # Escoge la última captura registrada
        matches.sort(key=lambda x: x.get("timestamp", ""))
        latest = matches[-1]
        image_path = latest.get("path")

        if not image_path or not os.path.exists(image_path):
            return {"error": f"Archivo no encontrado en disco: {image_path}"}

        # Analiza la imagen con tu función base
        result = detect_bacteria_from_image(image_path)

        return {
            "predicted_bacteria": result["bacteria"],
            "analysis": result["analysis"],
            "image_used": os.path.basename(image_path),
            "image_url": f"{LAB_HOST}/{image_path.replace('\\', '/')}"
        }

    except Exception as e:
        return {"error": f"Error procesando análisis: {str(e)}"}
