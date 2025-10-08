import React from 'react'
import { Outlet, Link } from 'react-router-dom'

export default function Layout () {
	return (
		<div className='min-h-screen'>
			<header className='sticky top-0 z-40 border-b bg-white/80 backdrop-blur'>
				<div className='mx-auto max-w-4xl px-4 py-3 flex items-center justify-between'>
					<Link to='/' className='flex items-center gap-2' aria-label='BactraLAB'>
						<div className='h-6 w-6 rounded-full bg-gradient-to-r from-pink-400 to-purple-500' />
						<span className='text-lg font-bold'>BactraLAB</span>
					</Link>
					<nav className='text-sm text-gray-600'>
						<a href='/' className='hover:text-gray-900'>Nuevo caso</a>
					</nav>
				</div>
			</header>
			<main className='mx-auto max-w-4xl px-4 py-6'>
				<Outlet />
			</main>
		</div>
	)
}


