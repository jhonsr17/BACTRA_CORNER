# MED Backend — FastAPI

Backend para BACTRA MED. Expone endpoints para listar, crear y aprobar
casos médicos en Supabase, con integración opcional a n8n para diagnóstico.

## Requisitos

- Python 3.11+
- Pipenv o venv + pip
- Credenciales de Supabase (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)

## Instalación

```bash
# Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Unix/macOS
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Variables de entorno

Crea un archivo `.env` en este directorio con al menos:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Opcional
N8N_DIAGNOSIS_URL=https://your-n8n/workflow/webhook
```

> Si necesitas cors personalizados, define `ALLOWED_ORIGINS` (separado por coma).

## Ejecutar en desarrollo

```bash
# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1
uvicorn app:app --reload --host 0.0.0.0 --port 5177

# Unix/macOS
source .venv/bin/activate
uvicorn app:app --reload --host 0.0.0.0 --port 5177
```

## Endpoints

- `GET /health` — estado del servicio
- `GET /` — lista de rutas
- `GET /med/cases?status=PENDING|DRAFT_READY|APPROVED` — lista casos
- `POST /med/cases` — crea caso en estado `PENDING`
- `POST /med/approve` — aprueba un caso (`{ case_id }`)
- `GET /med/case/{id}` — obtiene caso y, si `N8N_DIAGNOSIS_URL` existe, 
  enriquece con diagnóstico del webhook

## Notas de base de datos

Se usa una tabla `med_cases` con columnas sugeridas:

```sql
create extension if not exists pgcrypto;

create table if not exists med_cases (
  id uuid primary key default gen_random_uuid(),
  sample_id text not null,
  bacteria text,
  notes text,
  status text default 'PENDING',
  created_at timestamptz default now()
);
```

> Ajusta nombres/columnas según tu esquema real si ya existe.

## Producción

- Ejecuta con `uvicorn app:app --host 0.0.0.0 --port 5177` detrás de un 
  reverse proxy (Nginx/Caddy) o usa un process manager (pm2, systemd, 
  supervisord).
- Asegura variables de entorno mediante un secreto del sistema.


