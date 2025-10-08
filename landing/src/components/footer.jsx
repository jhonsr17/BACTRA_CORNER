import React from 'react'
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

const columns = [
	{
		title: 'Product',
		links: ['Features', 'Pricing', 'Case studies', 'Reviews', 'Updates'],
	},
	{ title: 'Company', links: ['About', 'Contact us', 'Careers', 'Culture', 'Blog'] },
	{
		title: 'Support',
		links: ['Getting started', 'Help center', 'Server status', 'Report a bug', 'Chat support'],
	},
]

export default function Footer () {
	return (
		<footer className="border-t border-gray-100 bg-white">
			<div className="mx-auto max-w-6xl px-4 py-12">
				<div className="grid gap-8 md:grid-cols-4">
					<div>
						<div className="flex items-center gap-2">
							<div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-400 to-purple-500" />
							<span className="text-lg font-extrabold tracking-tight text-gray-900">BACTRA</span>
						</div>
						<p className="mt-3 max-w-xs text-sm text-gray-600">
							Revolucionando la salud de las comunidades
						</p>
						<div className="mt-4 flex items-center gap-3">
							<a href="#" className="text-gray-500 hover:text-gray-900" aria-label="Facebook">
								<Facebook className="h-5 w-5" />
							</a>
							<a href="#" className="text-gray-500 hover:text-gray-900" aria-label="Twitter">
								<Twitter className="h-5 w-5" />
							</a>
							<a href="#" className="text-gray-500 hover:text-gray-900" aria-label="Instagram">
								<Instagram className="h-5 w-5" />
							</a>
							<a href="#" className="text-gray-500 hover:text-gray-900" aria-label="LinkedIn">
								<Linkedin className="h-5 w-5" />
							</a>
						</div>
					</div>

					{columns.map((col) => (
						<div key={col.title}>
							<h4 className="text-sm font-semibold text-gray-900">{col.title}</h4>
							<ul className="mt-3 space-y-2 text-sm text-gray-600">
								{col.links.map((l) => (
									<li key={l}><a href="#" className="hover:text-gray-900">{l}</a></li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-gray-100 pt-6 text-xs text-gray-500 sm:flex-row">
					<p>© 2025 BACTRA</p>
					<p>
						<a href="#" className="hover:text-gray-900">Terms & Conditions</a>
						<span className="mx-2">|</span>
						<a href="#" className="hover:text-gray-900">Privacy Policy</a>
					</p>
				</div>
			</div>
		</footer>
	)
}


