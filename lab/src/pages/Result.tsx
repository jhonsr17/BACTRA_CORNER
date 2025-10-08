import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'
import { MED_API_URL } from '../lib/config'

type Test = 'POS' | 'NEG' | 'ND'
type Species = 'E_COLI' | 'SHIGELLA' | 'INCONCLUSO'

type CaseRow = {
    id: string
    patient_name: string
    indole: Test
    motility: Test
    predicted: Species | null
}

export default function Result () {
	const { id } = useParams()
	const [row, setRow] = useState<CaseRow | null>(null)
	const [sent, setSent] = useState(false)

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

    const handleForward = async () => {
        try {
            if (!row) return
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
            // opcional: actualizar estado local en Supabase si quieres reflejar envío
            await supabase
                .from('cases')
                .update({ status: 'sent_to_med' as any })
                .eq('id', id)
            setSent(true)
        } catch (e: any) {
            alert(`Error enviando a MED: ${e.message || e}`)
        }
    }

	if (!row) return <p>Cargando…</p>

	return (
		<div className='space-y-4 rounded-2xl border bg-white p-6 shadow-sm'>
			<h1 className='text-2xl font-bold'>Resultado</h1>
            <div className='grid gap-2 text-sm'>
				<p><strong>Paciente:</strong> {row.patient_name}</p>
                <p><strong>INDOL:</strong> {row.indole}</p>
                <p><strong>MOTILIDAD:</strong> {row.motility}</p>
                <p><strong>Predicción:</strong> {row.predicted ?? 'INCONCLUSO'}</p>
			</div>
			<div className='pt-2'>
				<Button onClick={handleForward} disabled={sent}>{sent ? 'Enviado a MED' : 'Enviar a MED'}</Button>
				{sent && <p className='mt-2 text-sm text-green-600'>Caso reenviado correctamente.</p>}
			</div>
		</div>
	)
}


