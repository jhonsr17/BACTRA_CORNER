## BACTRA MED — Dashboard Médico

**BACTRA** es una plataforma de diagnóstico asistido por IA para laboratorios
clínicos y médicos. Este repositorio corresponde a **BACTRA MED**, el
dashboard médico que recibe y presenta los casos confirmados desde BACTRA LAB.

### 🌟 Contexto del Proyecto

- **BACTRA LAB**: Registro de pruebas microbiológicas (p. ej., indol, motilidad)
  y detección de la bacteria asociada.
- **BACTRA MED**: Recepción de casos reenviados desde LAB y soporte al médico
  (visualización y futuras recomendaciones terapéuticas asistidas por IA y
  agente de voz).

---

## 🔄 Flujo General

### 1) Creación de caso en BACTRA LAB
1. Se registran pruebas de laboratorio (indol, motilidad).
2. Se detecta la especie bacteriana.
3. El caso se guarda en la base de datos (`case`).

### 2) Forward del caso a BACTRA MED
1. En LAB se pulsa el botón "Enviar a MED".
2. El backend marca `forwarded_to_med = true` y `forwarded_at = now()`.
3. El caso pasa a estar disponible en la vista `med_inbox_view`.

### 3) Visualización en BACTRA MED
1. MED consume el endpoint `GET /med/cases`.
2. En el dashboard se listan únicamente los casos reenviados.
3. Cada caso muestra: paciente, bacteria detectada, fecha de reenvío.

---

## 🧱 Modelo de Datos (resumen)

- **Tabla `case`** (campos relevantes)
  - `id`
  - `patient_id`
  - `bacteria_detected`
  - `forwarded_to_med` (boolean)
  - `forwarded_at` (timestamp)

- **Vista `med_inbox_view`**
  - Provee los casos con `forwarded_to_med = true` para consumo en MED.

- **Tabla `med_recommendations`** (futuro MVP++)
  - `id`
  - `case_id`
  - `recommendation`
  - `source` (p. ej., `n8n`, `ai`)
  - `created_at`

---

## 🔌 API (MED)

- `GET /med/cases`
  - Retorna la lista de casos reenviados (derivados de `med_inbox_view`).
  - Campos esperados por tarjeta del dashboard: paciente, bacteria detectada,
    fecha de reenvío (`forwarded_at`).

---

## 🖥️ Dashboard (BACTRA MED)

- Lista únicamente casos con `forwarded_to_med = true`.
- Para cada caso, se presenta:
  - **Paciente**
  - **Bacteria detectada**
  - **Fecha de reenvío** (`forwarded_at`)

---

## 🚀 Extensiones futuras (MVP++)

- Orquestación con **n8n** para generar recomendaciones médicas.
  - Las recomendaciones se asocian por `case_id` en `med_recommendations`.
- **ElevenLabs/Twilio** para notificar al paciente mediante voz.
- Integración de agente de voz y modelos de IA para soporte terapéutico.

---

## 📌 Estado del repositorio

Este repositorio aloja únicamente **BACTRA MED (dashboard médico)** y su
integración con el flujo de casos reenviados desde BACTRA LAB.


