from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os

app = FastAPI()

MED_API_URL = os.getenv('MED_API_URL', 'http://localhost:5177')


@app.get('/health')
def health():
    return { 'status': 'ok', 'forward_to': MED_API_URL }


class LabCaseIn(BaseModel):
    sample_id: str | int
    bacteria: str
    notes: str | None = None


@app.post('/lab/cases')
def send_case(case: LabCaseIn):
    url = f"{MED_API_URL}/med/cases"
    payload = {
        'sample_id': str(case.sample_id),
        'bacteria': case.bacteria,
        'notes': case.notes or None,
    }
    resp = requests.post(url, json=payload, timeout=10)
    try:
        med_json = resp.json()
    except Exception:
        med_json = { 'status_code': resp.status_code, 'text': resp.text }
    return {
        'message': 'Case sent to MED',
        'sent': payload,
        'med_response': med_json
    }


