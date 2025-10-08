import React from 'react'
import Button from './ui/button'

export default function CTA () {
	return (
		<section className="bg-brand-dark">
			<div className="mx-auto max-w-6xl px-4 py-12">
				<div className="rounded-3xl bg-brand-dark p-8 text-center text-white">
					<h3 className="text-2xl font-bold sm:text-3xl">
						Sé de los primeros en experimentar el futuro de la salud
					</h3>
					<div className="mt-6">
						<Button variant="gradient" aria-label="Ver Demo" onClick={() => {}}>
							Ver Demo
						</Button>
					</div>
				</div>
			</div>
		</section>
	)
}


