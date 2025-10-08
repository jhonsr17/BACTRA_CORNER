import React, { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'
import { predictSpecies, Test } from '../lib/predict'

const testSchema = z.union([z.literal('POS'), z.literal('NEG'), z.literal('ND')])
const schema = z.object({
	patient_name: z.string().min(1, 'Requerido'),
	patient_ref: z.string().min(1, 'Requerido'),
	indole: testSchema,
	motility: testSchema,
})

type FormData = z.infer<typeof schema>

export default function NewCase () {
	const navigate = useNavigate()
	const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: { indole: 'ND', motility: 'ND' },
	})

	const indole = useWatch({ control, name: 'indole' }) as Test
	const motility = useWatch({ control, name: 'motility' }) as Test
	const predicted = useMemo(() => predictSpecies(indole ?? 'ND', motility ?? 'ND'), [indole, motility])

	const onSubmit = async (values: FormData) => {
		const { data, error } = await supabase
			.from('cases')
			.insert({
				patient_name: values.patient_name,
				patient_ref: values.patient_ref,
				indole: values.indole,
				motility: values.motility,
				predicted,
				status: 'pending',
			})
			.select('id')
			.single()

		if (error) {
			alert(`Error creando caso: ${error.message}`)
			return
		}

		navigate(`/capture/${data!.id}`)
	}

	return (
		<div className='rounded-2xl border bg-white p-6 shadow-sm'>
			<h1 className='text-2xl font-bold'>Nuevo caso</h1>
			<p className='mt-1 text-sm text-gray-600'>Crea un caso con resultados preliminares.</p>

			<form onSubmit={handleSubmit(onSubmit)} className='mt-6 space-y-4'>
				<div>
					<label className='block text-sm font-medium'>Nombre del paciente</label>
					<input {...register('patient_name')} className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary' />
					{errors.patient_name && <p className='mt-1 text-sm text-red-600'>{errors.patient_name.message}</p>}
				</div>
				<div>
					<label className='block text-sm font-medium'>Referencia del paciente</label>
					<input {...register('patient_ref')} className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary' />
					{errors.patient_ref && <p className='mt-1 text-sm text-red-600'>{errors.patient_ref.message}</p>}
				</div>
				<div className='grid gap-4 sm:grid-cols-2'>
					<div>
						<p className='text-sm font-medium'>INDOL</p>
						<div className='mt-1 flex gap-4 text-sm'>
							<label className='flex items-center gap-1'><input type='radio' value='POS' {...register('indole')} /> POS</label>
							<label className='flex items-center gap-1'><input type='radio' value='NEG' {...register('indole')} /> NEG</label>
							<label className='flex items-center gap-1'><input type='radio' value='ND' {...register('indole')} /> ND</label>
						</div>
					</div>
					<div>
						<p className='text-sm font-medium'>MOTILIDAD</p>
						<div className='mt-1 flex gap-4 text-sm'>
							<label className='flex items-center gap-1'><input type='radio' value='POS' {...register('motility')} /> POS</label>
							<label className='flex items-center gap-1'><input type='radio' value='NEG' {...register('motility')} /> NEG</label>
							<label className='flex items-center gap-1'><input type='radio' value='ND' {...register('motility')} /> ND</label>
						</div>
					</div>
				</div>

				<div className='rounded-lg border bg-gray-50 p-3 text-sm'>
					Predicción: <span className='font-semibold'>{predicted}</span>
				</div>

				<Button type='submit' disabled={isSubmitting}>Crear y continuar</Button>
			</form>
		</div>
	)
}


