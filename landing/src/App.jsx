import React from 'react'
import Header from './components/header'
import Hero from './components/hero'
import SolutionCards from './components/solution-cards'
import CTA from './components/cta'
import Footer from './components/footer'

export default function App () {
	return (
		<div className="min-h-screen bg-gray-50 text-text-primary">
			<Header />
			<main>
				<Hero />
				<section id="about" className="mx-auto max-w-6xl px-4 py-6">
					<p className="sr-only">Sección Acerca de</p>
				</section>
				<SolutionCards />
				<CTA />
			</main>
			<Footer />
		</div>
	)
}


