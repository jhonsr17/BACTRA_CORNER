// src/pages/NewCase.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../components/Button'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const testSchema = z.union([z.literal('POS'), z.literal('NEG'), z.literal('ND')])
const schema = z.object({
  patient_name: z.string().min(1, 'Requerido'),
  patient_ref: z.string().min(1, 'Requerido'),
  indole: testSchema,
  motility: testSchema,
})

type FormData = z.infer<typeof schema>

export default function NewCase() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { indole: 'ND', motility: 'ND' },
  })

  const onSubmit = async (values: FormData) => {
    const { data, error } = await supabase
      .from('cases')
      .insert({
        patient_name: values.patient_name,
        patient_ref: values.patient_ref,
        indole: values.indole,
        motility: values.motility,
        status: 'PENDING',
      })
      .select('id')
      .single()

    if (error) {
      alert(`Error: ${error.message}`)
      return
    }

    // ✅ redirigir al componente Capture con el id del caso
    navigate(`/capture/${data.id}`)
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-6">
      <h1 className="text-2xl font-bold text-[#6F3DE8]">Nuevo Caso</h1>
      <p className="text-gray-600 text-sm">Llena los datos del paciente y luego captura o sube la imagen.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('patient_name')} placeholder="Nombre del paciente" className="input" />
        {errors.patient_name && <p className="text-red-600 text-sm">{errors.patient_name.message}</p>}

        <input {...register('patient_ref')} placeholder="Referencia" className="input" />
        {errors.patient_ref && <p className="text-red-600 text-sm">{errors.patient_ref.message}</p>}

        <select {...register('indole')} className="input">
          <option>POS</option><option>NEG</option><option>ND</option>
        </select>

        <select {...register('motility')} className="input">
          <option>POS</option><option>NEG</option><option>ND</option>
        </select>

        <Button type="submit" disabled={isSubmitting}>
          Guardar datos del paciente
        </Button>
      </form>
    </div>
  )
}
