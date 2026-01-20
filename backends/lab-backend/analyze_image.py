# analyze_image.py
import cv2
import numpy as np

def _crop_center_band(img, v_band=(0.25, 0.75), h_band=(0.30, 0.70)):
    h, w, _ = img.shape
    y0, y1 = int(h*v_band[0]), int(h*v_band[1])
    x0, x1 = int(w*h_band[0]), int(w*h_band[1])
    return img[y0:y1, x0:x1]

def _ratio_mask(hsv, lower, upper):
    mask = cv2.inRange(hsv, np.array(lower, dtype=np.uint8), np.array(upper, dtype=np.uint8))
    return (mask > 0).mean()

def analyze_bacteria(image_path: str):
    """
    Clasifica con pruebas proxy:
      - INDOL: rosado/rojizo (rojo en HSV) → POS ; amarillo → NEG ; otro → ND
      - MOTILIDAD: difuso → POS ; línea nítida (muchos bordes) → NEG
    Retorna dict con métricas para depuración.
    """
    img = cv2.imread(image_path)
    if img is None:
        return {"error": "Imagen no válida", "path": image_path}

    # Normalizar tamaño y recortar zona del tubo
    img = cv2.resize(img, (640, 480))
    crop = _crop_center_band(img)

    # --- Color (HSV) ---
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    hue = hsv[:, :, 0].astype(np.float32)

    # IMPORTANTE: OpenCV usa H ∈ [0,179]
    avg_hue = float(np.mean(hue))

    # Proporciones por color
    red_ratio = _ratio_mask(hsv, (0, 60, 60), (10, 255, 255)) + _ratio_mask(hsv, (160, 60, 60), (179, 255, 255))
    yellow_ratio = _ratio_mask(hsv, (20, 60, 60), (35, 255, 255))

    # INDOL
    if red_ratio >= 0.08:       # ~8% píxeles rojizos
        indole = "POS"
    elif yellow_ratio >= 0.08:  # ~8% píxeles amarillos
        indole = "NEG"
    else:
        indole = "ND"

    # --- Motilidad (nitidez vs difusión) ---
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (7, 7), 0)
    edges = cv2.Canny(blur, 40, 140)
    edge_density = float((edges > 0).mean())

    # Si hay línea bien definida (muchos bordes) → motilidad NEG
    motility = "NEG" if edge_density > 0.12 else "POS"

    # --- Heurística de especie (placeholder) ---
    if indole == "POS" and motility == "POS":
        bacteria = "E_COLI"
    elif indole == "NEG" and motility == "NEG":
        bacteria = "SHIGELLA"
    else:
        bacteria = "INCONCLUSO"

    return {
        "path": image_path,
        "indole": indole,
        "motility": motility,
        "bacteria": bacteria,
        "metrics": {
            "avg_hue": avg_hue,
            "red_ratio": red_ratio,
            "yellow_ratio": yellow_ratio,
            "edge_density": edge_density
        }
    }
