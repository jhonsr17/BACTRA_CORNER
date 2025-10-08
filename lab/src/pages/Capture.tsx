import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'

type Test = 'POS' | 'NEG' | 'ND'
type Species = 'E_COLI' | 'SHIGELLA' | 'INCONCLUSO'

type CaseRow = {
    id: string
    patient_name: string
    patient_ref: string
    indole: Test
    motility: Test
    predicted: Species
}

const predictSpecies = (indole: Test, motility: Test): Species => {
    if (indole === 'POS' && motility === 'POS') return 'E_COLI'
    if (indole === 'NEG' && motility === 'NEG') return 'SHIGELLA'
    return 'INCONCLUSO'
}

export default function Capture () {
	const { id } = useParams()
	const navigate = useNavigate()
	const [row, setRow] = useState<CaseRow | null>(null)
	const [filePreview, setFilePreview] = useState<string | null>(null)

	useEffect(() => {
		const fetchCase = async () => {
			const { data, error } = await supabase
				.from('cases')
				.select('*')
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

    const species = useMemo(() => {
        if (!row) return 'INCONCLUSO' as Species
        return predictSpecies(row.indole, row.motility)
    }, [row])

	const handleSimulate = async () => {
        const { error } = await supabase
            .from('cases')
            .update({ predicted: species, status: 'analyzed' })
			.eq('id', id)
		if (error) {
			alert(`Error actualizando especie: ${error.message}`)
			return
		}
		navigate(`/result/${id}`)
	}

	if (!row) return <p>Cargando…</p>

	return (
		<div className='space-y-6 rounded-2xl border bg-white p-6 shadow-sm'>
			<div>
				<h1 className='text-2xl font-bold'>Captura</h1>
				<p className='text-sm text-gray-600'>Paciente: {row.patient_name} — Ref: {row.patient_ref}</p>
			</div>

			<div className='grid gap-4 sm:grid-cols-2'>
				<div>
					<label className='block text-sm font-medium'>Archivo (opcional)</label>
					<input
						type='file'
						accept='image/*'
						onChange={(e) => {
							const f = e.target.files?.[0]
							if (!f) return setFilePreview(null)
							const url = URL.createObjectURL(f)
							setFilePreview(url)
						}}
						className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2'
					/>
				</div>
				<div className='rounded-lg border bg-gray-50 p-4'>
					<p className='text-sm'>INDOL: <strong>{row.indole}</strong></p>
					<p className='text-sm'>MOTILIDAD: <strong>{row.motility}</strong></p>
					<p className='mt-2 text-sm'>Especie simulada: <span className='font-semibold'>{species}</span></p>
				</div>
			</div>

			{filePreview && (
				<div className='overflow-hidden rounded-xl border'>
					<img src={filePreview} alt='preview' className='h-64 w-full object-cover' />
				</div>
			)}

			<Button onClick={handleSimulate}>Simular detección</Button>
		</div>
	)
}


