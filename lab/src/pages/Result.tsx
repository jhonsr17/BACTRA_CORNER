// src/pages/Result.tsx
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'
import { MED_API_URL } from '../lib/config'

type Test = 'POS' | 'NEG' | 'ND'
type Species = 'E_COLI' | 'SHIGELLA' | 'INCONCLUSO' | 'UNKNOWN'

type CaseRow = {
  id: string
  patient_name: string
  indole: Test
  motility: Test
  predicted: Species | null
}

export default function Result() {
  const { id } = useParams()
  const [row, setRow] = useState<CaseRow | null>(null)
  const [sent, setSent] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  // 🧩 1. Cargar caso desde Supabase
  useEffect(() => {
    const fetchCase = async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('id, patient_name, indole, motility, predicted')
        .eq('id', id)
        .single()
      if (error) {
        alert(`Error cargando caso: ${error.message}`)
        return
      }
      setRow(data as CaseRow)
    }
    fetchCase()
  }, [id])

  // 🧠 2. Analizar bacteria usando FastAPI /analyze_image/
const handleAnalyzeImage = async () => {
  if (!row?.id) {
    alert('⚠️ No se encontró el ID del caso para analizar.');
    return;
  }

  setAnalyzing(true);
  console.log("🧫 Analizando caso con sample_id:", row.id);

  try {
    const resp = await fetch("http://127.0.0.1:8000/analyze_image/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sample_id: row.id }),
    });

    const data = await resp.json();
    console.log("📦 Respuesta del backend:", data);

    if (!resp.ok || !data.predicted_bacteria) {
      const msg = data?.error || "Error analizando la imagen en el backend.";
      throw new Error(msg);
    }

    const predicted = data.predicted_bacteria;
    alert(`🧫 Bacteria detectada: ${predicted}`);

    await supabase.from("cases").update({ predicted }).eq("id", row.id);
    setRow((prev) => (prev ? { ...prev, predicted } : prev));
  } catch (err: any) {
    console.error("❌ Error analizando imagen:", err);
    alert(`Error analizando la imagen en el backend: ${err.message}`);
  } finally {
    setAnalyzing(false);
  }
};


  // 🚀 3. Enviar caso a MED
  const handleForward = async () => {
    if (!row) return
    try {
      const payload = {
        sample_id: row.id,
        bacteria: row.predicted ?? 'INCONCLUSO',
        notes: `forwarded from LAB for patient ${row.patient_name ?? ''}`,
      }
      const resp = await fetch(`${MED_API_URL}/med/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!resp.ok) {
        const text = await resp.text()
        throw new Error(text || `HTTP ${resp.status}`)
      }
      await supabase.from('cases').update({ status: 'sent_to_med' as any }).eq('id', id)
      setSent(true)
    } catch (e: any) {
      alert(`Error enviando a MED: ${e.message || e}`)
    }
  }

  if (!row) return <p>Cargando…</p>

  return (
    <div className='space-y-4 rounded-2xl border bg-white p-6 shadow-sm'>
      <h1 className='text-2xl font-bold'>Resultado del caso</h1>

      <div className='grid gap-2 text-sm'>
        <p><strong>Paciente:</strong> {row.patient_name}</p>
        <p><strong>INDOL:</strong> {row.indole}</p>
        <p><strong>MOTILIDAD:</strong> {row.motility}</p>
        <p>
          <strong>Predicción:</strong>{' '}
          {row.predicted ? row.predicted : '— Sin analizar —'}
        </p>
      </div>

      <div className='pt-2 flex flex-col gap-3 sm:flex-row'>
        <Button
          onClick={handleAnalyzeImage}
          disabled={analyzing || sent}
          className='flex-1'
        >
          {analyzing ? 'Analizando...' : 'Analizar Imagen'}
        </Button>

        <Button
          onClick={handleForward}
          disabled={sent || analyzing}
          className='flex-1'
        >
          {sent ? 'Enviado a MED' : 'Enviar a MED'}
        </Button>
      </div>

      {sent && (
        <p className='mt-2 text-sm text-green-600'>
          Caso reenviado correctamente.
        </p>
      )}
    </div>
  )
}
