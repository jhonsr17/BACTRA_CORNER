import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiGet, apiPost, apiPatch } from '../lib/api'

type View = {
	case: any
	draft?: any
	final_report?: any
}

export default function CaseDetail () {
	const { id } = useParams()
	const navigate = useNavigate()
	const [data, setData] = useState<View | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

    const normalizeFromList = (rows: any[]) => {
        const list = Array.isArray(rows) ? rows : (rows?.cases ?? [])
        return list.find((r: any) => r.id === id)
    }

    const load = async () => {
        try {
            setLoading(true)
            setError(null)
            // 1) Intentar endpoint de detalle
            try {
                const res = await apiGet(`/med/case/${id}`)
                setData(res)
                return
            } catch (err: any) {
                if (!String(err?.message || '').includes('404')) throw err
                // 2) Fallback: buscar en listados por estado
                const [p, d, a] = await Promise.all([
                    apiGet('/med/cases?status=PENDING').catch(() => ({ cases: [] })),
                    apiGet('/med/cases?status=DRAFT_READY').catch(() => ({ cases: [] })),
                    apiGet('/med/cases?status=APPROVED').catch(() => ({ cases: [] })),
                ])
                const found = normalizeFromList(p) || normalizeFromList(d) || normalizeFromList(a)
                if (!found) {
                    setError('Caso no encontrado')
                    return
                }
                setData({ case: found })
            }
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

	useEffect(() => { load() }, [id])

	const [generating, setGenerating] = useState(false)
	const [approving, setApproving] = useState(false)

	const handleGenerateDraft = async () => {
		if (!id) return
		try {
			setGenerating(true)
			setError(null)
			// Llama SIEMPRE al backend MED (no a n8n directo)
			const res = await apiGet(`/med/case/${id}`)
			setData(res)
		} catch (e: any) {
			setError(e.message)
		} finally {
			setGenerating(false)
		}
	}

	const handleApprove = async () => {
		// backend actual espera { case_id } o rutas REST; probamos ambos
		setApproving(true)
		setError(null)
		try {
			// Preferido: PATCH /med/case/{id}/approve
			await apiPatch(`/med/case/${data!.case.id}/approve`)
		} catch {
			// Alternativas compatibles existentes
			try { await apiPost('/med/approve', { case_id: data!.case.id }) }
			catch { await apiPost(`/med/cases/${data!.case.id}/approve`, {}) }
		}
		await load()
		setApproving(false)
	}

    if (error) return <p className='text-red-600'>{error}</p>
	if (loading || !data) return <p>Cargando…</p>

	const { case: c, draft, final_report } = data

    return (
        <div className='space-y-4'>
            <div className='rounded-xl border bg-white p-4'>
                <div className='flex items-center gap-2'>
                    <div className='h-6 w-6 rounded-full bg-gradient-to-r from-pink-400 to-purple-500' />
                    <h2 className='text-lg font-bold'>Detalle del caso</h2>
                </div>
                <div className='mt-2 grid gap-2 text-sm sm:grid-cols-2'>
                    <p><strong>Sample / Paciente:</strong> {c.patient_name ?? c.sample_id ?? '-'}</p>
                    <p><strong>Bacteria:</strong> {c.species ?? c.bacteria ?? '-'}</p>
                    <p>
                        <strong>Estado:</strong>{' '}
                        <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                            (c.ai_status ?? c.status) === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            (c.ai_status ?? c.status) === 'DRAFT_READY' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {c.ai_status ?? c.status}
                        </span>
                    </p>
                </div>
            </div>

            <div className='rounded-xl border bg-white p-4 space-y-3'>
                <h3 className='font-semibold'>Datos del análisis</h3>
                <div className='text-sm text-gray-700 space-y-1'>
                    <p><strong>Bacteria detectada:</strong> {c.species ?? c.bacteria ?? '-'}</p>
                    <p><strong>Diagnóstico de la IA:</strong> {
                        typeof c?.diagnosis === 'object'
                            ? (c?.diagnosis?.diagnosis ?? c?.diagnosis?.summary ?? 'Sin draft generado (n8n)')
                            : (c?.diagnosis ?? 'Sin draft generado (n8n)')
                    }</p>
                    {typeof c?.diagnosis === 'object' && c?.diagnosis?.recommendation && (
                        <p><strong>Recomendación:</strong> {c.diagnosis.recommendation}</p>
                    )}
                </div>
                <div className='flex gap-2'>
                    <button onClick={handleGenerateDraft} disabled={generating} className={`rounded-full px-4 py-2 text-white ${generating ? 'bg-gray-400' : 'bg-gradient-to-r from-pink-400 to-purple-500'}`}>
                        {generating ? 'Generando borrador…' : 'Generar borrador IA'}
                    </button>
                    <button onClick={handleApprove} disabled={approving} className='rounded-md border px-4 py-2 hover:bg-gray-50'>
                        {approving ? 'Aprobando…' : 'Aprobar'}
                    </button>
                </div>
            </div>

            {c.ai_status === 'APPROVED' && (
                <div className='rounded-xl border bg-white p-4 space-y-3'>
                    <h3 className='font-semibold'>Reporte final</h3>
                    <pre className='overflow-auto rounded bg-gray-50 p-3 text-xs'>{JSON.stringify(final_report?.report ?? {}, null, 2)}</pre>
                    <p className='text-sm text-gray-500'>Aprobado: {final_report?.approved_at}</p>
                </div>
            )}
        </div>
    )
}


