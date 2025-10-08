import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Stethoscope, TestTube2, Smartphone } from 'lucide-react'

const items = [
	{
		key: 'med',
		icon: Stethoscope,
		title: 'MED',
		desc: 'Dashboard médico con pacientes, reportes y soporte clínico.',
	},
	{
		key: 'lab',
		icon: TestTube2,
		title: 'LAB',
		desc: 'Carga de pruebas, integración con IA, reducción de tiempos.',
	},
	{
		key: 'life',
		icon: Smartphone,
		title: 'LIFE',
		desc: 'Aplicaciones móviles para pacientes, notificaciones y resultados.',
	},
]

export default function SolutionCards () {
	return (
		<section id="product" className="mx-auto max-w-6xl px-4 py-12">
			<h2 className="text-center text-2xl font-extrabold text-gray-900">
				Nuestra solución
			</h2>
			<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{items.map(({ key, icon: Icon, title, desc }) => (
					<Card
						key={key}
						className="transition-transform hover:scale-[1.02] hover:shadow-lg"
					>
						<CardHeader>
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-pink-400 to-purple-500 text-white">
								<Icon className="h-5 w-5" />
							</div>
							<CardTitle>{title}</CardTitle>
						</CardHeader>
						<CardContent>{desc}</CardContent>
					</Card>
				))}
			</div>
		</section>
	)
}


