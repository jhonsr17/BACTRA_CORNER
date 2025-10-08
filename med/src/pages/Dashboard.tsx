import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from '../lib/api'

type CaseRow = {
	id: string
	patientNameOrSample: string
	species: string | null
	diagnosis?: string | null
	ai_status: 'PENDING' | 'DRAFT_READY' | 'APPROVED'
	created_at: string
}

type RawCase = {
	id?: string
	sample_id?: string
	patient_name?: string | null
	bacteria?: string | null
	species?: string | null
	ai_status?: 'PENDING' | 'DRAFT_READY' | 'APPROVED' | string
	status?: 'PENDING' | 'DRAFT_READY' | 'APPROVED' | string
	created_at?: string
	diagnosis?: string | null
}

const normalizeCase = (c: RawCase): CaseRow => {
	const id = c.id ?? ''
	const patientNameOrSample = (c.patient_name && c.patient_name.trim().length > 0)
		? c.patient_name
		: (c.sample_id ?? '-')
	const species = c.species ?? c.bacteria ?? null
	const ai_status = ((c.ai_status ?? c.status) as CaseRow['ai_status']) || 'PENDING'
	const created_at = c.created_at ?? new Date().toISOString()
	return {
		id,
		patientNameOrSample,
		species,
		diagnosis: c.diagnosis ?? null,
		ai_status,
		created_at,
	}
}

const tabs: Array<{ key: 'PENDING' | 'DRAFT_READY' | 'APPROVED', label: string }> = [
    { key: 'PENDING', label: 'Pendientes' },
    { key: 'DRAFT_READY', label: 'IA lista' },
    { key: 'APPROVED', label: 'Aprobados' },
]

export default function Dashboard () {
	const [status, setStatus] = useState<'PENDING' | 'DRAFT_READY' | 'APPROVED'>('PENDING')
	const [rows, setRows] = useState<CaseRow[]>([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		setLoading(true)
		apiGet(`/med/cases?status=${status}`)
			.then((res) => {
				const list = Array.isArray(res) ? res : (res?.cases ?? [])
				setRows(list.map(normalizeCase))
			})
			.finally(() => setLoading(false))
	}, [status])

    return (
        <div className='space-y-4'>
            <div className='flex gap-2'>
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setStatus(t.key)}
                        className={`rounded-full px-4 py-2 text-sm border transition ${status === t.key ? 'bg-primary text-white' : 'bg-white hover:bg-gray-50'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className='overflow-hidden rounded-xl border bg-white'>
                <table className='min-w-full text-sm'>
                    <thead className='bg-gray-50 text-gray-600'>
                        <tr>
                            <th className='px-4 py-2 text-left'>Paciente / Sample</th>
                            <th className='px-4 py-2 text-left'>Bacteria</th>
                            <th className='px-4 py-2 text-left'>Diagnóstico</th>
                            <th className='px-4 py-2 text-left'>Fecha</th>
                            <th className='px-4 py-2 text-left'>Estado</th>
                            <th className='px-4 py-2 text-left'>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className='px-4 py-6 text-center text-gray-500'>Cargando…</td></tr>
                        ) : rows.length === 0 ? (
                            <tr><td colSpan={6} className='px-4 py-6 text-center text-gray-500'>Sin registros</td></tr>
                        ) : rows.map(r => (
                            <tr key={r.id} className='border-t'>
                                <td className='px-4 py-2'>{r.patientNameOrSample}</td>
                                <td className='px-4 py-2'>{r.species ?? '-'}</td>
                                <td className='px-4 py-2'>{r.diagnosis ?? '-'}</td>
                                <td className='px-4 py-2'>{new Date(r.created_at).toLocaleString()}</td>
                                <td className='px-4 py-2'>
                                    <span className={`rounded-full px-2 py-0.5 text-xs ${r.ai_status === 'APPROVED' ? 'bg-green-100 text-green-700' : r.ai_status === 'DRAFT_READY' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-800'}`}>{r.ai_status}</span>
                                </td>
                                <td className='px-4 py-2'>
                                    <Link to={`/med/case/${r.id}`} className='rounded-md border px-3 py-1 text-sm hover:bg-gray-50 text-primary'>Ver detalle</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}


