from fastapi import FastAPI, HTTPException, Query
from fastapi.routing import APIRoute
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import requests
import json

load_dotenv(override=True)

from supabase import create_client, Client  

app = FastAPI()

origins_env = os.getenv('ALLOWED_ORIGINS')
if origins_env:
    origins = [o.strip() for o in origins_env.split(',') if o.strip()]
else:
    origins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://localhost',
        'http://127.0.0.1',
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_SERVICE_KEY')

supabase: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


class MedCaseIn(BaseModel):
    sample_id: str | int
    bacteria: str
    notes: str | None = None


class ApproveIn(BaseModel):
    case_id: str


@app.get('/health')
def health():
    return {'status': 'ok', 'supabase_url': SUPABASE_URL}


@app.get('/')
def list_routes():
    routes = [r.path for r in app.routes if isinstance(r, APIRoute)]
    return { 'routes': routes }


@app.get('/med/cases')
def get_cases(status: str = Query('PENDING', pattern='^(PENDING|DRAFT_READY|APPROVED)$')):
    if not supabase:
        raise HTTPException(status_code=503, detail='Supabase not configured')
    q = (
        supabase
        .table('med_cases')
        .select('*')
        .eq('status', status)
        .order('created_at', desc=True)
    )
    data = q.execute().data
    return {'status': status, 'cases': data}


@app.post('/med/cases')
def create_case(case: MedCaseIn):
    if not supabase:
        raise HTTPException(status_code=503, detail='Supabase not configured')
    payload = {
        'sample_id': str(case.sample_id),
        'bacteria': case.bacteria,
        'notes': case.notes or None,
        'status': 'PENDING',
    }
    res = supabase.table('med_cases').insert(payload).execute()
    data = (res.data[0] if isinstance(res.data, list) and res.data else res.data)
    return {'message': 'Case received in MED', 'case': data}


@app.post('/med/approve')
def approve_case(body: ApproveIn):
    if not supabase:
        raise HTTPException(status_code=503, detail='Supabase not configured')
    res = (
        supabase
        .table('med_cases')
        .update({'status': 'APPROVED'})
        .eq('id', body.case_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=404, detail='Case not found')
    data = (res.data[0] if isinstance(res.data, list) and res.data else res.data)
    return {'message': 'Case approved', 'case': data}


@app.get('/med/case/{case_id}')
def get_case(case_id: str):
    if not supabase:
        raise HTTPException(status_code=503, detail='Supabase not configured')

    try:
        res = (
            supabase
            .table('med_cases')
            .select('*')
            .eq('id', case_id)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Supabase error: {e}')

    if not res.data:
        raise HTTPException(status_code=404, detail='Case not found')

    case = res.data[0]

    diagnosis: str | dict | None = None
    n8n_url = os.getenv('N8N_DIAGNOSIS_URL')
    if n8n_url:
        try:
            payload = {
                'sample_id': case.get('sample_id'),
                'bacteria': case.get('bacteria') or case.get('species'),
                'notes': case.get('notes'),
                'status': case.get('status') or case.get('ai_status'),
            }
            r = requests.post(n8n_url, json=payload, timeout=15)
            r.raise_for_status()
            if 'application/json' in (r.headers.get('content-type') or '').lower():
                body = r.json()
                output_text = None
                if isinstance(body, dict) and isinstance(body.get('output'), str):
                    output_text = body.get('output')
                if output_text:
                    cleaned = output_text.strip().strip('`').strip()
                    if cleaned.lower().startswith('json'):
                        cleaned = cleaned[4:].lstrip()  # remove leading 'json'
                    try:
                        diagnosis = json.loads(cleaned)
                    except Exception:
                        diagnosis = {'error': cleaned}
                else:
                    if isinstance(body.get('diagnosis'), (dict, list, str)):
                        diagnosis = body.get('diagnosis')
                    elif isinstance(body.get('summary'), (dict, list, str)):
                        diagnosis = body.get('summary')
                    else:
                        diagnosis = body
            else:
                txt = r.text or ''
                fenced = txt.strip().strip('`').strip()
                if fenced.lower().startswith('json'):
                    fenced = fenced[4:].lstrip()
                try:
                    diagnosis = json.loads(fenced)
                except Exception:
                    diagnosis = txt
        except Exception as e:
            diagnosis = f'Error al obtener diagnóstico: {e}'
    else:
        diagnosis = 'Sin webhook de n8n configurado (N8N_DIAGNOSIS_URL).'

    case['diagnosis'] = diagnosis
    return { 'case': case }

