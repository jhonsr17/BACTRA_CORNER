import React from 'react'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import Button from './ui/button'
import { UserRound, Mail, Search } from 'lucide-react'

export default function Hero () {
	return (
		<section id="home" className="relative isolate">
			<div className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:pt-16">
				<div className="mx-auto max-w-3xl text-center">
					<div className="mb-4 flex justify-center">
						<Badge>Health Matters ❤️</Badge>
					</div>
					<h1 className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
						Tu diagnóstico en cuestión de minutos
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-base text-text-secondary sm:text-lg">
						Los largos horas esperando resultados se han acabado. Tu tranquilidad,
						garantizado al instante.
					</p>

					<div className="mx-auto mt-8 max-w-xl">
						<div className="animated-border">
							<div className="flex items-center gap-2 rounded-full bg-white p-2 shadow-soft">
								<Input aria-label="Quiero ser parte" placeholder="Quiero ser parte" />
								<div className="flex items-center gap-1">
									<Button variant="ghost" aria-label="Usuario" className="h-10 w-10 rounded-full">
										<UserRound className="h-5 w-5 text-gray-600" />
									</Button>
									<Button variant="ghost" aria-label="Correo" className="h-10 w-10 rounded-full">
										<Mail className="h-5 w-5 text-gray-600" />
									</Button>
									<Button variant="gradient" aria-label="Buscar" className="h-10 px-4">
										<Search className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}


