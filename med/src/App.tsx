import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CaseDetail from './pages/CaseDetail'

export default function App () {
	return (
		<div className='min-h-screen'>
			<header className='sticky top-0 border-b bg-white/80 backdrop-blur'>
				<div className='mx-auto max-w-5xl px-4 py-3 flex items-center justify-between'>
					<Link to='/med' className='flex items-center gap-2'>
						<div className='h-6 w-6 rounded-full bg-gradient-to-r from-pink-400 to-purple-500' />
						<span className='text-lg font-bold'>BactraMED</span>
					</Link>
					<p className='text-xs text-gray-500'>Borrador educativo: requiere revisión médica.</p>
				</div>
			</header>
			<main className='mx-auto max-w-5xl px-4 py-6'>
				<Routes>
					<Route path='/' element={<Navigate to='/med' replace />} />
					<Route path='/med' element={<Dashboard />} />
					<Route path='/med/case/:id' element={<CaseDetail />} />
					<Route path='*' element={<Navigate to='/med' replace />} />
				</Routes>
			</main>
		</div>
	)
}


