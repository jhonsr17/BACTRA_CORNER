import React, { useState } from 'react'
import Button from './ui/button'
import MedLabLauncher from './med-lab-launcher'
import { Menu, X } from 'lucide-react'

const navItems = [
	{ href: '#home', label: 'Home' },
	{ href: '#about', label: 'About Us' },
	{ href: '#product', label: 'Producto' },
]

export default function Header () {
	const [isOpen, setIsOpen] = useState(false)

	const handleToggle = () => setIsOpen((v) => !v)
	const handleClose = () => setIsOpen(false)

	return (
		<header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
				<a href="#home" className="flex items-center gap-2" aria-label="BACTRA">
					<div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-400 to-purple-500" />
					<span className="text-lg font-extrabold tracking-tight text-gray-900">BACTRA</span>
				</a>

				<nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
					{navItems.map((item) => (
						<a key={item.href} href={item.href} className="text-sm font-medium text-gray-600 hover:text-gray-900">
							{item.label}
						</a>
					))}
				</nav>

				<div className="hidden md:block">
					<MedLabLauncher />
				</div>

				<button
					className="md:hidden rounded-full p-2 hover:bg-gray-100"
					aria-label="Abrir menú"
					onClick={handleToggle}
				>
					{isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
				</button>
			</div>

			{isOpen && (
				<div className="md:hidden border-t border-gray-100 bg-white">
					<div className="mx-auto max-w-6xl px-4 py-4">
						<div className="flex flex-col gap-4">
							{navItems.map((item) => (
								<a key={item.href} href={item.href} onClick={handleClose} className="text-sm font-medium text-gray-700">
									{item.label}
								</a>
							))}
							<MedLabLauncher className="pt-2" />
						</div>
					</div>
				</div>
			)}
		</header>
	)
}


